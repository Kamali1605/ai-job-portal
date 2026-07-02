# 🚀 Deployment Guide

Backend → **Render.com** (Free)  
Frontend → **Vercel** (Free)

---

## 🔧 Step 1 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up / Log in (free, no credit card)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo `ai-job-portal`
4. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `ai-job-portal-backend` |
   | **Root Directory** | `frontend/backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
   | **Start Command** | `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT` |
   | **Plan** | `Free` |

5. Scroll down to **Environment Variables** → add these:

   ```
   SECRET_KEY         = <generate below>
   DEBUG              = False
   ALLOWED_HOSTS      = ai-job-portal-backend.onrender.com
   OPENAI_API_KEY     = <your openai key>
   CORS_ALLOW_ALL_ORIGINS = False
   CORS_ALLOWED_ORIGINS   = https://your-vercel-app.vercel.app
   ```

   > **Generate SECRET_KEY** — run this in your terminal:
   > ```bash
   > python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   > ```

6. Click **Create Web Service** → wait ~3 minutes for build
7. Copy your Render URL: `https://ai-job-portal-backend.onrender.com`

---

## 🌐 Step 2 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in (free)
2. Click **Add New** → **Project** → Import `ai-job-portal` from GitHub
3. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | **Root Directory** | `frontend` |
   | **Framework** | Next.js (auto-detected) |

4. Add environment variable:

   ```
   NEXT_PUBLIC_API_URL = https://ai-job-portal-backend.onrender.com
   ```

5. Click **Deploy** → wait ~2 minutes
6. Copy your Vercel URL: `https://ai-job-portal-xxx.vercel.app`

---

## 🔁 Step 3 — Update CORS on Render

Go back to Render → your service → **Environment** → update:

```
CORS_ALLOWED_ORIGINS = https://your-actual-vercel-url.vercel.app
```

Render auto-redeploys when you save env vars.

---

## ✅ Step 4 — Test

1. Visit your Vercel URL
2. Register as Candidate and Recruiter
3. Test login, resume upload, job posting

---

## ⚠️ Free Tier Notes

- **Render free tier** spins down after 15 min of inactivity — first request after idle takes ~30 sec to wake up. This is normal.
- **Vercel** has no such limitation.

---

## 📌 Local Development

```bash
# Backend
cd frontend/backend
venv\Scripts\activate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm run dev
```

`.env.local` for frontend:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

`.env` for backend:
```
SECRET_KEY=any-local-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENAI_API_KEY=your-key
CORS_ALLOW_ALL_ORIGINS=True
```
