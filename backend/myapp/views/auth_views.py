from django.contrib.auth import authenticate
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from myapp.models import UserProfile


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        password = request.data.get("password")
        role = request.data.get("role", "buyer")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if UserProfile.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UserProfile.objects.create_user(
            email=email,
            password=password,
            role=role,
            first_name=first_name,
            last_name=last_name,
        )
        return Response(
            {
                "message": "User registered successfully",
                "user_sub": user.user_id,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "userProfile": {
                    "email": user.email,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "role": user.role,
                },
            }
        )


class ValidateTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"valid": True}, status=200)
