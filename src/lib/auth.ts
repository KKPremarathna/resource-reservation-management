import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "reservify_session";

type SessionPayload = {
  userId: string;
};

function parseSessionValue(value: string): SessionPayload | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  let raw = value.trim();

  if (raw.includes("%")) {
    try {
      raw = decodeURIComponent(raw);
    } catch {
      // Keep raw if decodeURIComponent fails
    }
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.userId === "string" && parsed.userId.trim()) {
      return { userId: parsed.userId.trim() };
    }
  } catch {
    // Not JSON
  }

  // Fallback: check if raw is a plain alphanumeric/cuid userId string
  if (raw && !raw.startsWith("{") && !raw.includes(" ") && !raw.includes(";")) {
    return { userId: raw };
  }

  return null;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!raw) {
      return null;
    }

    return parseSessionValue(raw);
  } catch (error) {
    console.error("Error reading session cookie:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching current user from database:", error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}