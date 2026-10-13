"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function requireAdminUser() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    throw new Error("Only admins can manage resources.");
  }

  return currentUser;
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalCapacity(formData: FormData) {
  const raw = String(formData.get("capacity") ?? "").trim();

  if (!raw) {
    return null;
  }

  const capacity = Number(raw);

  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Capacity must be a positive whole number.");
  }

  return capacity;
}

function validateResourceType(type: string) {
  if (type !== "FACILITY" && type !== "RESOURCE") {
    throw new Error("Invalid resource type.");
  }

  return type;
}

function validateResourceStatus(status: string) {
  if (
    status !== "AVAILABLE" &&
    status !== "MAINTENANCE" &&
    status !== "INACTIVE"
  ) {
    throw new Error("Invalid resource status.");
  }

  return status;
}

export async function createResource(formData: FormData) {
  await requireAdminUser();

  const name = getString(formData, "name");
  const type = validateResourceType(getString(formData, "type"));
  const location = getString(formData, "location");
  const description = getString(formData, "description");
  const status = validateResourceStatus(getString(formData, "status"));
  const capacity = getOptionalCapacity(formData);

  if (!name || !location) {
    throw new Error("Name and location are required.");
  }

  await prisma.resource.create({
    data: {
      name,
      type,
      location,
      description: description || null,
      capacity,
      status,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/resources");
  revalidatePath("/bookings/new");
}

export async function updateResource(formData: FormData) {
  await requireAdminUser();

  const resourceId = getString(formData, "resourceId");
  const name = getString(formData, "name");
  const type = validateResourceType(getString(formData, "type"));
  const location = getString(formData, "location");
  const description = getString(formData, "description");
  const status = validateResourceStatus(getString(formData, "status"));
  const capacity = getOptionalCapacity(formData);

  if (!resourceId) {
    throw new Error("Resource ID is required.");
  }

  if (!name || !location) {
    throw new Error("Name and location are required.");
  }

  await prisma.resource.update({
    where: {
      id: resourceId,
    },
    data: {
      name,
      type,
      location,
      description: description || null,
      capacity,
      status,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/resources");
  revalidatePath("/bookings/new");
}