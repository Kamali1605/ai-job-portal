from rest_framework import serializers
from .models import Resume, JobApplication
from django.contrib.auth import get_user_model
from jobs.models import Job
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"]
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


# ---------- Resume Upload Serializer ----------
from jobs.models import Job

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ["file", "job_id"]

    def create(self, validated_data):
        request = self.context.get("request")

        job_id = request.data.get("job_id")
        job = Job.objects.get(id=job_id)

        user = request.user if request.user.is_authenticated else None

        return Resume.objects.create(
            user=user,
            job=job,
            file=validated_data["file"]
        )

# ---------- Resume Builder Serializer (FORM BASED) ----------
class ResumeBuilderSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()

    linkedin = serializers.CharField(required=False, allow_blank=True)
    github = serializers.CharField(required=False, allow_blank=True)
    portfolio = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)

    school = serializers.CharField(required=False, allow_blank=True)
    college = serializers.CharField(required=False, allow_blank=True)
    degree = serializers.CharField(required=False, allow_blank=True)
    cgpa = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.CharField(required=False, allow_blank=True)

    job_title = serializers.CharField(required=False, allow_blank=True)
    summary = serializers.CharField(required=False, allow_blank=True)

    technical_skills = serializers.CharField(required=False, allow_blank=True)
    soft_skills = serializers.CharField(required=False, allow_blank=True)

    experience = serializers.CharField(required=False, allow_blank=True)
    internships = serializers.CharField(required=False, allow_blank=True)
    projects = serializers.CharField(required=False, allow_blank=True)

    certifications = serializers.CharField(required=False, allow_blank=True)
    achievements = serializers.CharField(required=False, allow_blank=True)

    languages = serializers.CharField(required=False, allow_blank=True)
    hobbies = serializers.CharField(required=False, allow_blank=True)

    photo = serializers.ImageField(required=False)
# ---------- Job Application Serializer ----------
class JobApplicationSerializer(serializers.ModelSerializer):
    resume_email = serializers.CharField(
        source="resume.candidate_email",
        read_only=True
    )
# ✅ Generic serializer (ranking, recruiter views)
class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_id",
            "ats_score",
            "skills_found",
            "missing_skills",
            "status",
            "applied_at",
        ]


# ✅ Candidate "My Applications" serializer
class MyApplicationsSerializer(serializers.ModelSerializer):
    job_title = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "job_id",
            "job_title",
            "ats_score",
            "skills_found",
            "missing_skills",
            "status",
            "applied_at",
        ]

    def get_job_title(self, obj):
        try:
            job = Job.objects.get(id=obj.job_id)
            return job.title
        except Job.DoesNotExist:
            return "Job deleted"