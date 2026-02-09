import { prisma } from "@/lib/prisma";

function hasSiteSettingDelegates() {
  const db = prisma as unknown as {
    siteSetting?: { findFirst?: unknown; create?: unknown; update?: unknown };
  };
  return (
    typeof db.siteSetting?.findFirst === "function" &&
    typeof db.siteSetting?.create === "function" &&
    typeof db.siteSetting?.update === "function"
  );
}

export async function getSiteSetting() {
  if (!hasSiteSettingDelegates()) return null;
  const existing = await prisma.siteSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.siteSetting.create({
    data: {
      acceptingOrders: true,
    },
  });
}
