import io
import json

import PyPDF2
from django.contrib.auth import get_user_model
from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from jobs.models import Job
from users.models import UserProfile
from .ai_utils import generate_resume_feedback
from .models import Activity, Feedback, JobApplication, Notification, Resume
from .serializers import (
    JobApplicationSerializer,
    MyApplicationsSerializer,
    RegisterSerializer,
    ResumeBuilderSerializer,
    ResumeSerializer,
    UserSerializer,
)
from .utils import (
    calculate_ats_score,
    compare_skills,
    create_notification,
    extract_skills_from_text,
    extract_text_from_file,
    log_activity,
)

User = get_user_model()


# ─── helpers ──────────────────────────────────────────────────────────────────

def extract_text_from_resume(file_path):
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception:
        pass
    return text


# ─── Auth ─────────────────────────────────────────────────────────────────────

class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ─── Resume Upload + Analyze ──────────────────────────────────────────────────

class ResumeUploadView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("resume_file")
        job_id = request.data.get("job_id")

        if not file or not job_id:
            return Response({"error": "file and job_id required"}, status=400)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        resume = Resume.objects.create(user=request.user, job=job, file=file)

        extracted_text = extract_text_from_file(resume.file.path)
        resume.extracted_text = extracted_text
        resume.save()

        resume_skills = extract_skills_from_text(extracted_text)
        job_skills = extract_skills_from_text(job.description)
        skills_found, missing_skills = compare_skills(resume_skills, job_skills)
        ats_score = calculate_ats_score(skills_found, len(job_skills))

        log_activity(user=request.user, action="Uploaded resume")
        log_activity(user=request.user, action="Checked ATS score")

        return Response(
            {
                "job_title": job.title,
                "resume_id": resume.id,
                "ats_score": ats_score,
                "skills_found": skills_found,
                "missing_skills": missing_skills,
                "status": "analyzed",
            },
            status=status.HTTP_200_OK,
        )


# ─── Generate ATS Resume (GET) ────────────────────────────────────────────────

class GenerateATSResumeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, resume_id):
        try:
            resume = Resume.objects.get(id=resume_id)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        application = (
            JobApplication.objects.filter(resume=resume).order_by("-created_at").first()
        )
        if not application:
            return Response({"error": "No job application found"}, status=404)

        try:
            job = Job.objects.get(id=application.job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        resume_text = extract_text_from_resume(resume.file.path)
        job_text = job.description or ""

        resume_words = set(resume_text.lower().split())
        job_words = set(job_text.lower().split())

        skills_found = list(job_words & resume_words)
        missing_skills = list(job_words - resume_words)
        ats_score = int((len(skills_found) / max(len(job_words), 1)) * 100)

        return Response(
            {
                "resume_id": resume.id,
                "job_id": job.id,
                "ats_score": ats_score,
                "skills_found": skills_found,
                "missing_skills": missing_skills,
            },
            status=200,
        )


# ─── Build ATS Resume PDF ─────────────────────────────────────────────────────

class BuildATSResumeView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResumeBuilderSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        def draw_text(text, bold=False, size=10, gap=14):
            nonlocal y
            if not text:
                return
            p.setFont("Helvetica-Bold" if bold else "Helvetica", size)
            max_chars = 90
            for i in range(0, len(str(text)), max_chars):
                p.drawString(50, y, str(text)[i : i + max_chars])
                y -= gap

        def section(title):
            nonlocal y
            y -= 10
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, title.upper())
            y -= 14
            p.setFont("Helvetica", 10)

        if data.get("photo"):
            try:
                img = ImageReader(data["photo"])
                p.drawImage(img, width - 120, height - 120, 80, 80)
            except Exception:
                pass

        draw_text(data.get("full_name", ""), bold=True, size=14, gap=18)
        draw_text(f"Email: {data.get('email','')} | Phone: {data.get('phone','')}")
        draw_text(
            f"LinkedIn: {data.get('linkedin','')} | GitHub: {data.get('github','')} | Portfolio: {data.get('portfolio','')}"
        )
        draw_text(f"Location: {data.get('location','')}")

        section("Professional Summary")
        draw_text(data.get("summary"))
        section("Technical Skills")
        draw_text(data.get("technical_skills"))
        section("Soft Skills")
        draw_text(data.get("soft_skills"))
        section("Experience")
        draw_text(data.get("experience"))
        section("Internships")
        draw_text(data.get("internships"))
        section("Projects")
        draw_text(data.get("projects"))
        section("Education")
        draw_text(f"{data.get('degree','')} - {data.get('college','')}")
        draw_text(f"CGPA: {data.get('cgpa','')} | Year: {data.get('graduation_year','')}")
        draw_text(f"School: {data.get('school','')}")
        section("Certifications")
        draw_text(data.get("certifications"))
        section("Achievements")
        draw_text(data.get("achievements"))
        section("Languages")
        draw_text(data.get("languages"))
        section("Hobbies")
        draw_text(data.get("hobbies"))

        p.showPage()
        p.save()
        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename="ATS_Resume.pdf",
            content_type="application/pdf",
        )


# ─── Job Recommendations ──────────────────────────────────────────────────────

class RecommendedJobsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, resume_id):
        try:
            resume = Resume.objects.get(id=resume_id)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        resume_skills = extract_skills_from_text(resume.extracted_text)
        results = []

        for job in Job.objects.all():
            job_skills = extract_skills_from_text(job.description)
            if not job_skills:
                continue
            matched = set(resume_skills) & set(job_skills)
            if matched:
                results.append(
                    {
                        "job_id": job.id,
                        "job_title": job.title,
                        "match_percentage": int((len(matched) / len(job_skills)) * 100),
                        "matched_skills": list(matched),
                    }
                )

        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        return Response({"resume_skills": resume_skills, "recommended_jobs": results[:5]})


# ─── Ranked Candidates ────────────────────────────────────────────────────────

class RankedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(job_id=job_id).order_by("-ats_score")
        data = [
            {
                "application_id": app.id,
                "resume_id": app.resume.id,
                "ats_score": app.ats_score,
                "status": app.status,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills,
            }
            for app in applications
        ]
        return Response(data)


# ─── My Applications (candidate) ─────────────────────────────────────────────

class MyApplicationsPagination(PageNumberPagination):
    page_size = 5


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")
        applications = (
            JobApplication.objects.filter(resume__user=request.user)
            .select_related("job", "resume")
            .order_by("-id")
        )
        if status_filter:
            applications = applications.filter(status=status_filter)

        paginator = MyApplicationsPagination()
        paginated = paginator.paginate_queryset(applications, request)
        data = [
            {
                "id": app.id,
                "job_title": app.job.title if app.job else "",
                "ats_score": app.ats_score,
                "status": app.status,
            }
            for app in paginated
        ]
        return paginator.get_paginated_response(data)


# ─── Candidate Dashboard ──────────────────────────────────────────────────────

class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = (
            JobApplication.objects.filter(resume__user=request.user)
            .select_related("job", "resume")
        )
        data = {
            "applications_count": applications.count(),
            "applications": [
                {
                    "job_title": app.job.title,
                    "status": app.status,
                    "ats_score": app.ats_score,
                    "skills_found": app.skills_found,
                    "missing_skills": app.missing_skills,
                }
                for app in applications
            ],
        }
        return Response(data)


# ─── Recruiter Dashboard ──────────────────────────────────────────────────────

class RecruiterDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            if profile.role != "recruiter":
                return Response({"error": "Not a recruiter"}, status=403)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)

        recruiter_jobs = Job.objects.filter(recruiter=request.user)
        applications = JobApplication.objects.filter(job__in=recruiter_jobs)

        recent_data = [
            {
                "candidate_email": app.resume.user.email if app.resume and app.resume.user else "N/A",
                "job_title": app.job.title if app.job else "N/A",
                "ats_score": app.ats_score,
                "status": app.status,
            }
            for app in applications.order_by("-created_at")[:5]
        ]

        top_candidates = [
            {
                "application_id": app.id,
                "candidate_email": app.resume.user.email if app.resume and app.resume.user else "N/A",
                "job_title": app.job.title if app.job else "N/A",
                "ats_score": app.ats_score,
                "status": app.status,
            }
            for app in applications.order_by("-ats_score")[:5]
        ]

        return Response(
            {
                "total_jobs": recruiter_jobs.count(),
                "total_applications": applications.count(),
                "applied": applications.filter(status="applied").count(),
                "shortlisted": applications.filter(status="shortlisted").count(),
                "rejected": applications.filter(status="rejected").count(),
                "recent_applications": recent_data,
                "top_candidates": top_candidates,
            }
        )


# ─── Update Application Status ────────────────────────────────────────────────

class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):
        status_value = request.data.get("status")
        if status_value not in ["shortlisted", "rejected"]:
            return Response({"error": "Status must be 'shortlisted' or 'rejected'"}, status=400)

        try:
            application = JobApplication.objects.get(id=application_id)
        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)

        application.status = status_value
        application.save()

        if application.resume.user:
            log_activity(
                user=application.resume.user,
                action=f"Application {status_value} for Job ID {application.job.id}",
            )
            create_notification(
                user=application.resume.user,
                title="Application Update",
                message=f"Your application for {application.job.title} was {status_value}",
            )

        return Response({"message": f"Application {status_value} successfully"})


# ─── Notifications ────────────────────────────────────────────────────────────

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        data = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifications
        ]
        return Response(data)


# ─── Activity ─────────────────────────────────────────────────────────────────

class ActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activities = Activity.objects.filter(user=request.user).order_by("-created_at")
        data = [{"action": a.action, "created_at": a.created_at} for a in activities]
        return Response(data)


# ─── Top / Shortlisted / Rejected Candidates ─────────────────────────────────

class TopCandidatesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(job_id=job_id).order_by("-ats_score")[:5]
        data = [
            {
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
            }
            for app in applications
        ]
        return Response(data)


class ShortlistedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(job_id=job_id, status="shortlisted").order_by("-ats_score")
        data = [
            {
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
            }
            for app in applications
        ]
        return Response(data)


class RejectedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(job_id=job_id, status="rejected").order_by("-ats_score")
        data = [
            {
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score,
            }
            for app in applications
        ]
        return Response(data)


# ─── AI Feedback ──────────────────────────────────────────────────────────────

class AIResumeFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_id = request.data.get("resume_id")
        if not resume_id:
            return Response({"error": "resume_id required"}, status=400)

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        ai_raw = generate_resume_feedback(resume.extracted_text, resume.job.description)
        return Response({"ai_feedback": ai_raw})


# ─── Recent Applications ──────────────────────────────────────────────────────

class RecentApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = (
            JobApplication.objects.filter(resume__user=request.user)
            .select_related("job", "resume")
            .order_by("-created_at")[:5]
        )
        data = [
            {
                "job_title": app.job.title,
                "ats_score": app.ats_score,
                "status": app.status,
                "applied_date": app.created_at.strftime("%Y-%m-%d"),
            }
            for app in applications
        ]
        return Response(data)


# ─── Candidate Dashboard Summary (legacy) ────────────────────────────────────

class CandidateDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(resume__user=request.user)
        return Response(
            {
                "applied": applications.filter(status="applied").count(),
                "shortlisted": applications.filter(status="shortlisted").count(),
                "rejected": applications.filter(status="rejected").count(),
                "total_applications": applications.count(),
            }
        )


# ─── Feedback ─────────────────────────────────────────────────────────────────

class FeedbackCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response({"error": "Message required"}, status=400)
        Feedback.objects.create(user=request.user, message=message)
        return Response({"message": "Feedback submitted"})
