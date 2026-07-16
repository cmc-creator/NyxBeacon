# NyxBeacon - GitHub + Vercel Quick Setup

## 📝 Step 1: Create GitHub Repository

### Local Setup (Already Done)
```bash
cd NyxBeacon
git init
git add .
git commit -m "Initial commit"
```

### Create Remote Repository

1. Go to **GitHub.com** → Sign in
2. Click **"New repository"**
3. Name it: `NyxBeacon`
4. Add description: *"Luxury Hospital Bed Board Management System"*
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### Connect Local to Remote

```bash
git remote add origin https://github.com/YOUR_USERNAME/NyxBeacon.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to **Vercel.com** → Sign in (or create account)
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account
5. Select the `NyxBeacon` repository
6. Configure project:
   - **Framework:** Vite
   - **Root Directory:** ./packages/client
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --ignore-scripts`

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd NyxBeacon
vercel --prod
```

---

## 🗄️ Step 3: Add Vercel Postgres

### In Vercel Dashboard

1. Go to your project → **"Storage"** tab
2. Click **"Create"** → **"Postgres"**
3. Name: `nyxbeacon-db`
4. Region: Same as your project (recommended)
5. Click **"Create"**

### Connect to Application

```bash
# Pull database credentials
vercel env pull

# This creates .env.local with:
# - POSTGRES_PRISMA_URL
# - POSTGRES_URL_NON_POOLING
# - etc.
```

---

## 🔗 Step 4: Push Database Schema

### Using Vercel's Database Credentials

```bash
# Ensure DATABASE_URL points to Vercel Postgres
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = <POSTGRES_PRISMA_URL from .env.local>
NODE_ENV = production
VITE_API_URL = https://your-project.vercel.app
```

---

## ✅ Verification

### Local Testing
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Deployed Testing
```bash
# Frontend: https://your-project.vercel.app
# Backend: https://your-project.vercel.app/api
# Health: https://your-project.vercel.app/api/health
```

---

## 📊 What Gets Deployed

| Component | Location | Status |
|-----------|----------|--------|
| **Frontend** | packages/client → Vercel Edge | ✅ Deployed |
| **Backend** | packages/server → Vercel Functions | ✅ Deployed |
| **Database** | Vercel Postgres | ✅ Provisioned |
| **Schema** | Prisma migrations | ✅ Pushed |
| **Sample Data** | Database seed | ✅ Loaded |

---

## 🔒 Security Checklist

- [ ] `.env` NOT committed to Git
- [ ] Environment variables set in Vercel dashboard
- [ ] Database URL uses SSL (enforced by Vercel)
- [ ] API endpoints protected (if needed)
- [ ] Secrets rotated after first deployment

---

## 📞 Next Steps

1. **Customize deployment:** Update `vercel.json` as needed
2. **Set up monitoring:** Use Vercel Analytics + PostgreSQL logs
3. **Enable auto-deploys:** Connect GitHub for automatic deployments
4. **Configure domain:** Add custom domain in Vercel settings
5. **Scale as needed:** Vercel auto-scales based on traffic

---

## 🔗 Useful Links

- **GitHub:** https://github.com/YOUR_USERNAME/NyxBeacon
- **Vercel Project:** https://vercel.com/dashboard/YOUR_USERNAME/nyxbeacon
- **Database:** Vercel Dashboard → Storage → Postgres
- **Logs:** Vercel Dashboard → Deployments → Logs

---

**Status:** Ready for GitHub + Vercel deployment! 🚀
