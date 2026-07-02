import re

COMMON_SKILLS = [
    "python", "django", "react", "javascript", "html", "css",
    "sql", "postgresql", "mysql", "git", "github",
    "rest api", "docker", "aws", "linux",
    "machine learning", "data analysis", "pandas", "numpy"
]


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)  # remove symbols
    text = re.sub(r"\s+", " ", text)          # normalize spaces
    return text.strip()


def analyze_resume_text(resume_text: str, job_description: str | None = None):
    normalized_text = normalize_text(resume_text)

    words = set(normalized_text.split())

    found_skills = []

    for skill in COMMON_SKILLS:
        skill_words = skill.split()

        # Multi-word skill check
        if len(skill_words) > 1:
            if skill in normalized_text:
                found_skills.append(skill)
        else:
            if skill in words:
                found_skills.append(skill)

    missing_skills = []
    suggestions = []

    if job_description:
        job_text = normalize_text(job_description)
        job_words = set(job_text.split())

        job_skills = []

        for skill in COMMON_SKILLS:
            skill_words = skill.split()
            if len(skill_words) > 1:
                if skill in job_text:
                    job_skills.append(skill)
            else:
                if skill in job_words:
                    job_skills.append(skill)

        missing_skills = [
            skill for skill in job_skills if skill not in found_skills
        ]

        ats_score = int((len(found_skills) / max(len(job_skills), 1)) * 100)
    else:
        ats_score = min(100, 40 + len(found_skills) * 6)

    if missing_skills:
        suggestions.append(
            f"Add or highlight these skills: {', '.join(missing_skills)}"
        )

    if ats_score < 70:
        suggestions.append(
            "Improve ATS score by adding measurable achievements, tools, and certifications."
        )

    return {
        "ats_score": ats_score,
        "skills_found": found_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
    }
