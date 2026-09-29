import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        extra_fields.setdefault("user_id", str(uuid.uuid4()))
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class UserProfile(AbstractBaseUser, PermissionsMixin):
    user_id: models.CharField = models.CharField(max_length=255, unique=True)
    email: models.EmailField = models.EmailField(unique=True)
    first_name: models.CharField = models.CharField(max_length=255)
    last_name: models.CharField = models.CharField(max_length=255)
    role: models.CharField = models.CharField(
        max_length=20,
        choices=[("buyer", "Buyer"), ("seller", "Seller"), ("admin", "Admin")],
    )
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self) -> str:
        return f"User {self.first_name} {self.last_name} ({self.email}) - {self.role}"


class ChargingStation(models.Model):
    station_id: models.AutoField = models.AutoField(primary_key=True)
    location: models.CharField = models.CharField(max_length=255)
    latitude: models.DecimalField = models.DecimalField(max_digits=9, decimal_places=6)
    longitude: models.DecimalField = models.DecimalField(max_digits=9, decimal_places=6)
    availability_status: models.CharField = models.CharField(
        max_length=20,
        choices=[
            ("available", "Available"),
            ("out_of_order", "Out of Order"),
            ("maintenance", "Maintenance"),
        ],
        default="available",
    )
    charging_speed: models.CharField = models.CharField(
        max_length=20, choices=[("fast", "Fast"), ("slow", "Slow")], default="slow"
    )
    power_capacity: models.DecimalField = models.DecimalField(
        max_digits=5, decimal_places=2
    )
    price_per_kwh: models.DecimalField = models.DecimalField(
        max_digits=10, decimal_places=2
    )
    connector_types: models.CharField = models.CharField(
        max_length=100,
        choices=[
            ("type1", "Type 1"),
            ("type2", "Type 2"),
            ("ccs", "CCS"),
            ("chademo", "CHAdeMO"),
        ],
        default="type2",
    )
    operator: models.ForeignKey[UserProfile] = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="charging_stations",
        limit_choices_to={"role": "seller"},
    )
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Station {self.station_id} at {self.location}"


class Reservation(models.Model):
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="reservations"
    )
    charging_station = models.ForeignKey(
        ChargingStation, on_delete=models.CASCADE, related_name="reservations"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)
    is_paid = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Reservation by {self.user.email} at {self.charging_station.location} from {self.start_time} to {self.end_time}"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="payment",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    payment_date = models.DateTimeField(
        auto_now_add=True,
    )
    location = models.CharField(
        max_length=255,
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"Payment by {self.user} - {self.amount} GBP on {self.payment_date}"


class NotificationRequest(models.Model):
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="notifications"
    )
    charging_station = models.ForeignKey(
        ChargingStation, on_delete=models.CASCADE, related_name="notifications"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.charging_station} by {self.user}"
