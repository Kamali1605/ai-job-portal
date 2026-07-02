# 🚀 Deployment Guide

This guide walks you through deploying your AI Job Portal to production.

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] OpenAI API key ready
- [ ] Both Railway and Vercel accounts created

---

## 🔧 Backend Deployment (Railway)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `ai-job-portal` repository
4. Click **Add variables** and set:

```env
SECRET_KEY=<generate-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=<your-project>.up.railway.app
OPENAI_API_KEY=<your-openai-key>
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
```

> **Generate SECRET_KEY:** Run `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

5. Go to **Settings** → Set **Root Directory** to `frontend/backend`
6. Railway will auto-detect your `Procfile` and deploy
7. Wait for build to complete (2-3 minutes)
8. Copy your Railway domain: `https://<your-project>.up.railway.app`

### Step 3: Run Migrations (One-time)

In Railway dashboard → your service → **Settings** → **Variables** → Add a deploy hook or use Railway CLI:

```bash
# Install Railway CLI (optional)
npm i -g @railway/cli
railway login
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

Or manually via Railway's deployed shell.

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://<your-railway-app>.up.railway.app
```

6. Click **Deploy**
7. Wait 1-2 minutes for build
8. Copy your Vercel URL: `https://<your-app>.vercel.app`

### Step 2: Update Backend CORS

Go back to Railway → Environment Variables → Update:

```env
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
```

Redeploy if needed (Railway auto-redeploys on env changes).

---

## ✅ Verify Deployment

1. Visit your Vercel frontend URL
2. Register a new account (Candidate or Recruiter)
3. Login and test dashboard
4. Upload a resume and analyze it
5. Check if AI features work (requires valid OpenAI API key)

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** 500 Internal Server Error

**Solution:** Check Railway logs:
- Railway Dashboard → Your service → **Deployments** → Click latest → **View Logs**
- Common issues:
  - Missing migrations: Run `python manage.py migrate` in Railway console
  - Missing `SECRET_KEY` or `OPENAI_API_KEY`

**Problem:** CORS errors in browser

**Solution:** 
- Ensure `CORS_ALLOWED_ORIGINS` includes your Vercel URL (with https://)
- No trailing slashes in the URL

### Frontend Issues

**Problem:** API calls fail with 404

**Solution:**
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Ensure Railway backend is running
- Test backend directly: `https://<railway-url>/api/jobs/`

**Problem:** Build fails on Vercel

**Solution:**
- Check Vercel build logs
- Ensure `frontend` is set as Root Directory
- Run `npm run build` locally first to catch errors

---

## 📝 Post-Deployment

### Update README with Live URLs

```markdown
**Live Demo:** https://your-app.vercel.app
**Backend API:** https://your-project.up.railway.app
```

### Test Production

- [ ] User registration works
- [ ] Login and JWT auth works
- [ ] Resume upload and analysis works
- [ ] Job posting works (recruiter)
- [ ] AI feedback works (with OpenAI key)

### Monitor

- Railway: Check logs and resource usage
- Vercel: Check analytics and function logs

---

## 🔐 Security Notes

- Never commit `.env` files
- Use strong `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Use environment variables for all secrets
- Regular security updates: `pip list --outdated` and `npm outdated`

---

## 📌 Useful Commands

### Local Development

```bash
# Backend
cd frontend/backend
venv\Scripts\activate
python manage.py runserver

# Frontend
cd frontend
npm run dev
```

### Production Health Check

```bash
# Test backend
curl https://<railway-url>/api/jobs/

# Check frontend
curl https://<vercel-url>/
```

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
- Next.js Deployment: https://nextjs.org/docs/deployment
