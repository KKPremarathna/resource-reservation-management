import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ResourceStatus,
  ResourceType,
  UserRole,
  BookingStatus,
} from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("User123!", 10);

  const systemAdmin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@reservify.local",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  const kavindu = await prisma.user.create({
    data: {
      name: "Kavindu",
      email: "kavindu@reservify.local",
      passwordHash: userPasswordHash,
      role: UserRole.INDIVIDUAL,
    },
  });

  const kavishka = await prisma.user.create({
    data: {
      name: "Kavishka",
      email: "kavishka@reservify.local",
      passwordHash: userPasswordHash,
      role: UserRole.INDIVIDUAL,
    },
  });

  const nimalPerera = await prisma.user.create({
    data: {
      name: "Nimal Perera",
      email: "nimal@reservify.local",
      passwordHash: userPasswordHash,
      role: UserRole.INDIVIDUAL,
    },
  });

  const engineeringTeam = await prisma.team.create({
    data: {
      name: "Engineering Team",
      ownerId: systemAdmin.id,
    },
  });

  await prisma.teamMember.createMany({
    data: [
      {
        teamId: engineeringTeam.id,
        userId: kavindu.id,
      },
      {
        teamId: engineeringTeam.id,
        userId: kavishka.id,
      },
      {
        teamId: engineeringTeam.id,
        userId: nimalPerera.id,
      },
    ],
  });

  const conferenceRoom = await prisma.resource.create({
    data: {
      name: "Conference Room A",
      description: "Main conference room for internal meetings and client discussions.",
      type: ResourceType.FACILITY,
      status: ResourceStatus.AVAILABLE,
      location: "First Floor",
      capacity: 12,
    },
  });

  const trainingLab = await prisma.resource.create({
    data: {
      name: "Training Lab",
      description: "Dedicated lab space for internal workshops and training sessions.",
      type: ResourceType.FACILITY,
      status: ResourceStatus.AVAILABLE,
      location: "Second Floor",
      capacity: 24,
    },
  });

  const projector = await prisma.resource.create({
    data: {
      name: "Projector 01",
      description: "Portable projector for presentations and training events.",
      type: ResourceType.RESOURCE,
      status: ResourceStatus.AVAILABLE,
      location: "Equipment Room",
      capacity: null,
    },
  });

  await prisma.booking.create({
    data: {
      resourceId: conferenceRoom.id,
      requesterId: kavindu.id,
      teamId: engineeringTeam.id,
      purpose: "Sprint planning session",
      startTime: new Date("2026-10-15T09:00:00.000Z"),
      endTime: new Date("2026-10-15T10:30:00.000Z"),
      status: BookingStatus.APPROVED,
      adminNote: "Approved for the engineering planning meeting.",
    },
  });

  await prisma.booking.create({
    data: {
      resourceId: trainingLab.id,
      requesterId: kavishka.id,
      teamId: engineeringTeam.id,
      purpose: "Frontend training workshop",
      startTime: new Date("2026-10-16T13:00:00.000Z"),
      endTime: new Date("2026-10-16T15:00:00.000Z"),
      status: BookingStatus.PENDING,
    },
  });

  await prisma.notification.create({
    data: {
      userId: kavishka.id,
      message: "Your booking request for Training Lab is pending admin approval.",
    },
  });

  console.log("Seeded users:", systemAdmin.name, kavindu.name, kavishka.name, nimalPerera.name);
  console.log("Seeded resources:", conferenceRoom.name, trainingLab.name, projector.name);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });