from django.db import models
from django.conf import settings
from jobs.models import Job
from django.contrib.auth import get_user_model
user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE
)
User = get_user_model()

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    file = models.FileField(upload_to="resumes/")
    extracted_text = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.job.title}"
   # candidate_email = models.EmailField()
    file = models.FileField(upload_to="resumes/", blank=True, null=True)
    extracted_text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email


class JobApplication(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    ats_score = models.FloatField()
    skills_found = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    status = models.CharField(
        max_length=20,
        choices=[("applied", "Applied"), ("shortlisted", "Shortlisted"), ("rejected", "Rejected")],
        default="applied"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
     return f"Job {self.job_id} - Resume {self.resume_id}"
class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_notifications"  # ✅ UNIQUE
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
   
    
    def __str__(self):
        return self.title
    
    
class Activity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_activities"  # ✅ UNIQUE
    )
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self
# models.py

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
