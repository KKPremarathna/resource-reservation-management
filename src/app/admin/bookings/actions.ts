"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type BookingDecision = "APPROVED" | "REJECTED";

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "") as BookingDecision;
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!bookingId) {
    throw new Error("Booking ID is required.");
  }

  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new Error("Invalid booking status.");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!booking) {
    throw new Error("Booking was not found.");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be reviewed.");
  }

  await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
      adminNote: adminNote || null,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/bookings");
  revalidatePath("/");
}