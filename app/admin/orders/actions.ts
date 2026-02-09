"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function hasServiceOrderDelegates() {
  const db = prisma as unknown as {
    serviceOrder?: { update?: unknown };
  };
  return typeof db.serviceOrder?.update === "function";
}

export async function confirmKickoffCallAction(formData: FormData) {
  await requireAdmin();
  if (!hasServiceOrderDelegates()) return;

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      kickoffCallConfirmed: true,
      kickoffCallConfirmedAt: new Date(),
    },
  });

  revalidatePath("/admin/orders");
}

export async function markServiceOrderDeliveredAction(formData: FormData) {
  await requireAdmin();
  if (!hasServiceOrderDelegates()) return;

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const deliveredAt = new Date();
  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      deliveredAt,
      supportExpiresAt: addDays(deliveredAt, 30),
    },
  });

  revalidatePath("/admin/orders");
}

export async function cancelAndArchiveServiceOrderAction(formData: FormData) {
  await requireAdmin();
  if (!hasServiceOrderDelegates()) return;

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      isArchived: true,
      archivedAt: new Date(),
      deliveredAt: null,
      supportExpiresAt: null,
    },
  });

  revalidatePath("/admin/orders");
}

export async function toggleAcceptingOrdersAction(formData: FormData) {
  await requireAdmin();
  const nextValue = String(formData.get("acceptingOrders") ?? "") === "true";
  const current = await getSiteSetting();
  if (current) {
    await prisma.siteSetting.update({
      where: { id: current.id },
      data: { acceptingOrders: nextValue },
    });
  } else {
    await prisma.siteSetting.create({
      data: { acceptingOrders: nextValue },
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/");
  revalidatePath("/cart");
  redirect(`/admin/orders?orders=${nextValue ? "open" : "closed"}`);
}
