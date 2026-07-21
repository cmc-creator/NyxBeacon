# NyxBeacon - Working Deployment Guide

## ✅ System Status: FULLY FUNCTIONAL LOCALLY

All components are verified working:
- **React Frontend** ✅ Rendering correctly
- **Express Backend** ✅ Running on localhost:3000  
- **Prisma ORM** ✅ Connected to cloud PostgreSQL
- **Database** ✅ 56 hospital beds across 3 units with sample patient data
- **Frontend-Backend Integration** ✅ API calls working

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- DATABASE_URL environment variable set to Prisma PostgreSQL connection

### Start Backend Server
```bash
# Terminal 1 - Start Express API on localhost:3000
$env:DATABASE_URL='postgres://1f8eaa684a3f5903b06db6305b40a27b51a5a944e0e0250897b25f3e93fe0f9b:sk_hng7__cxKOQYEGomscPuo@db.prisma.io:5432/postgres?sslmode=require'
cd packages/server
npm install
npm run build
node dist/index.js
```

Server will start at: `http://localhost:3000`
- API Endpoint: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

### Start Frontend (Development)
```bash
# Terminal 2 - Start Vite dev server on localhost:5173
cd packages/client
npm install
npm run dev
```

Open browser: `http://localhost:5173`

### Start Frontend (Production Build)
```bash
# Terminal 2 - Serve static dist folder on localhost:8080
cd packages/client
npm install
npm run build
cd dist
python -m http.server 8080
```

Open browser: `http://localhost:8080`

---

## 📊 Verified Data

**Hospital Setup:**
- 3 Units: ICU (3rd Floor, 12 beds), Medical/Surgical (2nd Floor, 24 beds), Orthopedic (1st Floor, 20 beds)
- 56 Total Beds across all units
- Sample Data: 3 patients, 3 beds occupied, 53 available

**API Endpoints (All Working):**
- `GET /api/beds` - All beds with unit info
- `GET /api/units` - Hospital units
- `GET /api/patients` - Patient records  
- `GET /api/admissions` - Active admissions
- `GET /api/discharges` - Recent discharges
- `GET /health` - Server health check

---

## 🔧 Configuration

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://user:pass@db.prisma.io:5432/dbname?sslmode=require"
NODE_ENV="development"
PORT=3000
VITE_API_URL="http://localhost:3000"
```

### API Client Configuration (packages/client/src/services/api.ts)
```typescript
const API_BASE_URL = 'http://localhost:3000/api'
```

---

## 🎯 Frontend Features

- **Bed Board**: 56-bed grid/list visualization with status indicators
- **Patient Management**: Admissions form for new patients
- **Discharge Management**: Process patient discharges
- **Census Explorer**: Hospital occupancy analytics
- **Real-time Status**: Color-coded bed status (Available, Occupied, Maintenance, etc.)
- **Premium Dark Theme**: Glass morphism UI with gradients

---

## 📁 Project Structure

```
packages/
├── server/          # Express backend
│   ├── src/index.ts
│   ├── prisma/schema.prisma
│   └── dist/        # Compiled output
├── client/          # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── services/api.ts
│   └── dist/        # Built static files
└── prisma/          # Database schema (deprecated - use packages/server/prisma)
```

---

## 🐛 Troubleshooting

**Backend won't start**: Verify DATABASE_URL environment variable is set
**Frontend can't reach API**: Check backend is running on port 3000
**Database connection fails**: Verify PostgreSQL connection string and firewall

---

## 📝 Next Steps for Production

1. **Deploy Backend**: Use Vercel Serverless Functions (currently debugging 404 errors)
2. **Deploy Frontend**: Already working on Vercel (nyxbeacon.com)
3. **Fix Vercel API**: Investigate why `api/index.js` returns 404 on Vercel
4. **Add Authentication**: JWT token validation (partially implemented)
5. **Enable Socket.io**: Real-time updates (code ready in packages/server/src/index.ts)

---

**Last Updated**: July 20, 2026
**Commit**: 4063a5c - Fix local development: API routes and client endpoints working
