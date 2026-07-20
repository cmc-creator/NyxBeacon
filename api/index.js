// Vercel Serverless Handler for NyxBeacon API
const { PrismaClient } = require('@prisma/client');

let prisma = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Health check - tests database connectivity
async function handleHealth(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Database connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// Get all beds
async function handleBeds(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const beds = await getPrisma().bed.findMany({
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
    res.status(200).json(beds);
  } catch (error) {
    console.error('Failed to fetch beds:', error);
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
}

// Get beds by unit
async function handleBedsByUnit(req, res) {
  const { unitId } = req.query;
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const beds = await getPrisma().bed.findMany({
      where: { unitId },
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
    res.status(200).json(beds);
  } catch (error) {
    console.error('Failed to fetch beds:', error);
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
}

// Get all units
async function handleUnits(req, res) {
  if (req.method === 'GET') {
    try {
      const units = await getPrisma().unit.findMany({
        include: { beds: true },
      });
      res.status(200).json(units);
    } catch (error) {
      console.error('Failed to fetch units:', error);
      res.status(500).json({ error: 'Failed to fetch units' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, floor, totalBeds } = req.body;
      const unit = await getPrisma().unit.create({
        data: {
          name,
          floor,
          totalBeds,
          beds: {
            create: Array.from({ length: totalBeds }).map((_, i) => ({
              roomNumber: `${floor}${String(i + 1).padStart(2, '0')}`,
              bedNumber: i + 1,
              status: 'AVAILABLE',
            })),
          },
        },
        include: { beds: true },
      });
      res.status(201).json(unit);
    } catch (error) {
      console.error('Failed to create unit:', error);
      res.status(400).json({ error: 'Failed to create unit' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Route handler dispatcher
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (pathname === '/api/health' || pathname === '/health') {
      await handleHealth(req, res);
    } else if (pathname === '/api/beds' || pathname === '/beds') {
      await handleBeds(req, res);
    } else if (pathname.startsWith('/api/beds/unit/') || pathname.startsWith('/beds/unit/')) {
      // Parse unitId from URL
      const parts = pathname.split('/');
      req.query.unitId = parts[parts.length - 1];
      await handleBedsByUnit(req, res);
    } else if (pathname === '/api/units' || pathname === '/units') {
      await handleUnits(req, res);
    } else if (pathname === '/api' || pathname === '/') {
      res.status(200).json({ 
        message: 'NyxBeacon Hospital Bed Board API',
        version: '1.0.0',
        endpoints: [
          '/api/health - Health check',
          '/api/beds - Get all beds',
          '/api/beds/unit/:unitId - Get beds by unit',
          '/api/units - Get all units'
        ]
      });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
