from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_resume_feedback(resume_text, job_description):
    prompt = f"""
You are an ATS resume expert.

Job Description:
{job_description}

Resume:
{resume_text}

Give:
1. ATS score out of 100
2. Strengths
3. Missing keywords
4. Improvement suggestions
5. Recommended projects
6. Recommended skills to learn

Return in JSON format.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content