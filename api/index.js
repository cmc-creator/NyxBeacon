const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// BEDS
app.get('/api/beds', async (req, res) => {
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

app.get('/api/beds/unit/:unitId', async (req, res) => {
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

app.post('/api/beds', async (req, res) => {
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
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bed' });
  }
});

// UNITS
app.get('/api/units', async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        beds: true,
      },
    });
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

app.post('/api/units', async (req, res) => {
  try {
    const { name, floor, capacity } = req.body;
    const unit = await prisma.unit.create({
      data: { name, floor, capacity },
    });
    res.status(201).json(unit);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create unit' });
  }
});

// PATIENTS
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { admissions: true },
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { mrn, firstName, lastName, dateOfBirth, gender } = req.body;
    const patient = await prisma.patient.create({
      data: {
        mrn,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
      },
    });
    res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create patient' });
  }
});

// ADMISSIONS
app.get('/api/admissions', async (req, res) => {
  try {
    const admissions = await prisma.admission.findMany({
      include: {
        patient: true,
        bed: {
          include: { unit: true },
        },
        discharge: true,
      },
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
});

app.post('/api/admissions', async (req, res) => {
  try {
    const { patientId, bedId, clinicalLevel, admissionDate } = req.body;
    const admission = await prisma.admission.create({
      data: {
        patientId,
        bedId,
        clinicalLevel,
        admissionDate: new Date(admissionDate),
      },
      include: {
        patient: true,
        bed: {
          include: { unit: true },
        },
      },
    });

    // Update bed status
    await prisma.bed.update({
      where: { id: bedId },
      data: { status: 'OCCUPIED' },
    });

    res.status(201).json(admission);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create admission' });
  }
});

// DISCHARGES
app.get('/api/discharges', async (req, res) => {
  try {
    const discharges = await prisma.discharge.findMany({
      include: {
        admission: {
          include: {
            patient: true,
            bed: {
              include: { unit: true },
            },
          },
        },
      },
    });
    res.json(discharges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discharges' });
  }
});

app.post('/api/discharges', async (req, res) => {
  try {
    const { admissionId, scheduledDate, dischargeType } = req.body;
    const discharge = await prisma.discharge.create({
      data: {
        admissionId,
        scheduledDate: new Date(scheduledDate),
        dischargeType,
        status: 'SCHEDULED',
      },
      include: {
        admission: {
          include: { patient: true },
        },
      },
    });

    // Update bed status
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });
    if (admission) {
      await prisma.bed.update({
        where: { id: admission.bedId },
        data: { status: 'PENDING_DISCHARGE' },
      });
    }

    res.status(201).json(discharge);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create discharge' });
  }
});

app.patch('/api/discharges/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const discharge = await prisma.discharge.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CONFIRMED',
        actualDate: new Date(),
      },
      include: {
        admission: {
          include: { patient: true },
        },
      },
    });

    // Update bed status back to AVAILABLE
    const admission = await prisma.admission.findUnique({
      where: { id: discharge.admissionId },
    });
    if (admission) {
      await prisma.bed.update({
        where: { id: admission.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.json(discharge);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to confirm discharge' });
  }
});

module.exports = app;
