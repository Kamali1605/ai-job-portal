from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model
from .models import UserProfile
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        role = validated_data.pop("role")

        user = User.objects.create_user(**validated_data)

        # ✅ create profile with role
        UserProfile.objects.create(user=user, role=role)

        return user
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
