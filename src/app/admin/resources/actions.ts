"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createResource(formData: FormData) {
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const type = getString(formData, "type");
  const location = getString(formData, "location");
  const status = getString(formData, "status");
  const capacityValue = getString(formData, "capacity");

  if (!name || !type || !location || !status) {
    throw new Error("Name, type, location, and status are required.");
  }

  const capacity =
    capacityValue.length > 0 ? Number.parseInt(capacityValue, 10) : null;

  if (capacityValue.length > 0 && Number.isNaN(capacity)) {
    throw new Error("Capacity must be a valid number.");
  }

  await prisma.resource.create({
    data: {
      name,
      description: description || null,
      type: type === "FACILITY" ? "FACILITY" : "RESOURCE",
      location,
      status:
        status === "MAINTENANCE"
          ? "MAINTENANCE"
          : status === "INACTIVE"
            ? "INACTIVE"
            : "AVAILABLE",
      capacity,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/resources");
}

export async function deleteResource(formData: FormData) {
  const resourceId = getString(formData, "resourceId");

  if (!resourceId) {
    throw new Error("Resource id is required.");
  }

  const futureApprovedBookings = await prisma.booking.count({
    where: {
      resourceId,
      status: "APPROVED",
      endTime: {
        gte: new Date(),
      },
    },
  });

  if (futureApprovedBookings > 0) {
    throw new Error(
      "Cannot delete a resource with current or future approved bookings.",
    );
  }

  await prisma.resource.delete({
    where: {
      id: resourceId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/resources");
}