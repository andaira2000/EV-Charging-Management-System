from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.db.models import Count, DurationField, ExpressionWrapper, F, Sum
from django.db.models.functions import ExtractHour, ExtractIsoWeekDay, TruncDate
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from myapp.models import ChargingStation, Reservation

# Dates and busy hours are reported in the stations' local time.
LOCAL_TZ = ZoneInfo("Europe/London")
ALLOWED_PERIODS = {7, 30, 90}

SESSION_LENGTH = ExpressionWrapper(
    F("end_time") - F("start_time"), output_field=DurationField()
)


def summarise(reservations, station_count, period_start, period_end):
    """Headline numbers for the paid reservations that start in a period."""
    totals = reservations.aggregate(
        bookings=Count("id"),
        revenue=Sum("payment__amount"),
        booked_time=Sum(SESSION_LENGTH),
    )
    bookings = totals["bookings"]
    booked_seconds = (
        totals["booked_time"].total_seconds() if totals["booked_time"] else 0
    )
    available_seconds = station_count * (period_end - period_start).total_seconds()

    return {
        "revenue": float(totals["revenue"] or 0),
        "bookings": bookings,
        "avg_session_minutes": (
            round(booked_seconds / bookings / 60) if bookings else 0
        ),
        # Share of the stations' total available time that was booked.
        "utilisation": (
            round(booked_seconds / available_seconds, 4) if available_seconds else 0
        ),
    }


class SellerAnalyticsView(APIView):
    """Analytics for the logged-in seller's own stations.

    GET /analytics/?days=30 (7, 30 or 90). Only paid reservations count, and a
    reservation belongs to the period its start time falls in.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "seller":
            return Response(
                {"error": "Analytics are only available to station operators."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 0
        if days not in ALLOWED_PERIODS:
            return Response(
                {"error": "days must be 7, 30 or 90."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Whole calendar days in UK time: today plus the (days - 1) before it,
        # so the first day on the chart isn't a partial one.
        now = timezone.now()
        today = now.astimezone(LOCAL_TZ).date()
        first_day = today - timedelta(days=days - 1)
        period_start = datetime.combine(first_day, time.min, tzinfo=LOCAL_TZ)
        previous_start = datetime.combine(
            first_day - timedelta(days=days), time.min, tzinfo=LOCAL_TZ
        )

        stations = ChargingStation.objects.filter(operator=request.user).order_by(
            "station_id"
        )
        station_count = stations.count()
        paid = Reservation.objects.filter(
            charging_station__operator=request.user, is_paid=True
        )
        current = paid.filter(start_time__gte=period_start, start_time__lt=now)
        previous = paid.filter(
            start_time__gte=previous_start, start_time__lt=period_start
        )

        # Revenue and bookings per day, with empty days filled in as zero.
        per_day = {
            row["day"]: row
            for row in current.annotate(
                day=TruncDate("start_time", tzinfo=LOCAL_TZ)
            )
            .values("day")
            .annotate(revenue=Sum("payment__amount"), bookings=Count("id"))
        }
        daily = []
        day = first_day
        while day <= today:
            row = per_day.get(day)
            daily.append(
                {
                    "date": day.isoformat(),
                    "revenue": float(row["revenue"] or 0) if row else 0.0,
                    "bookings": row["bookings"] if row else 0,
                }
            )
            day += timedelta(days=1)

        # Every station of this seller, including ones without bookings.
        per_station = {
            row["charging_station_id"]: row
            for row in current.values("charging_station_id").annotate(
                revenue=Sum("payment__amount"), bookings=Count("id")
            )
        }
        station_rows = [
            {
                "station_id": station.station_id,
                "location": station.location,
                "bookings": per_station.get(station.station_id, {}).get(
                    "bookings", 0
                ),
                "revenue": float(
                    per_station.get(station.station_id, {}).get("revenue") or 0
                ),
            }
            for station in stations
        ]
        station_rows.sort(key=lambda row: (-row["bookings"], -row["revenue"]))

        # When bookings start: ISO weekday (1 = Monday) by local hour.
        busy_hours = list(
            current.annotate(
                weekday=ExtractIsoWeekDay("start_time", tzinfo=LOCAL_TZ),
                hour=ExtractHour("start_time", tzinfo=LOCAL_TZ),
            )
            .values("weekday", "hour")
            .annotate(bookings=Count("id"))
            .order_by("weekday", "hour")
        )

        return Response(
            {
                "days": days,
                "station_count": station_count,
                "summary": summarise(current, station_count, period_start, now),
                "previous": summarise(
                    previous, station_count, previous_start, period_start
                ),
                "daily": daily,
                "stations": station_rows,
                "busy_hours": busy_hours,
            }
        )
