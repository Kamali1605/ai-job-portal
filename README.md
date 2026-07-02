# AI Job Portal — Resume Analyzer

An AI-powered recruitment platform that helps candidates get discovered faster and recruiters hire smarter using AI-driven insights.

**Live Demo:** [https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)  
**Backend API:** [https://ai-job-portal-1-mdi9.onrender.com](https://ai-job-portal-1-mdi9.onrender.com)

---

## Features

- AI Resume Analysis with ATS scoring and skill matching
- Role-based dashboards for Candidates and Recruiters
- Resume builder that generates ATS-optimized PDFs
- JWT authentication (login / register)
- Job posting, application tracking, and shortlisting
- AI feedback using OpenAI GPT

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 16, React 19, Tailwind CSS |
| Backend   | Django 6, Django REST Framework   |
| Auth      | JWT (SimpleJWT)                   |
| AI        | OpenAI API                        |
| PDF       | ReportLab                         |
| Deploy    | Vercel (frontend) + Railway (backend) |

---

## Local Development

### Backend

```bash
cd frontend/backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Create `frontend/backend/.env`:
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENAI_API_KEY=your-openai-key
CORS_ALLOW_ALL_ORIGINS=True
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the repo, set **Root Directory** to `frontend/backend`
3. Add these environment variables in Railway dashboard:
   ```
   SECRET_KEY=<strong-random-key>
   DEBUG=False
   ALLOWED_HOSTS=<your-railway-domain>.up.railway.app
   OPENAI_API_KEY=<your-openai-key>
   CORS_ALLOW_ALL_ORIGINS=False
   CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
   ```
4. Railway auto-detects `Procfile` and runs `gunicorn`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add this environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-domain>.up.railway.app
   ```
4. Deploy — Vercel auto-detects Next.js

---

## Project Structure

```
ai-job-portal/
├── frontend/               # Next.js app
│   ├── app/                # Pages (App Router)
│   ├── lib/api.ts          # Centralized API base URL
│   └── backend/            # Django backend
│       ├── core/           # Settings, URLs
│       ├── users/          # Auth & user management
│       ├── jobs/           # Job CRUD & applications
│       ├── resume_app/     # Resume upload, analysis, AI feedback
│       └── requirements.txt
```
