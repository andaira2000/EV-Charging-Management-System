# Generated by Django 5.1.4 on 2025-01-05 01:16

import django.db.models.deletion
import django.utils.timezone
import myapp.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("user_id", models.CharField(max_length=255, unique=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("first_name", models.CharField(max_length=255)),
                ("last_name", models.CharField(max_length=255)),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("buyer", "Buyer"),
                            ("seller", "Seller"),
                            ("admin", "Admin"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
            managers=[
                ("objects", myapp.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="ChargingStation",
            fields=[
                ("station_id", models.AutoField(primary_key=True, serialize=False)),
                ("location", models.CharField(max_length=255)),
                ("latitude", models.DecimalField(decimal_places=6, max_digits=9)),
                ("longitude", models.DecimalField(decimal_places=6, max_digits=9)),
                (
                    "availability_status",
                    models.CharField(
                        choices=[
                            ("available", "Available"),
                            ("unavailable", "Unavailable"),
                            ("out_of_order", "Out of Order"),
                            ("maintenance", "Maintenance"),
                        ],
                        default="available",
                        max_length=20,
                    ),
                ),
                (
                    "charging_speed",
                    models.CharField(
                        choices=[("fast", "Fast"), ("slow", "Slow")],
                        default="slow",
                        max_length=20,
                    ),
                ),
                ("power_capacity", models.DecimalField(decimal_places=2, max_digits=5)),
                ("price_per_kwh", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "connector_types",
                    models.CharField(
                        choices=[
                            ("type1", "Type 1"),
                            ("type2", "Type 2"),
                            ("ccs", "CCS"),
                            ("chademo", "CHAdeMO"),
                        ],
                        default="type2",
                        max_length=100,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "operator",
                    models.ForeignKey(
                        limit_choices_to={"role": "seller"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="charging_stations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Reservation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("start_time", models.DateTimeField()),
                ("end_time", models.DateTimeField()),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("is_paid", models.BooleanField(default=False)),
                (
                    "charging_station",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reservations",
                        to="myapp.chargingstation",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reservations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Payment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, verbose_name="Amount Paid"
                    ),
                ),
                (
                    "payment_date",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Payment Date"
                    ),
                ),
                (
                    "location",
                    models.CharField(
                        max_length=255, verbose_name="Charging Station Location"
                    ),
                ),
                (
                    "start_time",
                    models.DateTimeField(verbose_name="Reservation Start Time"),
                ),
                ("end_time", models.DateTimeField(verbose_name="Reservation End Time")),
                (
                    "card_last4",
                    models.CharField(max_length=4, verbose_name="Card Last 4 Digits"),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reservation",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payment",
                        to="myapp.reservation",
                        verbose_name="Reservation",
                    ),
                ),
            ],
        ),
    ]
