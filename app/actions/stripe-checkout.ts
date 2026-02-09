"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";
import { getStripeClient } from "@/lib/stripe";

function hasServiceCartDelegates() {
  const db = prisma as unknown as {
    serviceCart?: { findUnique?: unknown };
    serviceOrder?: { create?: unknown; update?: unknown };
    serviceOrderItem?: { createMany?: unknown };
  };
  return (
    typeof db.serviceCart?.findUnique === "function" &&
    typeof db.serviceOrder?.create === "function" &&
    typeof db.serviceOrderItem?.createMany === "function"
  );
}

async function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  if (host) return `${protocol}://${host}`;

  return "http://localhost:3000";
}

export async function createStripeCheckoutSessionAction() {
  const user = await requireUser();
  const siteSetting = await getSiteSetting();
  if (siteSetting && !siteSetting.acceptingOrders) {
    redirect("/cart?error=orders_closed");
  }

  if (!hasServiceCartDelegates()) {
    redirect("/cart?error=cart_unavailable");
  }

  const cart = await prisma.serviceCart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          servicePackage: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart?error=empty_cart");
  }

  const hasCustomQuote = cart.items.some(
    (item) =>
      item.servicePackage.isCustomQuote || item.servicePackage.priceCents === null
  );
  if (hasCustomQuote) {
    redirect("/cart?error=custom_quote_checkout");
  }

  const subtotalCents = cart.items.reduce(
    (sum, item) => sum + (item.servicePackage.priceCents ?? 0) * item.quantity,
    0
  );
  const requiresKickoffCall = cart.items.some(
    (item) => item.servicePackage.requiresKickoffCall
  );

  const serviceOrder = await prisma.serviceOrder.create({
    data: {
      userId: user.id,
      status: "PENDING",
      currency: "GBP",
      subtotalCents,
      totalCents: subtotalCents,
      requiresKickoffCall,
      items: {
        create: cart.items.map((item) => ({
          servicePackageId: item.servicePackageId,
          serviceName: item.servicePackage.name,
          quantity: item.quantity,
          unitPriceCents: item.servicePackage.priceCents ?? 0,
          totalPriceCents: (item.servicePackage.priceCents ?? 0) * item.quantity,
        })),
      },
      payment: {
        create: {
          status: "PENDING",
          amountCents: subtotalCents,
          currency: "GBP",
        },
      },
    },
  });

  const stripe = getStripeClient();
  const baseUrl = await getSiteUrl();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: serviceOrder.id,
    metadata: {
      serviceOrderId: serviceOrder.id,
      userId: user.id,
    },
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.servicePackage.name,
          description: item.servicePackage.summary ?? undefined,
        },
        unit_amount: item.servicePackage.priceCents ?? 0,
      },
    })),
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart?error=checkout_cancelled`,
  });

  await prisma.serviceOrder.update({
    where: { id: serviceOrder.id },
    data: {
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  if (!checkoutSession.url) {
    redirect("/cart?error=checkout_unavailable");
  }

  revalidatePath("/cart");
  redirect(checkoutSession.url);
}
