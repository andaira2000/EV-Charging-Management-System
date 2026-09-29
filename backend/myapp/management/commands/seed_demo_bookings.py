"""Create realistic, past, paid demo bookings for the seller analytics.

    python manage.py seed_demo_bookings            # add / top up the demo history
    python manage.py seed_demo_bookings --delete   # remove it again

The first run creates six months of history. Later runs top it up from the
last demo booking until now, so the charts don't go quiet as days pass.
Bookings go to the demo buyers (emails ending in example.com) on every
seller's stations. All bookings end in the past and never overlap on a
station, and the random seed is fixed, so the same history is produced.
"""

import random
from datetime import datetime, timedelta
from decimal import ROUND_DOWN, Decimal
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from myapp.models import ChargingStation, Payment, Reservation, UserProfile

LOCAL_TZ = ZoneInfo("Europe/London")
DAYS_OF_HISTORY = 180

# Relative chance of a booking starting at each local hour (0-23): quiet at
# night, a morning commute peak, a lunchtime bump and a bigger evening peak.
HOUR_WEIGHTS = [
    0.1, 0.05, 0.05, 0.05, 0.1, 0.3, 0.8, 1.6, 2.0, 1.4, 1.0, 1.1,
    1.4, 1.3, 1.0, 1.0, 1.3, 1.9, 2.2, 1.8, 1.2, 0.8, 0.4, 0.2,
]


def demo_buyers():
    return UserProfile.objects.filter(role="buyer", email__endswith="example.com")


class Command(BaseCommand):
    help = "Create (or with --delete, remove) past demo bookings for the analytics."

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete the demo buyers' past paid bookings instead of creating them.",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        demo = Reservation.objects.filter(
            user__in=demo_buyers(), is_paid=True, end_time__lt=now
        )

        if options["delete"]:
            count = demo.count()
            demo.delete()  # Payments are deleted with their reservation.
            self.stdout.write(self.style.SUCCESS(f"Deleted {count} demo bookings."))
            return

        buyers = list(demo_buyers())
        stations = list(
            ChargingStation.objects.filter(operator__role="seller").order_by(
                "station_id"
            )
        )
        if not buyers or not stations:
            raise CommandError("Need demo buyers and seller stations first.")

        # Each station gets its own popularity, from quiet to busy; the same
        # values on every run.
        station_rng = random.Random(2026)
        popularity = {s.station_id: station_rng.uniform(0.35, 1.0) for s in stations}

        today = now.astimezone(LOCAL_TZ).date()
        history_start = today - timedelta(days=DAYS_OF_HISTORY)

        # Top up after the last demo booking, or start six months back.
        last_demo = demo.order_by("-start_time").first()
        cutoff = last_demo.start_time if last_demo else None
        first_day = (
            cutoff.astimezone(LOCAL_TZ).date() if cutoff else history_start
        )
        rng = random.Random(f"demo-{first_day.isoformat()}")

        # Slots already taken (by anyone) from the first day on, per station.
        taken = {s.station_id: [] for s in stations}
        for existing in Reservation.objects.filter(
            charging_station__in=stations,
            end_time__gt=datetime.combine(first_day, datetime.min.time(), tzinfo=LOCAL_TZ),
        ).values("charging_station_id", "start_time", "end_time"):
            taken[existing["charging_station_id"]].append(
                (existing["start_time"], existing["end_time"])
            )

        reservations, payments = [], []
        day = first_day
        while day <= today:
            weekend = 1.35 if day.weekday() >= 5 else 1.0
            # Demand grows slowly over the six months, then levels off.
            progress = min((day - history_start).days / DAYS_OF_HISTORY, 1)
            growth = 0.7 + 0.45 * progress

            for station in stations:
                expected = 2.2 * popularity[station.station_id] * weekend * growth
                count = sum(rng.random() < expected / 6 for _ in range(6))
                is_fast = station.charging_speed == "fast"
                booked = taken[station.station_id]

                for _ in range(count):
                    for _attempt in range(6):
                        hour = rng.choices(range(24), weights=HOUR_WEIGHTS)[0]
                        minute = rng.choice([0, 15, 30, 45])
                        minutes = (
                            rng.randrange(20, 65, 5)
                            if is_fast
                            else rng.randrange(60, 255, 15)
                        )
                        start = datetime(
                            day.year, day.month, day.day, hour, minute, tzinfo=LOCAL_TZ
                        )
                        end = start + timedelta(minutes=minutes)
                        overlaps = any(start < b_end and end > b_start for b_start, b_end in booked)
                        after_cutoff = cutoff is None or start > cutoff
                        if not overlaps and after_cutoff and end < now:
                            booked.append((start, end))
                            break
                    else:
                        continue  # no free slot found, skip this booking

                    booked_at = start - timedelta(hours=rng.uniform(0.2, 48))
                    reservation = Reservation(
                        user=rng.choice(buyers),
                        charging_station=station,
                        start_time=start,
                        end_time=end,
                        is_paid=True,
                        created_at=booked_at,
                    )
                    # Same formula as the Stripe checkout: kW x hours x price.
                    amount = (
                        Decimal(station.power_capacity)
                        * Decimal(minutes) / Decimal(60)
                        * Decimal(station.price_per_kwh)
                    ).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
                    reservations.append(reservation)
                    payments.append(
                        (reservation, amount, booked_at + timedelta(minutes=2))
                    )

            day += timedelta(days=1)

        # created_at / payment_date use auto_now_add; switch that off while
        # inserting so the history keeps its past dates.
        fields = [
            Reservation._meta.get_field("created_at"),
            Payment._meta.get_field("payment_date"),
        ]
        for field in fields:
            field.auto_now_add = False
        try:
            with transaction.atomic():
                Reservation.objects.bulk_create(reservations, batch_size=500)
                Payment.objects.bulk_create(
                    [
                        Payment(
                            user=reservation.user,
                            reservation=reservation,
                            amount=amount,
                            payment_date=paid_at,
                            location=reservation.charging_station.location,
                            start_time=reservation.start_time,
                            end_time=reservation.end_time,
                        )
                        for reservation, amount, paid_at in payments
                    ],
                    batch_size=500,
                )
        finally:
            for field in fields:
                field.auto_now_add = True

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(reservations)} demo bookings from "
                f"{first_day.isoformat()} until now on {len(stations)} stations."
            )
        )
