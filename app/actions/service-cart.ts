"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  DEFAULT_SERVICE_PACKAGES,
  findDefaultServicePackage,
} from "@/lib/default-service-packages";
import { prisma } from "@/lib/prisma";

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
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const servicePackage = await ensureServicePackage(slug);
  if (!servicePackage) return;

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

  revalidatePath("/");
  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateServiceCartItemQuantityAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId") ?? "");
  const nextQuantity = Number(formData.get("quantity") ?? "");
  if (!itemId || !Number.isFinite(nextQuantity)) return;

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

  revalidatePath("/cart");
}

export async function removeServiceCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  await prisma.serviceCartItem.deleteMany({
    where: {
      id: itemId,
      serviceCart: { userId: user.id },
    },
  });

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
