def generate_ats_resume(
    original_text,
    job_title,
    skills_found,
    missing_skills,
):
    sections = []

    sections.append("PROFESSIONAL SUMMARY")
    sections.append(
        f"ATS-optimized resume tailored for the role of {job_title}."
    )

    sections.append("\nKEY SKILLS")
    sections.append(", ".join(skills_found + missing_skills))

    sections.append("\nEXPERIENCE")
    sections.append(
        "• Worked on relevant technologies\n"
        "• Followed industry best practices\n"
        "• Collaborated with teams"
    )

    sections.append("\nEDUCATION")
    sections.append("Bachelor’s Degree or equivalent experience")

    sections.append("\nORIGINAL RESUME CONTENT")
    sections.append(original_text)

    ats_resume = "\n\n".join(sections)

    recommendations = []
    for skill in missing_skills:
        recommendations.append(f"Add experience or projects related to {skill}")

    return {
        "resume": ats_resume,
        "recommendations": recommendations
    }
