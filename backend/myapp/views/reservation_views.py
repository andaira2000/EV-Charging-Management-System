import logging
from typing import Any
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from myapp.models import Reservation
from myapp.serializers import ReservationSerializer

logger = logging.getLogger(__name__)


class CreateReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_profile = request.user

        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user_profile, created_at=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserReservationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Any) -> Response:
        user_profile = request.user

        reservations = Reservation.objects.filter(user=user_profile)

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request: Any, reservation_id: int) -> Response:
        user_profile = request.user

        reservation = get_object_or_404(
            Reservation, id=reservation_id, user=user_profile
        )

        reservation.delete()

        logger.info(f"Sending availability update to all users")

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "reservations",
            {
                "type": "availability_update",
                "data": {},
            },
        )

        return Response(
            {"message": "Reservation canceled successfully."},
            status=status.HTTP_200_OK,
        )


class UpdateReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request: Any, reservation_id: int) -> Response:
        user_profile = request.user
        reservation = get_object_or_404(
            Reservation, id=reservation_id, user=user_profile
        )

        serializer = ReservationSerializer(reservation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllReservationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.values(
            "charging_station_id", "start_time", "end_time"
        )

        grouped_reservations = {}
        for res in reservations:
            station_id = res["charging_station_id"]
            if station_id not in grouped_reservations:
                grouped_reservations[station_id] = []
            grouped_reservations[station_id].append(
                {
                    "start_time": res["start_time"].isoformat(),
                    "end_time": res["end_time"].isoformat(),
                }
            )

        return Response(grouped_reservations, status=status.HTTP_200_OK)
