from django.urls import path

from myapp.views.health_view import health_check
from myapp.views.charging_station_views import (
    AddChargingStationView,
    GetUserChargingStationsView,
    GetAllChargingStationsView,
    DeleteChargingStationView,
    UpdateChargingStationView,
)
from myapp.views.auth_views import (
    SignupView,
    LoginView,
    ValidateTokenView,
)
from myapp.views.reservation_views import (
    CreateReservationView,
    GetAllReservationsView,
    GetUserReservationsView,
    CancelReservationView,
    UpdateReservationView,
    MostVisitedStationView,
)
from myapp.views.stripe_views import (
    CreateCheckoutSessionView,
    stripe_webhook,
)
from myapp.views.payment_views import UserPaymentsView
from myapp.views.notification_views import RequestNotificationView
from myapp.views.analytics_views import SellerAnalyticsView

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("validate-token/", ValidateTokenView.as_view(), name="validate-token"),
    path(
        "charging-stations/add/",
        AddChargingStationView.as_view(),
        name="add_charging_station",
    ),
    path(
        "charging-stations/user/",
        GetUserChargingStationsView.as_view(),
        name="get-user-charging-stations",
    ),
    path(
        "charging-stations/all/",
        GetAllChargingStationsView.as_view(),
        name="get-all-charging-stations",
    ),
    path(
        "create-reservation/",
        CreateReservationView.as_view(),
        name="create-reservation",
    ),
    path(
        "get-user-reservations/",
        GetUserReservationsView.as_view(),
        name="get-user-reservations",
    ),
    path(
        "get-all-reservations/",
        GetAllReservationsView.as_view(),
        name="get-all-reservations",
    ),
    path(
        "charging-stations/<int:station_id>/delete/",
        DeleteChargingStationView.as_view(),
        name="delete-charging-station",
    ),
    path(
        "charging-stations/<int:station_id>/update/",
        UpdateChargingStationView.as_view(),
        name="update-charging-station",
    ),
    path(
        "reservations/<int:reservation_id>/cancel/",
        CancelReservationView.as_view(),
        name="cancel-reservation",
    ),
    path(
        "reservations/<int:reservation_id>/update/",
        UpdateReservationView.as_view(),
        name="update-reservation",
    ),
    path(
        "create-checkout-session/",
        CreateCheckoutSessionView.as_view(),
        name="create-checkout-session",
    ),
    path("stripe-webhook/", stripe_webhook, name="stripe-webhook"),
    path(
        "reservations/most-visited/",
        MostVisitedStationView.as_view(),
        name="most-visited-station",
    ),
    path("payments/", UserPaymentsView.as_view(), name="user_payments"),
    path("analytics/", SellerAnalyticsView.as_view(), name="seller-analytics"),
    path(
        "notifications/request/",
        RequestNotificationView.as_view(),
        name="request_notification",
    ),
]
