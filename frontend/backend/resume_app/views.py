from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Resume
from jobs.models import Job
from .ai_utils import generate_resume_feedback
import json
from users.models import Notification
from resume_app.models import Activity 
from resume_app.models import Feedback
from .utils import log_activity
from resume_app.utils import create_notification
from django.db.models import Avg
from resume_app.models import Resume, JobApplication, Activity
from rest_framework.pagination import PageNumberPagination
from users.models import UserProfile
from jobs.models import Job
from .models import JobApplication

from django.http import HttpResponse

from .serializers import (
    ResumeSerializer,
    ResumeBuilderSerializer,
    JobApplicationSerializer,
    MyApplicationsSerializer,
    RegisterSerializer,
  )  

from .utils import (
    extract_text_from_file,
    extract_skills_from_text,
    compare_skills,
    calculate_ats_score
)

from .resume_generator import generate_ats_resume
from .resume_pdf import generate_resume_pdf

from jobs.models import Job
import PyPDF2
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

# ---------- Helper: Extract text from resume PDF ----------
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


# ======================================================
# 1. RESUME UPLOAD + AUTO APPLY
# ======================================================
# optional logs
from .utils import log_activity, create_notification


from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import GenericAPIView

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

        # ✅ Save resume
        resume = Resume.objects.create(
            user=request.user,
            job=job,
            file=file
        )

        # ✅ Extract text
        extracted_text = extract_text_from_file(resume.file.path)
        resume.extracted_text = extracted_text
        resume.save()

        # ✅ ATS logic
        resume_skills = extract_skills_from_text(extracted_text)
        job_skills = extract_skills_from_text(job.description)

        skills_found, missing_skills = compare_skills(resume_skills, job_skills)
        ats_score = calculate_ats_score(skills_found, len(job_skills))

        # ✅ Activity (analysis only)
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


        # ✅ Notification
        create_notification(
            user=request.user,
            title="Job Application Submitted",
            message=f"You applied for Job ID {job.id}",
        )

        return Response(
            {
                "job_title": job.title,
                "resume_id": resume.id,
                "ats_score": ats_score,
                "skills_found": skills_found,
                "missing_skills": missing_skills,
                "status": "applied",
            },
            status=status.HTTP_201_CREATED,
        )
        # Activity logs
      #  log_activity(user=resume.user, action="Uploaded resume")
       # log_activity(user=resume.user, action=f"Applied for Job ID {job.id}")
       # log_activity(user=resume.user, action="Checked ATS score")
      #  log_activity(user=resume.user, action=f"Viewed profile (Resume ID {resume.id})")

        # Notifications
       # create_notification(
       #     user=resume.user,
       #     title="Job Application Submitted",
        #    message=f"You applied for Job ID {job.id}"
       # )

       # create_notification(
       #     user=resume.user,
        #    title="Resume Uploaded",
        #    message="Your resume was uploaded and ATS score generated"
      #  )

        return Response({
            "resume_id": resume.id,
            "ats_score": ats_score,
            "skills_found": skills_found,
            "missing_skills": missing_skills,
            "recommendations": missing_skills
        }, status=status.HTTP_201_CREATED)
class GenerateATSResumeView(APIView):
    permission_classes = [AllowAny]
    """
    ATS analysis ONLY (score, skills, missing skills, recommendations)
    """

    def get(self, request, resume_id):

        # 1. Resume
        try:
            resume = Resume.objects.get(id=resume_id)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Latest Job Application
        application = (
            JobApplication.objects
            .filter(resume=resume)
            .order_by("-applied_at")
            .first()
        )

        if not application:
            return Response(
                {"error": "No job application found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3. Job
        try:
            job = Job.objects.get(id=application.job_id)
        except Job.DoesNotExist:
            return Response(
                {"error": "Job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 4. Extract text SAFELY
        resume_text = extract_text_from_resume(resume.file.path)
        job_text = job.description or ""

        # 5. Simple ATS logic (stable)
        resume_words = set(resume_text.lower().split())
        job_words = set(job_text.lower().split())

        skills_found = list(job_words & resume_words)
        missing_skills = list(job_words - resume_words)

        ats_score = int(
            (len(skills_found) / max(len(job_words), 1)) * 100
        )

        recommendations = [
            f"Add experience with {skill}"
            for skill in missing_skills[:5]
        ]
        job_text = job.description or ""
        resume_text = resume.text_content or ""

        # --- Simple skill logic (safe & stable) ---
        job_skills = set(job_text.lower().split())
        resume_skills = set(resume_text.lower().split())

        skills_found = list(job_skills & resume_skills)
        missing_skills = list(job_skills - resume_skills)

        ats_score = int(
            (len(skills_found) / max(len(job_skills), 1)) * 100
        )

        recommendations = [
            f"Consider adding experience with {skill}"
            for skill in missing_skills[:5]
        ]

        return Response({
            "resume_id": resume.id,
            "job_id": job.id,
            "ats_score": ats_score,
            "skills_found": skills_found,
            "missing_skills": missing_skills,
            "recommendations": recommendations
        }, status=status.HTTP_200_OK)


       
# ======================================================
# 3. BUILD ATS RESUME (FORM PREVIEW)
# ======================================================
import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import FileResponse
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from .serializers import ResumeBuilderSerializer


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

        y = 800

        def heading(text):
            nonlocal y
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, text)
            y -= 18
            p.setFont("Helvetica", 10)

        def line(text):
            nonlocal y
            if text:
                p.drawString(60, y, text)
                y -= 15

        # 🔹 HEADER
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, data.get("full_name", ""))
        y -= 18

        p.setFont("Helvetica", 10)
        line(f"Email: {data.get('email','')} | Phone: {data.get('phone','')}")
        line(f"LinkedIn: {data.get('linkedin','')} | GitHub: {data.get('github','')}")
        line(f"Portfolio: {data.get('portfolio','')} | Location: {data.get('location','')}")

        y -= 10

        # 🔹 SUMMARY
        heading("PROFESSIONAL SUMMARY")
        line(data.get("summary"))

        # 🔹 SKILLS
        heading("TECHNICAL SKILLS")
        line(data.get("technical_skills"))

        heading("SOFT SKILLS")
        line(data.get("soft_skills"))

        # 🔹 EXPERIENCE
        heading("EXPERIENCE")
        line(data.get("experience"))

        # 🔹 INTERNSHIPS
        heading("INTERNSHIPS")
        line(data.get("internships"))

        # 🔹 PROJECTS
        heading("PROJECTS")
        line(data.get("projects"))

        # 🔹 EDUCATION
        heading("EDUCATION")
        line(f"{data.get('degree','')} - {data.get('college','')}")
        line(f"CGPA: {data.get('cgpa','')} | Year: {data.get('graduation_year','')}")
        line(f"School: {data.get('school','')}")

        # 🔹 CERTIFICATIONS
        heading("CERTIFICATIONS")
        line(data.get("certifications"))

        # 🔹 ACHIEVEMENTS
        heading("ACHIEVEMENTS")
        line(data.get("achievements"))

        # 🔹 LANGUAGES
        heading("LANGUAGES")
        line(data.get("languages"))

        # 🔹 HOBBIES
        heading("HOBBIES")
        line(data.get("hobbies"))

        p.showPage()
        p.save()

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename="ATS_Resume.pdf",
            content_type="application/pdf",
        )
# ======================================================
# 4. DOWNLOAD PDF (FORM-FILLED RESUME)
# ======================================================
import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from django.http import FileResponse
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from .serializers import ResumeBuilderSerializer


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

        # ---------- HELPERS ----------
        def draw_text(text, x=50, bold=False, size=10, gap=14):
            nonlocal y
            if not text:
                return
            p.setFont("Helvetica-Bold" if bold else "Helvetica", size)

            # wrap long text
            max_chars = 90
            lines = [
                text[i : i + max_chars]
                for i in range(0, len(text), max_chars)
            ]

            for line in lines:
                p.drawString(x, y, line)
                y -= gap

        def section(title):
            nonlocal y
            y -= 10
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, title.upper())
            y -= 14
            p.setFont("Helvetica", 10)

        # ---------- PHOTO ----------
        if data.get("photo"):
            try:
                img = ImageReader(data["photo"])
                p.drawImage(img, width - 120, height - 120, 80, 80)
            except:
                pass

        # ---------- HEADER ----------
        draw_text(data.get("full_name"), bold=True, size=14, gap=18)

        contact_line = (
            f"Email: {data.get('email','')} | Phone: {data.get('phone','')}"
        )
        draw_text(contact_line)

        links = (
            f"LinkedIn: {data.get('linkedin','')} | "
            f"GitHub: {data.get('github','')} | "
            f"Portfolio: {data.get('portfolio','')}"
        )
        draw_text(links)

        draw_text(f"Location: {data.get('location','')}")

        # ---------- SUMMARY ----------
        section("Professional Summary")
        draw_text(data.get("summary"))

        # ---------- SKILLS ----------
        section("Technical Skills")
        draw_text(data.get("technical_skills"))

        section("Soft Skills")
        draw_text(data.get("soft_skills"))

        # ---------- EXPERIENCE ----------
        section("Experience")
        draw_text(data.get("experience"))

        # ---------- INTERNSHIPS ----------
        section("Internships")
        draw_text(data.get("internships"))

        # ---------- PROJECTS ----------
        section("Projects")
        draw_text(data.get("projects"))

        # ---------- EDUCATION ----------
        section("Education")
        draw_text(
            f"{data.get('degree','')} - {data.get('college','')}"
        )
        draw_text(
            f"CGPA: {data.get('cgpa','')} | Year: {data.get('graduation_year','')}"
        )
        draw_text(f"School: {data.get('school','')}")

        # ---------- CERTIFICATIONS ----------
        section("Certifications")
        draw_text(data.get("certifications"))

        # ---------- ACHIEVEMENTS ----------
        section("Achievements")
        draw_text(data.get("achievements"))

        # ---------- LANGUAGES ----------
        section("Languages")
        draw_text(data.get("languages"))

        # ---------- HOBBIES ----------
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
# ======================================================
# 5. JOB RECOMMENDATION
# ======================================================
class RecommendedJobsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, resume_id):
        try:
            # Get resume
            resume = Resume.objects.get(id=resume_id)

            # Extract resume skills
            resume_skills = extract_skills_from_text(resume.extracted_text)

            results = []

            for job in Job.objects.all():
                job_skills = extract_skills_from_text(job.description)

                if not job_skills:
                    continue  # skip jobs with no skills

                # Find matched skills
                matched = set(resume_skills) & set(job_skills)

                if matched:
                    match_percentage = int(
                        (len(matched) / len(job_skills)) * 100
                    )

                    results.append({
                        "job_id": job.id,
                        "job_title": job.title,
                        "match_percentage": match_percentage,
                        "matched_skills": list(matched),
                    })

            # Sort by highest match %
            results = sorted(
                results,
                key=lambda x: x["match_percentage"],
                reverse=True
            )

            # Top 5 recommendations only
            results = results[:5]

            return Response({
                "resume_skills": resume_skills,
                "recommended_jobs": results
            })

        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ======================================================
# 6. RANKED CANDIDATES
# ======================================================
class RankedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            applications = JobApplication.objects.filter(
                job_id=job_id
            ).order_by("-ats_score")

            ranked_list = []

            for app in applications:
                ranked_list.append({
                    "resume_id": app.resume.id,
                    "candidate": app.resume.user.email if app.resume.user else None,
                    "ats_score": app.ats_score,
                    "skills_found": app.skills_found,
                    "missing_skills": app.missing_skills,
                    "applied_at": app.created_at
                })

            return Response({
                "job_id": job_id,
                "total_candidates": applications.count(),
                "ranked_candidates": ranked_list
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
# ======================================================
# 7. CANDIDATE – MY JOB APPLICATIONS
# ======================================================
class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Temporary: using email as identifier
        Later frontend will send logged-in user
        """
        email = request.query_params.get("email")

        if not email:
            return Response(
                {"error": "email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        applications = JobApplication.objects.filter(
            resume__candidate_email=email
        ).order_by("-applied_at")

        data = []
        for app in applications:
            data.append({
                "job_id": app.job_id,
               # "ats_score": app.ats_score,
                "applied_at": app.applied_at
            })

        return Response({
            "total_applied": len(data),
            "applications": data
        })
    # ======================================================
# 8. RECRUITER – APPLICANT COUNT PER JOB
# ======================================================
class JobApplicantCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        count = JobApplication.objects.filter(job_id=job_id).count()

        return Response({
            "job_id": job_id,
            "total_applicants": count
        })
# ======================================================
# 9. RECRUITER – UPDATE APPLICATION STATUS
# ======================================================
class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]  # later we make recruiter-only

    def post(self, request, application_id):
        try:
            status_value = request.data.get("status")

            if status_value not in ["shortlisted", "rejected"]:
                return Response(
                    {"error": "Status must be 'shortlisted' or 'rejected'"},
                    status=400
                )

            application = JobApplication.objects.get(id=application_id)
            application.status = status_value
            application.save()

            # Activity log
            if application.resume.user:
                log_activity(
                    user=application.resume.user,
                    action=f"Application {status_value} for Job ID {application.job.id}"
                )

            # Notification
            if application.resume.user:
                create_notification(
                    user=application.resume.user,
                    title="Application Update",
                    message=f"Your application for {application.job.title} was {status_value}"
                )

            return Response({
                "message": f"Application {status_value} successfully",
                "application_id": application.id,
                "status": application.status
            })

        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]
    """
    Candidate → View applied jobs
    (count + title + status + ATS + skills)
    """

    def get(self, request):
        applications = JobApplication.objects.filter(
            resume_user=request.user
        ).order_by("-applied_at")

        data = {
            "applications_count": applications.count(),
            "applications": []
        }

        for app in applications:
            # Get job title safely
            try:
                job = Job.objects.get(id=app.job_id)
                job_title = job.title
            except Job.DoesNotExist:
                job_title = "Job deleted"

            data["applications"].append({
                "job_title": job_title,
                "status": app.status,
                "role": "Candidate",

                # 🔥 These were missing
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills,
            })

        return Response(data)
class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("USER ID:", request.user.id)
        print("USER:", request.user)

        applications = JobApplication.objects.filter(
                        resume__user=request.user
                        ).select_related("job", "resume")
        print("USER:", request.user)
        print("APPLICATIONS QS:", applications)
        print("COUNT:", applications.count())
        print("APPLICATIONS QS:", applications)
        print("COUNT:", applications.count())

        data = {
            "applications_count": applications.count(),
            "applications": []
        }

        for app in applications:
            data["applications"].append({
                "job_title": app.job.title,
                "status": app.status,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills,
            })

        return Response(data)
class NotificationView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        data = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at

            }
            for n in notifications
        ]
        log_activity( user=request.user,  action=f"Shortlisted Resume ID {app.resume.id}")
        log_activity( user=request.user,  action=f"Rejected Resume ID {app.resume.id}")
        return Response(data)
class ActivityView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        activities = Activity.objects.filter(user=request.user).order_by("-created_at")
        data = [
            {
                "action": a.action,
                "created_at": a.created_at
            }
            for a in activities
        ]
        return Response(data)
class TopCandidatesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, job_id):
        applications = (
            JobApplication.objects
            .filter(job_id=job_id)
            .order_by("-ats_score")[:5]
        )

        data = []

        for app in applications:
            data.append({
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found
            })

        return Response(data)
class ShortlistedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(
            job_id=job_id,
            status="shortlisted"
        )

        data = []

        for app in applications:
            data.append({
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found
            })

        return Response(data)
class RejectedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(
            job_id=job_id,
            status="rejected"
        )

        data = []

        for app in applications:
            data.append({
                "candidate_email": app.resume.user.email if app.resume.user else None,
                "ats_score": app.ats_score
            })

        return Response(data)
from .models import JobApplication

class CandidateDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(candidate=request.user)

        applied = applications.filter(status="applied").count()
        shortlisted = applications.filter(status="shortlisted").count()
        rejected = applications.filter(status="rejected").count()

        avg_ats = Resume.objects.filter(user=request.user).aggregate(
            avg=Avg("ats_score")
        )["avg"] or 0

        return Response({
            "applied": applied,
            "shortlisted": shortlisted,
            "rejected": rejected,
            "total_applications": applied + shortlisted + rejected,
            "average_ats_score": round(avg_ats, 2),
        })
class AIResumeFeedbackView(APIView):
    permission_classes = []

    def post(self, request):
        resume_id = request.data.get("resume_id")

        if not resume_id:
            return Response({"error": "resume_id required"}, status=400)

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        resume_text = resume.extracted_text
        job_description = resume.job.description

        ai_raw = generate_resume_feedback(resume_text, job_description)

        return Response({"ai_feedback": ai_raw})
class RecentApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = (
            JobApplication.objects
            .filter(resume__user=request.user)
            .select_related("job", "resume")
            .order_by("-created_at")[:5]
        )

        data = []
        for app in applications:
            data.append({
                "job_title": app.job.title,
                "ats_score": app.ats_score,
                "status": app.status,
                "applied_date": app.created_at.strftime("%Y-%m-%d"),
            })

        return Response(data)
class MyApplicationsPagination(PageNumberPagination):
    page_size = 5


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")

        # get applications for logged in user
        applications = JobApplication.objects.filter(
            resume__user=request.user
        ).select_related("job", "resume").order_by("-id")

        # optional status filter
        if status_filter:
            applications = applications.filter(status=status_filter)

        paginator = MyApplicationsPagination()
        paginated_apps = paginator.paginate_queryset(applications, request)

        data = []
        for app in paginated_apps:
            data.append({
                "id": app.id,
                "job_title": app.job.title if app.job else "",
                "ats_score": app.ats_score,
                "status": app.status,
            })

        return paginator.get_paginated_response(data)
class RecruiterDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ✅ Check recruiter role
        try:
            profile = UserProfile.objects.get(user=user)
            if profile.role != "recruiter":
                return Response({"error": "Not a recruiter"}, status=403)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)

        # ✅ Only recruiter jobs
        recruiter_jobs = Job.objects.filter(recruiter=user)

        total_jobs = recruiter_jobs.count()

        # ✅ Applications only for recruiter jobs
        applications = JobApplication.objects.filter(job__in=recruiter_jobs)

        total_applications = applications.count()
        applied = applications.filter(status="applied").count()
        shortlisted = applications.filter(status="shortlisted").count()
        rejected = applications.filter(status="rejected").count()

        # ✅ Recent applications
        recent_apps = applications.order_by("-created_at")[:5]

        recent_data = []
        for app in recent_apps:
            recent_data.append({
                "candidate_email": app.resume.user.email if app.resume and app.resume.user else "N/A",
                "job_title": app.job.title if app.job else "N/A",
                "ats_score": app.ats_score,
                "status": app.status,
            })

        # ✅ Top candidates (by ATS score)
        top_candidates_qs = applications.order_by("-ats_score")[:5]

        top_candidates = []
        for app in top_candidates_qs:
            top_candidates.append({
                "application_id": app.id,
                "candidate_email": app.resume.user.email if app.resume and app.resume.user else "N/A",
                "job_title": app.job.title if app.job else "N/A",
                "ats_score": app.ats_score,
                "status": app.status,
            })

        return Response({
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "applied": applied,
            "shortlisted": shortlisted,
            "rejected": rejected,
            "recent_applications": recent_data,
            "top_candidates": top_candidates,
        })
    
# views.py

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Feedback

class FeedbackCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message required"}, status=400)

        Feedback.objects.create(
            user=request.user,
            message=message
        )

        return Response({"message": "Feedback submitted"})