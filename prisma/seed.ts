import { PrismaPg } from "@prisma/adapter-pg";
import {
  BookingStatus,
  PrismaClient,
  ResourceStatus,
  ResourceType,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@reservify.local" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@reservify.local",
      role: UserRole.ADMIN,
    },
  });

  const kavindu = await prisma.user.upsert({
    where: { email: "kavindu@reservify.local" },
    update: {},
    create: {
      name: "Kavindu Kavishka",
      email: "kavindu@reservify.local",
      role: UserRole.INDIVIDUAL,
    },
  });

  const nimal = await prisma.user.upsert({
    where: { email: "nimal@reservify.local" },
    update: {},
    create: {
      name: "Nimal Perera",
      email: "nimal@reservify.local",
      role: UserRole.INDIVIDUAL,
    },
  });

  const team = await prisma.team.upsert({
    where: { id: "engineering-team" },
    update: {},
    create: {
      id: "engineering-team",
      name: "Engineering Team",
      ownerId: kavindu.id,
    },
  });

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: kavindu.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: kavindu.id,
    },
  });

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: nimal.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: nimal.id,
    },
  });

  const conferenceRoom = await prisma.resource.upsert({
    where: { id: "conference-room-a" },
    update: {},
    create: {
      id: "conference-room-a",
      name: "Conference Room A",
      description: "Large meeting room with a video-conferencing display.",
      type: ResourceType.FACILITY,
      location: "Level 2",
      capacity: 12,
      status: ResourceStatus.AVAILABLE,
    },
  });

  const trainingLab = await prisma.resource.upsert({
    where: { id: "training-lab" },
    update: {},
    create: {
      id: "training-lab",
      name: "Training Lab",
      description: "Computer lab for workshops and technical training.",
      type: ResourceType.FACILITY,
      location: "Level 1",
      capacity: 25,
      status: ResourceStatus.AVAILABLE,
    },
  });

  const projector = await prisma.resource.upsert({
    where: { id: "projector-01" },
    update: {},
    create: {
      id: "projector-01",
      name: "Projector 01",
      description: "Portable HD projector with HDMI connection.",
      type: ResourceType.RESOURCE,
      location: "Equipment Store",
      status: ResourceStatus.AVAILABLE,
    },
  });

  const now = new Date();
  const startTime = new Date(now);
  startTime.setHours(14, 0, 0, 0);

  const endTime = new Date(now);
  endTime.setHours(15, 30, 0, 0);

  await prisma.booking.upsert({
    where: { id: "demo-approved-booking" },
    update: {},
    create: {
      id: "demo-approved-booking",
      resourceId: conferenceRoom.id,
      requesterId: kavindu.id,
      teamId: team.id,
      startTime,
      endTime,
      purpose: "Weekly engineering planning meeting",
      status: BookingStatus.APPROVED,
      adminNote: "Approved for the engineering team.",
    },
  });

  await prisma.notification.upsert({
    where: { id: "demo-notification" },
    update: {},
    create: {
      id: "demo-notification",
      userId: kavindu.id,
      message: "Your booking for Conference Room A has been approved.",
    },
  });

  console.log("Seeded users:", admin.name, kavindu.name, nimal.name);
  console.log(
    "Seeded resources:",
    conferenceRoom.name,
    trainingLab.name,
    projector.name,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });