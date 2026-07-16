import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');

    // Create units
    const unit1 = await prisma.unit.upsert({
      where: { name: 'ICU - 3rd Floor' },
      update: {},
      create: {
        name: 'ICU - 3rd Floor',
        floor: 3,
        capacity: 12,
      },
    });

    const unit2 = await prisma.unit.upsert({
      where: { name: 'Medical/Surgical - 4th Floor' },
      update: {},
      create: {
        name: 'Medical/Surgical - 4th Floor',
        floor: 4,
        capacity: 24,
      },
    });

    const unit3 = await prisma.unit.upsert({
      where: { name: 'Skilled Nursing - 5th Floor' },
      update: {},
      create: {
        name: 'Skilled Nursing - 5th Floor',
        floor: 5,
        capacity: 20,
      },
    });

    // Create beds for ICU
    for (let i = 1; i <= 12; i++) {
      await prisma.bed.upsert({
        where: { bedNumber_unitId: { bedNumber: `ICU-${i}`, unitId: unit1.id } },
        update: {},
        create: {
          bedNumber: `ICU-${i}`,
          unitId: unit1.id,
          status: i <= 8 ? 'AVAILABLE' : 'OCCUPIED',
        },
      });
    }

    // Create beds for Med/Surg
    for (let i = 1; i <= 24; i++) {
      await prisma.bed.upsert({
        where: { bedNumber_unitId: { bedNumber: `MS-${i}`, unitId: unit2.id } },
        update: {},
        create: {
          bedNumber: `MS-${i}`,
          unitId: unit2.id,
          status: i <= 16 ? 'AVAILABLE' : 'OCCUPIED',
        },
      });
    }

    // Create beds for Skilled Nursing
    for (let i = 1; i <= 20; i++) {
      await prisma.bed.upsert({
        where: { bedNumber_unitId: { bedNumber: `SN-${i}`, unitId: unit3.id } },
        update: {},
        create: {
          bedNumber: `SN-${i}`,
          unitId: unit3.id,
          status: i <= 14 ? 'AVAILABLE' : 'OCCUPIED',
        },
      });
    }

    // Create sample patients
    const patient1 = await prisma.patient.upsert({
      where: { mrn: 'MRN-001' },
      update: {},
      create: {
        mrn: 'MRN-001',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: new Date('1955-05-15'),
        gender: 'M',
        phone: '555-0101',
        email: 'john.smith@email.com',
      },
    });

    const patient2 = await prisma.patient.upsert({
      where: { mrn: 'MRN-002' },
      update: {},
      create: {
        mrn: 'MRN-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: new Date('1968-03-22'),
        gender: 'F',
        phone: '555-0102',
        email: 'sarah.johnson@email.com',
      },
    });

    const patient3 = await prisma.patient.upsert({
      where: { mrn: 'MRN-003' },
      update: {},
      create: {
        mrn: 'MRN-003',
        firstName: 'Michael',
        lastName: 'Williams',
        dateOfBirth: new Date('1942-07-10'),
        gender: 'M',
        phone: '555-0103',
        email: 'michael.williams@email.com',
      },
    });

    // Create sample admissions
    const admission1 = await prisma.admission.create({
      data: {
        patientId: patient1.id,
        bedId: 9, // First occupied bed in ICU
        clinicalLevel: 'ICU',
        diet: 'Regular',
        allergies: 'Penicillin',
        admissionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      },
    });

    const admission2 = await prisma.admission.create({
      data: {
        patientId: patient2.id,
        bedId: 25, // First occupied bed in Med/Surg
        clinicalLevel: 'MED_SURG',
        diet: 'Low-sodium',
        admissionDate: new Date(new Date().setDate(new Date().getDate() - 3)),
      },
    });

    const admission3 = await prisma.admission.create({
      data: {
        patientId: patient3.id,
        bedId: 35, // First occupied bed in Skilled Nursing
        clinicalLevel: 'SKILLED_NURSING',
        diet: 'Diabetic',
        admissionDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      },
    });

    // Create sample discharges
    await prisma.discharge.create({
      data: {
        admissionId: admission3.id,
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        dischargeType: 'HOME',
        status: 'SCHEDULED',
      },
    });

    console.log('✓ Database seeded successfully!');
    console.log('  - Created 3 units with 56 beds');
    console.log('  - Created 3 sample patients');
    console.log('  - Created 3 sample admissions');
    console.log('  - Created 1 sample discharge');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
