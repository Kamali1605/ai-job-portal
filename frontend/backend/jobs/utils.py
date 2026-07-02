def extract_skills_from_text(text):
    if not text:
        return []

    skills_list = [
        "python", "django", "sql", "rest", "machine learning",
        "html", "css", "javascript", "react", "java"
    ]

    text = text.lower()

    found = [skill for skill in skills_list if skill in text]

    return found
def compare_skills(resume_skills, job_skills):
    found = list(set(resume_skills) & set(job_skills))
    missing = list(set(job_skills) - set(resume_skills))
    return found, missing


def calculate_ats_score(found_skills, total_required):
    if total_required == 0:
        return 0
    return (len(found_skills) / total_required) * 100