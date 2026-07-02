def build_human_resume(data):
    lines = []

    # HEADER
    lines.append(data["name"].upper())
    lines.append(
        f"Email: {data['email']} | "
        f"LinkedIn: {data.get('linkedin', '')} | "
        f"GitHub: {data.get('github', '')}"
    )
    lines.append("")

    # SUMMARY
    lines.append("PROFESSIONAL SUMMARY")
    lines.append(data["summary"])
    lines.append("")

    # SKILLS
    lines.append("SKILLS")
    lines.append(" • ".join(data["skills"]))
    lines.append("")

    # INTERNSHIPS
    lines.append("INTERNSHIP EXPERIENCE")
    for i in data["internships"]:
        lines.append(f"{i['role']} – {i['company']} ({i['duration']})")
        lines.append(f"• {i['description']}")
        lines.append("")

    # PROJECTS
    lines.append("PROJECTS")
    for p in data["projects"]:
        lines.append(p["title"])
        lines.append(f"• {p['description']}")
        lines.append("")

    # EDUCATION
    edu = data["education"]
    lines.append("EDUCATION")
    lines.append(f"{edu['degree']} – {edu['college']}")
    lines.append(f"CGPA: {edu['cgpa']}")

    return lines