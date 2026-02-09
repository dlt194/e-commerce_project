import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

function hasServiceOrderDelegates() {
  const db = prisma as unknown as {
    serviceOrder?: { update?: unknown; findUnique?: unknown };
    servicePayment?: { upsert?: unknown };
    serviceCart?: { findUnique?: unknown };
    serviceCartItem?: { deleteMany?: unknown };
  };
  return (
    typeof db.serviceOrder?.update === "function" &&
    typeof db.serviceOrder?.findUnique === "function" &&
    typeof db.servicePayment?.upsert === "function" &&
    typeof db.serviceCart?.findUnique === "function" &&
    typeof db.serviceCartItem?.deleteMany === "function"
  );
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  if (!hasServiceOrderDelegates()) return;

  const session = event.data.object as Stripe.Checkout.Session;
  const serviceOrderId =
    session.metadata?.serviceOrderId ?? session.client_reference_id ?? null;
  if (!serviceOrderId) return;

  const paidAmount = session.amount_total ?? 0;
  const currency = (session.currency ?? "gbp").toUpperCase();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const order = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    select: {
      id: true,
      userId: true,
    },
  });
  if (!order) return;

  await prisma.serviceOrder.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    },
  });

  await prisma.servicePayment.upsert({
    where: { serviceOrderId: order.id },
    update: {
      status: "PAID",
      providerRef: paymentIntentId ?? session.id,
      amountCents: paidAmount,
      currency,
      paidAt: new Date(),
    },
    create: {
      serviceOrderId: order.id,
      status: "PAID",
      providerRef: paymentIntentId ?? session.id,
      amountCents: paidAmount,
      currency,
      paidAt: new Date(),
    },
  });

  const cart = await prisma.serviceCart.findUnique({
    where: { userId: order.userId },
    select: { id: true },
  });
  if (cart) {
    await prisma.serviceCartItem.deleteMany({
      where: { serviceCartId: cart.id },
    });
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event);
  }

  return NextResponse.json({ received: true });
}
