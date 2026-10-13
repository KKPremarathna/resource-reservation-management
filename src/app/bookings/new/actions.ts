"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createBookingRequest(formData: FormData) {
  const currentUser = await requireUser();

  const resourceId = getString(formData, "resourceId");
  const teamId = getString(formData, "teamId");
  const purpose = getString(formData, "purpose");
  const startTimeRaw = getString(formData, "startTime");
  const endTimeRaw = getString(formData, "endTime");

  if (!resourceId || !purpose || !startTimeRaw || !endTimeRaw) {
    throw new Error("All required fields must be filled.");
  }

  const startTime = new Date(startTimeRaw);
  const endTime = new Date(endTimeRaw);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error("Invalid start or end time.");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time.");
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new Error("Selected resource was not found.");
  }

  if (resource.status !== "AVAILABLE") {
    throw new Error("Only available resources can be requested.");
  }

  const overlappingApprovedBooking = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: "APPROVED",
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (overlappingApprovedBooking) {
    throw new Error("This resource is already booked for the selected time.");
  }

  if (teamId) {
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUser.id,
      },
    });

    const ownsTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        ownerId: currentUser.id,
      },
    });

    if (!membership && !ownsTeam && currentUser.role !== "ADMIN") {
      throw new Error("You can only request bookings for your own team.");
    }
  }

  await prisma.booking.create({
    data: {
      resourceId,
      requesterId: currentUser.id,
      teamId: teamId || null,
      purpose,
      startTime,
      endTime,
      status: "PENDING",
    },
  });

  revalidatePath("/");
  revalidatePath("/bookings/new");
  revalidatePath("/admin/bookings");

  redirect("/bookings/new?success=1");
}