# 🚀 NyxBeacon - Quick Start Guide

## System Requirements
- **Node.js**: 18.0.0 or higher
- **npm/Yarn**: 8.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Git**: For version control

## Installation Steps

### 1️⃣ **Install Dependencies**
```bash
# From project root
yarn install
```

### 2️⃣ **Setup Database**
Before running the application, ensure PostgreSQL is running and create a database:

```bash
# Create database (macOS/Linux)
createdb nyxbeacon

# Or on Windows with PostgreSQL installed:
psql -U postgres -c "CREATE DATABASE nyxbeacon;"
```

Update `.env` with your database credentials if needed.

### 3️⃣ **Initialize Database Schema**
```bash
# Push Prisma schema to database
yarn db:push

# Seed with sample data
yarn db:seed
```

### 4️⃣ **Start Development Servers**
```bash
# Start both backend (port 3000) and frontend (port 5173)
yarn dev
```

## 🎯 Access the Application

Once development servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Database UI**: `yarn db:studio` (opens Prisma Studio on port 5555)

## 📊 What You'll See

### Dashboard Components

**1. Bed Board**
- Real-time room status with color-coded indicators
- Grid or list view of all hospital beds
- Filter by unit
- Quick occupancy statistics

**2. Admissions**
- Admit new patients
- Select available rooms
- Set clinical level and special needs
- Automatic room status updates

**3. Discharges**
- Schedule formal discharge dates/times
- Automatically triggers housekeeping alerts
- Track discharge status
- Confirm and complete discharges

**4. Census Explorer**
- Hospital-wide occupancy statistics
- Unit-level breakdown
- Real-time occupancy rates
- Export data to CSV

## 🎨 Sample Data

The database seeds with:
- **3 Hospital Units**: ICU, Medical/Surgical, Skilled Nursing
- **56 Beds**: Distributed across units with mixed occupancy
- **3 Sample Patients**: With active admissions
- **1 Scheduled Discharge**: Ready to complete

## 🔧 Development Commands

```bash
# Start development with hot reload
yarn dev

# Build for production
yarn build

# Run production build
yarn start

# View database with Prisma Studio
yarn db:studio

# Run database migrations
yarn db:migrate

# Reset database (⚠️ destructive)
yarn db:push --force-reset
```

## 📱 Main Features

✅ **Real-time Bed Board Dashboard** - Color-coded room status (Available, Occupied, Pending Discharge, Maintenance)

✅ **Smart Admissions** - Place patients in appropriate rooms by unit, gender, care level

✅ **Discharge Management** - Schedule formal discharge dates/times with automatic alerts

✅ **Census Explorer** - Advanced filtering, occupancy analytics, and data export

✅ **Housekeeping Integration** - Automatic task generation for room cleaning

✅ **Responsive Design** - Works on desktop, tablet, and mobile browsers

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Windows: Use Task Manager or:
netstat -ano | findstr :3000
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check .env has correct DATABASE_URL
cat .env

# Test connection manually
psql postgresql://postgres:postgres@localhost:5432/nyxbeacon
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules yarn.lock
yarn install
```

## 📚 Project Structure

```
nyxbeacon-bedboard/
├── packages/
│   ├── server/               # Express backend
│   │   ├── src/
│   │   │   └── index.ts     # Main server
│   │   └── tsconfig.json
│   ├── client/               # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx      # Main app
│   │   │   ├── components/  # React components
│   │   │   └── services/    # API client
│   │   └── vite.config.ts
│   └── prisma/               # Database
│       ├── schema.prisma    # Database schema
│       └── seed.ts          # Sample data
├── .env                      # Environment variables
├── package.json             # Root config
└── README.md                # Full documentation
```

## 🔑 Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Express.js** - Backend framework
- **Prisma ORM** - Database management
- **Socket.io** - Real-time updates
- **PostgreSQL** - Database

## 📖 Next Steps

1. ✅ Install dependencies: `yarn install`
2. ✅ Setup database: `yarn db:push && yarn db:seed`
3. ✅ Start development: `yarn dev`
4. ✅ Open http://localhost:5173 in browser
5. ✅ Explore the dashboard and features!

## 🆘 Need Help?

- Check the [main README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Check backend logs: `yarn dev` shows server output
- Check browser console: Open DevTools (F12)

---

**Happy coding! 🎉**
