import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawDirectUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL;

function getDirectUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // Ensure connect_timeout is adequate for Neon compute wake-up (cold starts)
  if (!url.includes("connect_timeout=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}connect_timeout=30`;
  }
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDirectUrl(rawDirectUrl),
  },
});