import re
import os


# =========================
# TEXT EXTRACTION
# =========================

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    return ""


def extract_text_from_pdf(path):
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                if page.extract_text():
                    text += page.extract_text() + "\n"
        return text.strip()
    except Exception:
        return ""


def extract_text_from_docx(path):
    try:
        from docx import Document
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


# =========================
# ATS LOGIC
# =========================

SKILL_LIBRARY = [
    "python", "java", "c++", "sql", "django", "flask",
    "html", "css", "javascript", "react",
    "node", "git", "docker", "aws",
    "machine learning", "data analysis"
]


def extract_skills_from_text(text):
    text = text.lower()
    found = []

    for skill in SKILL_LIBRARY:
        if re.search(r"\b" + re.escape(skill) + r"\b", text):
            found.append(skill)

    return list(set(found))

def compare_skills(resume_skills, job_skills):
    resume_set = set(resume_skills)
    job_set = set(job_skills)

    return (
        list(resume_set & job_set),
        list(job_set - resume_set)
    )


def calculate_ats_score(skills_found, total_job_skills):
    if total_job_skills == 0:
        return 0
    return int((len(skills_found) / total_job_skills) * 100)
from .models import Activity, Notification

# -------------------------
# Activity Logger
# -------------------------
def log_activity(user, action):
    """
    Logs an activity for a user
    """
    Activity.objects.create(
        user=user,
        action=action
    )


# -------------------------
# Notification Creator
# -------------------------
def create_notification(user, title, message):
    """
    Creates a notification for a user
    """
    Notification.objects.create(
        user=user,
        title=title,
        message=message
    )


