"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type CreateBookingState = {
  error: string | null;
};

export async function createBooking(
  _prevState: CreateBookingState,
  formData: FormData,
): Promise<CreateBookingState> {
  const currentUser = await requireUser();

  const resourceId = String(formData.get("resourceId") ?? "").trim();
  const teamIdRaw = String(formData.get("teamId") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const startTimeRaw = String(formData.get("startTime") ?? "").trim();
  const endTimeRaw = String(formData.get("endTime") ?? "").trim();

  if (!resourceId || !purpose || !startTimeRaw || !endTimeRaw) {
    return { error: "Please fill in all required fields." };
  }

  const startTime = new Date(startTimeRaw);
  const endTime = new Date(endTimeRaw);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: "Please provide valid booking dates and times." };
  }

  if (endTime <= startTime) {
    return { error: "End time must be later than start time." };
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, status: true },
  });

  if (!resource) {
    return { error: "Selected resource was not found." };
  }

  if (resource.status !== "AVAILABLE") {
    return { error: "This resource is not currently available for booking." };
  }

  if (teamIdRaw) {
    const team = await prisma.team.findUnique({
      where: { id: teamIdRaw },
      select: { id: true },
    });

    if (!team) {
      return { error: "Selected team was not found." };
    }
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (conflictingBooking) {
    return {
      error:
        "This resource already has a pending or approved booking for an overlapping time range.",
    };
  }

  await prisma.booking.create({
    data: {
      resourceId,
      requesterId: currentUser.id,
      teamId: teamIdRaw || null,
      purpose,
      startTime,
      endTime,
      status: "PENDING",
    },
  });

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath("/admin/bookings");
  redirect("/bookings");
}