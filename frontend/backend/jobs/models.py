from django.conf import settings
from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="jobs"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title