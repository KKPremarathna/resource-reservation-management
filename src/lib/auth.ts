import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "reservify_session";

type SessionPayload = {
  userId: string;
};

function parseSessionValue(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(value) as SessionPayload;

    if (parsed && typeof parsed.userId === "string") {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  return parseSessionValue(raw);
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return null;
  }

  return user;
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