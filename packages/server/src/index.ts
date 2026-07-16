import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============ MIDDLEWARE ============

// Simple authentication check (replace with JWT in production)
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For now, just pass through. In production, validate JWT token
  next();
};

app.use(authMiddleware);

// ============ API ROUTES ============

// BEDS
app.get('/api/beds', async (req: Request, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        unit: true,
        admission: {
          include: {
            patient: true,
            discharge: true,
          },
        },
      },
    });
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
});

app.get('/api/beds/unit/:unitId', async (req: Request, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      where: { unitId: parseInt(req.params.unitId) },
      include: {
        unit: true,
        admission: {
          include: {
            patient: true,
          },
        },
      },
    });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
});

app.post('/api/beds', async (req: Request, res: Response) => {
  try {
    const { bedNumber, unitId } = req.body;
    const bed = await prisma.bed.create({
      data: {
        bedNumber,
        unitId,
        status: 'AVAILABLE',
      },
      include: { unit: true },
    });
    io.emit('bed:created', bed);
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bed' });
  }
});

app.patch('/api/beds/:bedId', async (req: Request, res: Response) => {
  try {
    const bed = await prisma.bed.update({
      where: { id: parseInt(req.params.bedId) },
      data: req.body,
      include: { unit: true },
    });
    io.emit('bed:updated', bed);
    res.json(bed);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bed' });
  }
});

// PATIENTS
app.get('/api/patients', async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        admissions: {
          include: {
            bed: { include: { unit: true } },
            discharge: true,
          },
        },
      },
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const patient = await prisma.patient.create({
      data: {
        mrn: `MRN-${Date.now()}`,
        ...req.body,
      },
    });
    io.emit('patient:created', patient);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create patient' });
  }
});

// ADMISSIONS
app.post('/api/admissions', async (req: Request, res: Response) => {
  try {
    const { patientId, bedId, clinicalLevel, diet, admissionDate } = req.body;

    const admission = await prisma.admission.create({
      data: {
        patientId,
        bedId,
        clinicalLevel: clinicalLevel || 'MED_SURG',
        diet,
        admissionDate: new Date(admissionDate),
      },
      include: {
        patient: true,
        bed: { include: { unit: true } },
      },
    });

    // Update bed status
    await prisma.bed.update({
      where: { id: bedId },
      data: { status: 'OCCUPIED' },
    });

    io.emit('admission:created', admission);
    res.status(201).json(admission);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create admission' });
  }
});

app.get('/api/admissions', async (req: Request, res: Response) => {
  try {
    const admissions = await prisma.admission.findMany({
      include: {
        patient: true,
        bed: { include: { unit: true } },
        discharge: true,
      },
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
});

// DISCHARGES
app.post('/api/discharges', async (req: Request, res: Response) => {
  try {
    const { admissionId, scheduledDate, dischargeType } = req.body;

    const discharge = await prisma.discharge.create({
      data: {
        admissionId,
        scheduledDate: new Date(scheduledDate),
        dischargeType: dischargeType || 'HOME',
        status: 'SCHEDULED',
      },
      include: { admission: { include: { patient: true, bed: true } } },
    });

    // Update bed status to pending discharge
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });
    if (admission) {
      await prisma.bed.update({
        where: { id: admission.bedId },
        data: { status: 'PENDING_DISCHARGE' },
      });
    }

    // Create housekeeping task
    if (admission) {
      await prisma.housekeepingTask.create({
        data: {
          bedId: admission.bedId,
          taskType: 'CLEANING',
          priority: 'NORMAL',
          status: 'PENDING',
          notes: `Prepare bed ${admission.bedId} for new admission`,
        },
      });
    }

    io.emit('discharge:scheduled', discharge);
    res.status(201).json(discharge);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to schedule discharge' });
  }
});

app.patch('/api/discharges/:dischargeId/confirm', async (req: Request, res: Response) => {
  try {
    const discharge = await prisma.discharge.findUnique({
      where: { id: parseInt(req.params.dischargeId) },
      include: { admission: true },
    });

    if (!discharge) {
      return res.status(404).json({ error: 'Discharge not found' });
    }

    const updated = await prisma.discharge.update({
      where: { id: parseInt(req.params.dischargeId) },
      data: {
        status: 'CONFIRMED',
        actualDate: new Date(),
      },
      include: { admission: { include: { patient: true, bed: true } } },
    });

    // Update bed status to cleaning
    await prisma.bed.update({
      where: { id: discharge.admission.bedId },
      data: { status: 'CLEANING' },
    });

    io.emit('discharge:confirmed', updated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to confirm discharge' });
  }
});

app.get('/api/discharges', async (req: Request, res: Response) => {
  try {
    const discharges = await prisma.discharge.findMany({
      include: {
        admission: { include: { patient: true, bed: true } },
      },
    });
    res.json(discharges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discharges' });
  }
});

// UNITS
app.get('/api/units', async (req: Request, res: Response) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        beds: {
          include: {
            admission: {
              include: { patient: true, discharge: true },
            },
          },
        },
      },
    });
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// HOUSEKEEPING
app.post('/api/housekeeping', async (req: Request, res: Response) => {
  try {
    const task = await prisma.housekeepingTask.create({
      data: req.body,
    });
    io.emit('housekeeping:created', task);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create housekeeping task' });
  }
});

app.patch('/api/housekeeping/:taskId', async (req: Request, res: Response) => {
  try {
    const task = await prisma.housekeepingTask.update({
      where: { id: parseInt(req.params.taskId) },
      data: req.body,
    });
    io.emit('housekeeping:updated', task);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update housekeeping task' });
  }
});

// HEALTH CHECK
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connected');

    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  NyxBeacon Hospital Bed Board System   ║
╠════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}  ║
║  API: http://localhost:${PORT}/api         ║
║  Health: http://localhost:${PORT}/health    ║
║  Frontend: http://localhost:5173        ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
