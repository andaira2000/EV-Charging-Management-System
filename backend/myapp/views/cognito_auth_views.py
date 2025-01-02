import boto3
import hmac
import hashlib
import base64
from botocore.exceptions import ClientError
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from myapp.models import UserProfile

cognito_client = boto3.client("cognito-idp", region_name="eu-north-1")
USER_POOL_ID = "eu-north-1_Of3sycnhD"
CLIENT_ID = "13o77rhl3m3inmn0nl31dpd1m1"
CLIENT_SECRET = "ediog9l9u7vr684tvbi7lfjn31echckfbnr1jaje11amvifgurq"


def get_secret_hash(username):
    message = username + CLIENT_ID
    dig = hmac.new(
        str(CLIENT_SECRET).encode("utf-8"),
        msg=message.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    secret_hash = base64.b64encode(dig).decode()
    return secret_hash


class CognitoSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Extract data from request
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        password = request.data.get("password")
        role = request.data.get("role", "buyer")

        # Your AWS Cognito signup logic
        try:
            secret_hash = get_secret_hash(email)

            response = cognito_client.sign_up(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=email,
                Password=password,
                UserAttributes=[
                    {"Name": "email", "Value": email},
                ],
            )
            # Create local UserProfile instance
            UserProfile.objects.create(
                user_id=response["UserSub"],
                email=email,
                role=role,
                first_name=first_name,
                last_name=last_name,
            )
            return Response(
                {
                    "message": "User registered successfully",
                    "user_sub": response["UserSub"],
                },
                status=status.HTTP_201_CREATED,
            )
        except ClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CognitoLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            # Generate SECRET_HASH
            secret_hash = get_secret_hash(email)

            # Authenticate user with AWS Cognito
            response = cognito_client.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": password,
                    "SECRET_HASH": secret_hash,
                },
            )
            # Generate JWT Tokens for user
            id_token = response["AuthenticationResult"]["IdToken"]
            user = get_object_or_404(UserProfile, email=email)
            return Response(
                {
                    "access": id_token,
                    "userProfile": {
                        "email": user.email,
                        "firstName": user.first_name,
                        "lastName": user.last_name,
                        "role": user.role,
                    },
                }
            )
        except ClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ValidateTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"valid": True}, status=200)
