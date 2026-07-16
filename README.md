# NyxBeacon - Hospital Bed Board & Patient Management System

## Overview
NyxBeacon is a visually striking, production-grade hospital bed board platform for managing room occupancy, patient admissions, discharges, and real-time care coordination. It replaces traditional whiteboards with an intelligent, color-coded digital dashboard.

## Key Features
- **Real-time Bed Board Dashboard** - Color-coded room status with live updates
- **Smart Admissions** - Match patients to available rooms by unit, gender, care level
- **Discharge Management** - Schedule formal discharge dates/times with automated alerts
- **Room Availability** - Track occupancy, pending discharges, maintenance status
- **Care Coordination** - Patient details: clinical level, diets, transfer statuses
- **Housekeeping Alerts** - Automated notifications for room cleaning/maintenance
- **Census Explorer** - Advanced filtering, sorting, and data export
- **Patient Tracking** - Full admission/discharge workflow with audit logs
- **Mobile Responsive** - Optimized for tablets, desktops, and kiosks

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI, Socket.io
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Deployment**: Docker, Azure App Service

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Yarn or npm

### Installation
```bash
# Clone repository
git clone <repo-url>
cd nyxbeacon-bedboard

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
yarn db:push
yarn db:seed

# Start development servers
yarn dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555

## Project Structure
```
nyxbeacon-bedboard/
├── packages/
│   ├── server/                 # Express backend
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── services/      # Business logic
│   │   │   └── index.ts       # Server entry
│   │   └── package.json
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API clients
│   │   │   └── App.tsx        # App entry
│   │   └── package.json
│   └── prisma/                 # Database
│       ├── schema.prisma      # Database schema
│       ├── migrations/        # Schema migrations
│       └── seed.ts            # Sample data
└── package.json               # Monorepo config
```

## Core Database Models
- **Units** - Hospital units/floors
- **Rooms** - Physical beds with unit assignments
- **Patients** - Patient demographics and details
- **Admissions** - Patient-room assignments
- **Discharges** - Discharge scheduling and tracking
- **HousekeepingTasks** - Cleaning/maintenance requests
- **AuditLogs** - Operational audit trail

## API Endpoints

### Bed Board
- `GET /api/beds` - List all beds with current status
- `GET /api/beds/unit/:unitId` - Beds by unit
- `POST /api/beds` - Create new bed
- `PATCH /api/beds/:bedId` - Update bed status

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Admit new patient
- `GET /api/patients/:patientId` - Get patient details
- `PATCH /api/patients/:patientId` - Update patient

### Admissions
- `POST /api/admissions` - Create admission
- `GET /api/admissions` - List admissions
- `PATCH /api/admissions/:admissionId` - Update admission

### Discharges
- `POST /api/discharges` - Schedule discharge
- `GET /api/discharges` - List discharges
- `PATCH /api/discharges/:dischargeId` - Update discharge
- `POST /api/discharges/:dischargeId/confirm` - Confirm discharge

### Housekeeping
- `POST /api/housekeeping` - Create task
- `GET /api/housekeeping` - List tasks
- `PATCH /api/housekeeping/:taskId` - Update task status

## Features in Detail

### Bed Board Dashboard
Real-time visualization of all rooms with:
- **Color indicators**: Available (green), Occupied (blue), Pending Discharge (yellow), Maintenance (red)
- **Room info**: Bed number, patient name, admission date
- **Quick actions**: Discharge, transfer, maintenance
- **Filters**: By unit, status, gender, care level

### Smart Admissions Workflow
1. Select available room based on criteria
2. Enter patient demographics
3. Set clinical care level (ICU, Med/Surg, Skilled Nursing)
4. Assign diet and special accommodations
5. Confirm admission - room marked occupied

### Discharge Scheduling
1. Select patient for discharge
2. Set discharge date and time
3. Trigger housekeeping alert
4. System marks room as "Pending Discharge"
5. On discharge time: confirm discharge, mark room available
6. Housekeeping receives cleaning notification

### Census Explorer
Advanced reporting with:
- Filter by unit, status, gender, care level, payer, custom tags
- Sort by admission date, discharge date, length of stay
- Export to CSV/Excel
- Trend analysis and capacity planning
- Real-time occupancy percentages

## Development

### Add New Room
```bash
curl -X POST http://localhost:3000/api/beds \
  -H "Content-Type: application/json" \
  -d '{
    "bedNumber": "A101",
    "unitId": 1,
    "status": "AVAILABLE"
  }'
```

### Admit Patient
```bash
curl -X POST http://localhost:3000/api/admissions \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "bedId": 1,
    "clinicalLevel": "MED_SURG",
    "diet": "Regular",
    "admissionDate": "2024-01-15T10:00:00Z"
  }'
```

### Schedule Discharge
```bash
curl -X POST http://localhost:3000/api/discharges \
  -H "Content-Type: application/json" \
  -d '{
    "admissionId": 1,
    "scheduledDate": "2024-01-20T11:00:00Z",
    "dischargeType": "HOME"
  }'
```

## Deployment

### Docker Build
```bash
docker build -t nyxbeacon:latest .
docker run -p 3000:3000 --env-file .env nyxbeacon:latest
```

### Azure Deployment
```bash
# Setup Azure resources
az login
az group create --name nyxbeacon-rg --location eastus

# Deploy with Bicep or Azure CLI
az deployment group create --resource-group nyxbeacon-rg \
  --template-file deploy/main.bicep

# Setup database
yarn db:push

# Deploy application
az appservice plan create --name nyxbeacon-plan \
  --resource-group nyxbeacon-rg --sku B2 --is-linux
```

## Performance & Scalability
- Socket.io for real-time updates across all connected clients
- Prisma caching for frequently accessed data
- PostgreSQL connection pooling
- Frontend optimizations: React Query for data fetching, virtual scrolling for large lists

## Security
- JWT authentication
- Role-based access control (Admin, Nurse, Housekeeping, Discharge Coordinator)
- HIPAA-compliant audit logging
- Data encryption at rest and in transit
- Input validation and sanitization

## Support & Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL service
pg_isready -h localhost -p 5432

# Reset database
yarn db:push --force-reset
```

### Port Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Roadmap
- [ ] Multi-hospital support
- [ ] Advanced analytics and predictive admission modeling
- [ ] Mobile app (React Native)
- [ ] Integration with EHR systems
- [ ] AI-powered room recommendations
- [ ] Compliance reporting (CMS, accreditation)
- [ ] Advanced scheduling algorithms

## Contributing
1. Create feature branch: `git checkout -b feature/bed-routing`
2. Commit changes: `git commit -am 'Add bed routing'`
3. Push to branch: `git push origin feature/bed-routing`
4. Create Pull Request

## License
Proprietary - NyxBeacon Hospital Systems

## Contact
For support or inquiries, contact the development team.
