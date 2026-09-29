import logging
from typing import Any
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from myapp.models import ChargingStation, UserProfile
from myapp.serializers import ChargingStationSerializer
from myapp.utils import get_coordinates_from_address

logger = logging.getLogger(__name__)


class AddChargingStationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_profile = request.user

        if user_profile.role != "seller":
            return Response(
                {"error": "You do not have permission to add a charging station."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer_data = request.data.copy()  # Create a copy of request.data to modify

        location = serializer_data.get("location")

        if location:
            coordinates = get_coordinates_from_address(location)
            logger.warning(f"coordinates {coordinates}")
            if coordinates:
                serializer_data["latitude"] = coordinates[0]
                serializer_data["longitude"] = coordinates[1]
            else:
                return Response(
                    {"error": "Could not fetch coordinates for the given address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            logger.warning("No address provided in the request.")

        serializer = ChargingStationSerializer(data=serializer_data)
        if serializer.is_valid():
            serializer.save(operator=request.user)
            logger.info(f"Charging station created: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserChargingStationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_profile = request.user

        if user_profile.role != "seller":
            return Response(
                {
                    "error": "You do not have permission to fetch these charging stations."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        charging_stations = ChargingStation.objects.filter(operator=user_profile)

        serializer = ChargingStationSerializer(charging_stations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetAllChargingStationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        charging_stations = ChargingStation.objects.all()

        serializer = ChargingStationSerializer(charging_stations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteChargingStationView(APIView):
    permission_classes: list[Any] = [permissions.IsAuthenticated]

    def delete(self, request: Any, station_id: int) -> Response:
        user_profile: UserProfile = request.user

        if user_profile.role != "seller":
            return Response(
                {
                    "error": "You do not have permission to delete this charging station."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        charging_station: ChargingStation = get_object_or_404(
            ChargingStation, station_id=station_id, operator=user_profile
        )
        charging_station.delete()
        logger.info(
            f"Charging station {station_id} deleted by user {user_profile.email}"
        )

        return Response(
            {"message": "Charging station deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class UpdateChargingStationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request: Any, station_id: int) -> Response:
        user_profile: UserProfile = request.user

        if user_profile.role != "seller":
            return Response(
                {
                    "error": "You do not have permission to update this charging station."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        charging_station: ChargingStation = get_object_or_404(
            ChargingStation, station_id=station_id, operator=user_profile
        )

        serializer_data = request.data.copy()

        location = serializer_data.get("location")

        if location and location != charging_station.location:
            coordinates = get_coordinates_from_address(location)
            if coordinates:
                serializer_data["latitude"] = coordinates[0]
                serializer_data["longitude"] = coordinates[1]
            else:
                return Response(
                    {"error": "Could not fetch coordinates for the given address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = ChargingStationSerializer(
            charging_station, data=serializer_data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"Charging station {station_id} updated by user {user_profile.email}"
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
