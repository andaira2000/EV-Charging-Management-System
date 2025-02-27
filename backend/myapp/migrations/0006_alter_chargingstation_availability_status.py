# Generated by Django 5.1.4 on 2025-01-05 05:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0005_notificationrequest"),
    ]

    operations = [
        migrations.AlterField(
            model_name="chargingstation",
            name="availability_status",
            field=models.CharField(
                choices=[
                    ("available", "Available"),
                    ("out_of_order", "Out of Order"),
                    ("maintenance", "Maintenance"),
                ],
                default="available",
                max_length=20,
            ),
        ),
    ]
