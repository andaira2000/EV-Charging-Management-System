# Generated by Django 5.1.4 on 2025-01-05 02:33

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0002_remove_payment_card_last4"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="id",
            field=models.UUIDField(editable=False, primary_key=True, serialize=False),
        ),
    ]
