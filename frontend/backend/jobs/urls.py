from django.urls import path
from .views import JobCreateView, JobListView, JobDetailView,ApplyJobView,ShortlistCandidatesView,RejectCandidatesView,RankedCandidatesView,ShortlistedCandidatesListView,RejectedCandidatesListView

from .views import MyJobsView

urlpatterns = [
    path("", JobListView.as_view()),
    path("create/", JobCreateView.as_view()),
    path("my-jobs/", MyJobsView.as_view()),  # ✅ ADD THIS
    path("<int:id>/", JobDetailView.as_view()),
    path("apply-job/", ApplyJobView.as_view()),
    path("<int:job_id>/shortlist/", ShortlistCandidatesView.as_view()),
    path("<int:job_id>/reject/", RejectCandidatesView.as_view()),
    path("<int:job_id>/ranked/", RankedCandidatesView.as_view()),
    path("<int:job_id>/shortlisted/", ShortlistedCandidatesListView.as_view()),
    path("<int:job_id>/rejected/", RejectedCandidatesListView.as_view()),
]