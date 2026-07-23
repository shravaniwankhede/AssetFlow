import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const adapter = new PrismaBetterSqlite3({
  url: 'file:dev.db'
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean old data in reverse dependency order
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditItem.deleteMany({});
  await prisma.auditCycle.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.resourceBooking.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.assetCategory.deleteMany({});
  
  // Set department heads to null before deleting users to prevent circular constraint blocks
  await prisma.department.updateMany({ data: { headId: null } });
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log("Database cleaned successfully.");

  // 2. Create Departments
  const deptEng = await prisma.department.create({
    data: { name: "Engineering", code: "ENG", status: "ACTIVE" }
  });
  const deptHr = await prisma.department.create({
    data: { name: "Human Resources", code: "HR", status: "ACTIVE" }
  });
  const deptOps = await prisma.department.create({
    data: { name: "Operations", code: "OPS", status: "ACTIVE" }
  });

  console.log("Departments created.");

  // 3. Create Users
  const passwordHash = hashPassword("password123");

  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@assetflow.com",
      passwordHash: hashPassword("admin123"),
      name: "System Admin",
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  const userManager = await prisma.user.create({
    data: {
      email: "manager@assetflow.com",
      passwordHash,
      name: "John Doe (Asset Manager)",
      role: "ASSET_MANAGER",
      status: "ACTIVE"
    }
  });

  const userHeadEng = await prisma.user.create({
    data: {
      email: "head.eng@assetflow.com",
      passwordHash,
      name: "Alice Smith (Eng Head)",
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      departmentId: deptEng.id
    }
  });

  const userHeadHr = await prisma.user.create({
    data: {
      email: "head.hr@assetflow.com",
      passwordHash,
      name: "Bob Jones (HR Head)",
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      departmentId: deptHr.id
    }
  });

  const userEmpEng1 = await prisma.user.create({
    data: {
      email: "emp.eng1@assetflow.com",
      passwordHash,
      name: "Raj Patel",
      role: "EMPLOYEE",
      status: "ACTIVE",
      departmentId: deptEng.id
    }
  });

  const userEmpEng2 = await prisma.user.create({
    data: {
      email: "emp.eng2@assetflow.com",
      passwordHash,
      name: "Priya Sharma",
      role: "EMPLOYEE",
      status: "ACTIVE",
      departmentId: deptEng.id
    }
  });

  console.log("Users created.");

  // 4. Update Department Head relationship
  await prisma.department.update({
    where: { id: deptEng.id },
    data: { headId: userHeadEng.id }
  });
  await prisma.department.update({
    where: { id: deptHr.id },
    data: { headId: userHeadHr.id }
  });

  console.log("Department heads assigned.");

  // 5. Create Asset Categories
  const catElectronics = await prisma.assetCategory.create({
    data: {
      name: "Electronics",
      description: "Laptops, phones, servers, screens, keyboards",
      fields: { warrantyDefaultYears: 3, voltage: "110-220V" }
    }
  });

  const catFurniture = await prisma.assetCategory.create({
    data: {
      name: "Furniture",
      description: "Desks, chairs, cabinets, tables",
      fields: { material: "Wood/Steel/Plastic" }
    }
  });

  const catVehicles = await prisma.assetCategory.create({
    data: {
      name: "Vehicles",
      description: "Company cars, delivery vans, shuttles",
      fields: { fuelType: "Electric/Gasoline", seatingCapacity: 5 }
    }
  });

  console.log("Asset Categories created.");

  // 6. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      tag: "AF-0001",
      name: "Dell XPS 15 Laptop",
      serialNo: "DELLXPS15-001",
      acquisitionDate: new Date("2025-01-10"),
      acquisitionCost: 1500.00,
      condition: "EXCELLENT",
      location: "Mumbai HQ - 4th Floor",
      isShared: false,
      status: "ALLOCATED",
      categoryId: catElectronics.id,
      departmentId: deptEng.id,
      userId: userEmpEng2.id
    }
  });

  const asset2 = await prisma.asset.create({
    data: {
      tag: "AF-0002",
      name: "MacBook Pro 16",
      serialNo: "MACBOOK16-002",
      acquisitionDate: new Date("2025-02-15"),
      acquisitionCost: 2500.00,
      condition: "EXCELLENT",
      location: "Mumbai HQ - 4th Floor",
      isShared: false,
      status: "AVAILABLE",
      categoryId: catElectronics.id
    }
  });

  const asset3 = await prisma.asset.create({
    data: {
      tag: "AF-0003",
      name: "Ergonomic Office Chair",
      serialNo: "CHAIR-003",
      acquisitionDate: new Date("2024-06-01"),
      acquisitionCost: 350.00,
      condition: "GOOD",
      location: "Pune Office - Cabin B",
      isShared: false,
      status: "ALLOCATED",
      categoryId: catFurniture.id,
      departmentId: deptEng.id,
      userId: userEmpEng1.id
    }
  });

  const asset4 = await prisma.asset.create({
    data: {
      tag: "AF-0004",
      name: "Conference Room Display",
      serialNo: "DISPLAY-004",
      acquisitionDate: new Date("2024-11-20"),
      acquisitionCost: 800.00,
      condition: "EXCELLENT",
      location: "Mumbai HQ - Room Alpha",
      isShared: true,
      status: "AVAILABLE",
      categoryId: catElectronics.id
    }
  });

  const asset5 = await prisma.asset.create({
    data: {
      tag: "AF-0005",
      name: "Tesla Model Y - Delivery Van",
      serialNo: "TESLAVAN-005",
      acquisitionDate: new Date("2025-03-01"),
      acquisitionCost: 45000.00,
      condition: "EXCELLENT",
      location: "Warehouse 1 Parking",
      isShared: true,
      status: "AVAILABLE",
      categoryId: catVehicles.id
    }
  });

  console.log("Assets created.");

  // 7. Create Resource Bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 2);

  const booking = await prisma.resourceBooking.create({
    data: {
      assetId: asset5.id,
      userId: userEmpEng1.id,
      departmentId: deptEng.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: "UPCOMING"
    }
  });

  console.log("Resource bookings created.");

  // 8. Create Maintenance Request
  const maintenance = await prisma.maintenanceRequest.create({
    data: {
      assetId: asset3.id,
      reporterId: userEmpEng1.id,
      description: "Squeaky base cylinder, makes loud noise when leaning back",
      priority: "MEDIUM",
      status: "PENDING"
    }
  });

  console.log("Maintenance requests created.");

  // 9. Create Audit Cycle
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const auditCycle = await prisma.auditCycle.create({
    data: {
      name: "Q3 Assets Verification",
      startDate: new Date(),
      endDate: nextWeek,
      status: "ACTIVE",
      auditors: {
        connect: [{ id: userEmpEng2.id }]
      }
    }
  });

  const auditItem = await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: asset1.id,
      auditorId: userEmpEng2.id,
      status: "PENDING"
    }
  });

  console.log("Audit cycles and items created.");

  console.log("Seeding completed successfully! 🎉");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Error seeding database: ", e);
  await prisma.$disconnect();
  process.exit(1);
});
