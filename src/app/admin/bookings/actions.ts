"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateBookingPages() {
  revalidatePath("/");
  revalidatePath("/bookings/new");
  revalidatePath("/admin/bookings");
}

export async function approveBooking(formData: FormData) {
  await requireAdmin();

  const bookingId = getString(formData, "bookingId");
  const adminNote = getString(formData, "adminNote");

  if (!bookingId) {
    throw new Error("Booking id is required.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be approved.");
  }

  const overlappingApprovedBooking = await prisma.booking.findFirst({
    where: {
      resourceId: booking.resourceId,
      status: "APPROVED",
      id: {
        not: booking.id,
      },
      startTime: {
        lt: booking.endTime,
      },
      endTime: {
        gt: booking.startTime,
      },
    },
  });

  if (overlappingApprovedBooking) {
    throw new Error("This booking overlaps with an already approved booking.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "APPROVED",
      adminNote: adminNote || "Approved by admin.",
    },
  });

  revalidateBookingPages();
}

export async function rejectBooking(formData: FormData) {
  await requireAdmin();

  const bookingId = getString(formData, "bookingId");
  const adminNote = getString(formData, "adminNote");

  if (!bookingId) {
    throw new Error("Booking id is required.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be rejected.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "REJECTED",
      adminNote: adminNote || "Rejected by admin.",
    },
  });

  revalidateBookingPages();
}