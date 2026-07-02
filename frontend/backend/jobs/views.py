
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from .serializers import JobSerializer
from rest_framework.permissions import IsAuthenticated

from .models import Job
from resume_app.models import Resume, JobApplication
from .utils import extract_skills_from_text
from .utils import (
    extract_skills_from_text,
    compare_skills,
    calculate_ats_score
)

# CREATE JOB (Recruiter)
class JobCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(recruiter=request.user)  # ✅ important
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# LIST ALL JOBS (Candidate)
class JobListView(APIView):
 permission_classes = [IsAuthenticated]
 def get(self, request):
        jobs = Job.objects.all().order_by("-created_at")
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


# JOB DETAIL
class JobDetailView(APIView):
    def get(self, request, id):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        serializer = JobSerializer(job)
        return Response(serializer.data)
class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        resume_id = request.data.get("resume_id")

        # Validate job
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        # Validate resume
        try:
            resume = Resume.objects.get(id=resume_id)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=404)

        # ATS calculation
        resume_skills = extract_skills_from_text(resume.extracted_text)
        job_skills = extract_skills_from_text(job.description)

        skills_found, missing_skills = compare_skills(resume_skills, job_skills)
        ats_score = calculate_ats_score(skills_found, len(job_skills))

        # Create application ✅ (NO user field)
        application = JobApplication.objects.create(
            job=job,
            resume=resume,
            ats_score=ats_score,
            skills_found=skills_found,
            missing_skills=missing_skills,
        )

        return Response(
            {
                "message": "Job applied successfully",
                "application_id": application.id,
                "ats_score": ats_score,
                "skills_found": skills_found,
                "missing_skills": missing_skills,
            },
            status=status.HTTP_201_CREATED,
        )
class ShortlistCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        # how many candidates to shortlist
        top_n = int(request.data.get("top_n", 3))  # default = 3

        applications = JobApplication.objects.filter(job=job).order_by("-ats_score")[:top_n]

        shortlisted_ids = []

        for app in applications:
            app.status = "shortlisted"
            app.save()
            shortlisted_ids.append(app.id)

        return Response(
            {
                "message": "Candidates shortlisted successfully",
                "shortlisted_application_ids": shortlisted_ids
            },
            status=status.HTTP_200_OK
        )
class RejectCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        application_ids = request.data.get("application_ids", [])

        if not application_ids:
            return Response({"error": "No application IDs provided"}, status=400)

        applications = JobApplication.objects.filter(
            job_id=job_id,
            id__in=application_ids
        )

        rejected_ids = []

        for app in applications:
            app.status = "rejected"
            app.save()
            rejected_ids.append(app.id)

        return Response(
            {
                "message": "Candidates rejected successfully",
                "rejected_application_ids": rejected_ids
            },
            status=status.HTTP_200_OK
        )
class RankedCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        applications = JobApplication.objects.filter(job_id=job_id).order_by("-ats_score")

        data = []

        for app in applications:
            data.append({
                "application_id": app.id,
                "resume_id": app.resume.id,
                "ats_score": app.ats_score,
                "status": app.status,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills
            })

        return Response(data, status=status.HTTP_200_OK)
class ShortlistedCandidatesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        shortlisted_apps = JobApplication.objects.filter(
            job=job,
            status="shortlisted"
        ).order_by("-ats_score")

        data = []
        for app in shortlisted_apps:
            data.append({
                "application_id": app.id,
                "resume_id": app.resume.id,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills,
                "status": app.status
            })

        return Response(data, status=200)
class RejectedCandidatesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        rejected_apps = JobApplication.objects.filter(
            job=job,
            status="rejected"
        ).order_by("-ats_score")

        data = []
        for app in rejected_apps:
            data.append({
                "application_id": app.id,
                "resume_id": app.resume.id,
                "ats_score": app.ats_score,
                "skills_found": app.skills_found,
                "missing_skills": app.missing_skills,
                "status": app.status
            })

        return Response(data, status=200)
    

class MyJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only jobs created by this recruiter
        jobs = Job.objects.filter(recruiter=request.user).order_by("-created_at")
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
