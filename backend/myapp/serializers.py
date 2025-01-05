from rest_framework import serializers
from .models import ChargingStation, Reservation, Payment


class ChargingStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargingStation
        fields = [
            "station_id",
            "location",
            "latitude",
            "longitude",
            "availability_status",
            "charging_speed",
            "power_capacity",
            "price_per_kwh",
            "connector_types",
        ]
        read_only_fields = ["operator"]


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    charging_station = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "charging_station",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "user"]

    def get_charging_station(self, obj):
        """Return the location of the charging station."""
        return obj.charging_station.location

    def validate(self, data):
        """Ensure the reservation times are valid and the charging station is available."""
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        charging_station = data.get("charging_station")

        # Ensure that start_time is before end_time
        if start_time >= end_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after the start time."}
            )

        # Check if the charging station is available during the requested time
        overlapping_reservations = Reservation.objects.filter(
            charging_station=charging_station,
            start_time__lt=end_time,
            end_time__gt=start_time,
        )
        if overlapping_reservations.exists():
            raise serializers.ValidationError(
                {
                    "charging_station": "The charging station is not available for the selected time slot."
                }
            )

        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "reservation",
            "amount",
            "payment_date",
            "location",
            "start_time",
            "end_time",
        ]
        read_only_fields = ["id", "user", "payment_date"]
