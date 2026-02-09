"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  DEFAULT_SERVICE_PACKAGES,
  findDefaultServicePackage,
} from "@/lib/default-service-packages";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";

function hasServiceCartDelegates() {
  const db = prisma as unknown as {
    serviceCart?: { upsert?: unknown };
    serviceCartItem?: { upsert?: unknown; findUnique?: unknown };
  };
  return (
    typeof db.serviceCart?.upsert === "function" &&
    typeof db.serviceCartItem?.upsert === "function" &&
    typeof db.serviceCartItem?.findUnique === "function"
  );
}

function isMissingCartTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("no such table: main.ServiceCart") ||
    message.includes("no such table: main.ServiceCartItem")
  );
}

async function ensureServicePackage(slug: string) {
  const existing = await prisma.servicePackage.findUnique({
    where: { slug },
  });
  if (existing) return existing;

  const fallback = findDefaultServicePackage(slug);
  if (!fallback) return null;

  return prisma.servicePackage.create({
    data: {
      ...fallback,
      priceCurrency: "GBP",
      status: "ACTIVE",
    },
  });
}

export async function addServiceToCartAction(formData: FormData) {
  const user = await requireUser();
  const siteSetting = await getSiteSetting();
  if (siteSetting && !siteSetting.acceptingOrders) {
    redirect("/cart?error=orders_closed");
  }

  if (!hasServiceCartDelegates()) {
    redirect("/cart?error=cart_unavailable");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const servicePackage = await ensureServicePackage(slug);
  if (!servicePackage) return;

  try {
    const cart = await prisma.serviceCart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    await prisma.serviceCartItem.upsert({
      where: {
        serviceCartId_servicePackageId: {
          serviceCartId: cart.id,
          servicePackageId: servicePackage.id,
        },
      },
      update: {
        quantity: {
          increment: 1,
        },
      },
      create: {
        serviceCartId: cart.id,
        servicePackageId: servicePackage.id,
        quantity: 1,
      },
    });
  } catch (error) {
    if (isMissingCartTableError(error)) {
      redirect("/cart?error=cart_unavailable");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateServiceCartItemQuantityAction(formData: FormData) {
  const user = await requireUser();
  if (!hasServiceCartDelegates()) return;

  const itemId = String(formData.get("itemId") ?? "");
  const nextQuantity = Number(formData.get("quantity") ?? "");
  if (!itemId || !Number.isFinite(nextQuantity)) return;

  try {
    const item = await prisma.serviceCartItem.findUnique({
      where: { id: itemId },
      include: { serviceCart: true },
    });
    if (!item || item.serviceCart.userId !== user.id) return;

    if (nextQuantity <= 0) {
      await prisma.serviceCartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.serviceCartItem.update({
        where: { id: itemId },
        data: { quantity: nextQuantity },
      });
    }
  } catch (error) {
    if (isMissingCartTableError(error)) return;
    throw error;
  }

  revalidatePath("/cart");
}

export async function removeServiceCartItemAction(formData: FormData) {
  const user = await requireUser();
  if (!hasServiceCartDelegates()) return;

  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  try {
    await prisma.serviceCartItem.deleteMany({
      where: {
        id: itemId,
        serviceCart: { userId: user.id },
      },
    });
  } catch (error) {
    if (isMissingCartTableError(error)) return;
    throw error;
  }

  revalidatePath("/cart");
}

export async function seedDefaultServicePackagesAction() {
  const user = await requireUser();
  if (user.role !== "ADMIN") return;

  await Promise.all(
    DEFAULT_SERVICE_PACKAGES.map((pkg) =>
      prisma.servicePackage.upsert({
        where: { slug: pkg.slug },
        update: {},
        create: {
          ...pkg,
          priceCurrency: "GBP",
          status: "ACTIVE",
        },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/services");
}
