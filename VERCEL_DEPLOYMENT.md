# NyxBeacon Vercel + Postgres Deployment Guide

## 🚀 Deploying to Vercel with Postgres

### Step 1: Create Vercel Postgres Database

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create project
vercel

# Add Postgres database
vercel env pull
```

This creates a `.env.local` with `POSTGRES_PRISMA_URL` and other database connection strings.

### Step 2: Update Environment Variables

In your Vercel Project Settings → Environment Variables, add:

```
DATABASE_URL=<POSTGRES_PRISMA_URL from vercel env>
NODE_ENV=production
VITE_API_URL=https://your-project.vercel.app
```

### Step 3: Set Up Database Schema

```bash
# Run migrations on Vercel database
vercel env pull  # Get latest env vars

# Push schema to Vercel Postgres
npm run db:push

# Seed data (optional)
npm run db:seed
```

### Step 4: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or simply commit to git - Vercel auto-deploys if connected
git push origin main
```

---

## 🔗 Vercel Postgres Connection

Update `.env` with the Vercel Postgres URL:

```bash
# Local development (use local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/nyxbeacon"

# Vercel deployment (use Vercel Postgres)
DATABASE_URL="postgresql://user:password@host.postgres.vercel.com:5432/nyxbeacon"
```

---

## 📚 Architecture for Vercel

```
Frontend: Vercel (Vite + React)
  └─ packages/client/dist → Deployed to Vercel Edge

Backend: Vercel Serverless Functions (optional)
  └─ packages/server → Deploy as API routes or use Vercel Functions

Database: Vercel Postgres
  └─ PostgreSQL managed by Vercel
  └─ Connection via POSTGRES_PRISMA_URL

ORM: Prisma
  └─ Connects to Vercel Postgres
  └─ Schema version controlled in git
```

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed with `--ignore-scripts`
- [ ] `.env` file with `DATABASE_URL` configured
- [ ] Prisma schema pushed: `npm run db:push`
- [ ] Database seeded: `npm run db:seed`
- [ ] Local tests pass: `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] All files committed to Git
- [ ] GitHub repository created and linked

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git** - Use Vercel's Environment Variables
2. **Use connection pooling** - Vercel Postgres includes PgBouncer
3. **Enable SSL** - Vercel Postgres enforces SSL by default
4. **Rotate secrets** - Regularly update database passwords
5. **Use API keys** - Generate project-specific API tokens

---

## 🆘 Troubleshooting

### "Connection refused" errors
- Verify `DATABASE_URL` is correct in Vercel
- Check Vercel Postgres status dashboard
- Ensure firewall allows Vercel IPs

### Prisma migration fails
```bash
# Run with shadow database
npx prisma migrate deploy

# Or force reset (⚠️ loses data)
npx prisma migrate reset
```

### Build fails
```bash
# Check build logs in Vercel dashboard
# Usually caused by missing environment variables or TypeScript errors
# Ensure all dependencies are installed
npm run build
```

---

## 📊 Monitoring

Monitor your deployment at:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Database:** Project Settings → Database
- **Logs:** Deployments → Logs
- **Metrics:** Analytics tab

