# NyxBeacon Hospital Bed Board System - Development Guide

## Project Overview
Full-stack hospital bed board and patient management platform with real-time dashboard, admissions/discharge tracking, and visual status indicators.

## Architecture
- **Monorepo**: yarn workspaces (packages/server, packages/client, packages/prisma)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Real-time**: Socket.io

## Setup Checklist

- [x] Project structure and configuration created
- [ ] Install dependencies and setup database
- [ ] Generate Prisma client and run migrations
- [ ] Build backend and frontend
- [ ] Start development servers
- [ ] Test core functionality

## Key Files
- `packages/server/src/index.ts` - Express server entry
- `packages/client/src/App.tsx` - React app entry
- `packages/prisma/schema.prisma` - Database schema
- `packages/server/src/routes/` - API endpoints
- `packages/client/src/components/` - React components

## Commands
```bash
# Install all dependencies
yarn install

# Setup database
yarn db:push

# Seed sample data
yarn db:seed

# Start development
yarn dev

# View database
yarn db:studio
```

## Environment Variables
Create `.env` in root:
```
DATABASE_URL="postgresql://user:password@localhost:5432/nyxbeacon"
NODE_ENV="development"
PORT=3000
VITE_API_URL="http://localhost:3000"
```
