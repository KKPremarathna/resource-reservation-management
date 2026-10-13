"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function cancelBooking(formData: FormData) {
  const currentUser = await requireUser();

  const bookingId = String(formData.get("bookingId") ?? "").trim();

  if (!bookingId) {
    throw new Error("Booking ID is required.");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      requesterId: true,
      status: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.requesterId !== currentUser.id) {
    throw new Error("You are not allowed to cancel this booking.");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be cancelled.");
  }

  await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath("/");
}