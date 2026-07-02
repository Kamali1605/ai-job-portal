from django.urls import path
from .views import MeView
from .views import (
    ResumeUploadView,
    GenerateATSResumeView,
    BuildATSResumeView,
    RecommendedJobsView,
    RankedCandidatesView,
    MyApplicationsView,
    CandidateDashboardView,
    RecruiterDashboardView,
    ActivityView,
    NotificationView,
    UpdateApplicationStatusView,
    TopCandidatesView,
    ShortlistedCandidatesView,
    RejectedCandidatesView,
    CandidateDashboardSummaryView,
    AIResumeFeedbackView,
    RecentApplicationsView,
    FeedbackCreateView
)

urlpatterns = [
    path("upload/", ResumeUploadView.as_view(), name="resume-upload"),
    
    path(
    "api/generate-ats/<int:resume_id>/",
    GenerateATSResumeView.as_view(),
    name="generate-ats",
),
    path("build-resume-pdf/", BuildATSResumeView.as_view(), name="build-resume-pdf"),
    path("recommend-jobs/<int:resume_id>/", RecommendedJobsView.as_view(), name="recommend-jobs"),
    path("ranked-candidates/<int:job_id>/", RankedCandidatesView.as_view()),
    path("my-applications/", MyApplicationsView.as_view(), name="my-applications"),
    path("candidate/dashboard/", CandidateDashboardView.as_view()),
    path("recruiter/dashboard/", RecruiterDashboardView.as_view()),
   
    path("activity/", ActivityView.as_view()),
    path("notifications/", NotificationView.as_view()),

   # path("register/", RegisterView.as_view()),
    #path("login/", LoginView.as_view()),
    path("me/", MeView.as_view()),
    path(
    "application-status/<int:application_id>/",UpdateApplicationStatusView.as_view()
),
   # path("recruiter/dashboard/<int:job_id>/", RecruiterDashboardView.as_view()),
path("recruiter/top-candidates/<int:job_id>/", TopCandidatesView.as_view()),
path("recruiter/shortlisted/<int:job_id>/", ShortlistedCandidatesView.as_view()),
path("recruiter/rejected/<int:job_id>/", RejectedCandidatesView.as_view()),
path("candidate/dashboard/", CandidateDashboardSummaryView.as_view()),
path("analyze/", ResumeUploadView.as_view(), name="resume-analyze"),
path("candidate/dashboard/", CandidateDashboardView.as_view(), name="candidate-dashboard"),
path("ai-feedback/", AIResumeFeedbackView.as_view(), name="ai-feedback"),
path("ai-feedback/", AIResumeFeedbackView.as_view()),
path("recent-applications/", RecentApplicationsView.as_view()),
path("feedback/", FeedbackCreateView.as_view()),
]
