import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

function hasServiceOrderDelegates() {
  const db = prisma as unknown as {
    serviceOrder?: { findFirst?: unknown };
  };
  return typeof db.serviceOrder?.findFirst === "function";
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const user = await requireUser();
  const { session_id: sessionId } = await searchParams;
  const order =
    sessionId && hasServiceOrderDelegates()
      ? await prisma.serviceOrder.findFirst({
          where: {
            userId: user.id,
            stripeCheckoutSessionId: sessionId,
          },
          include: {
            items: true,
          },
        })
      : null;

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <NavBar />
      <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Payment received</h1>
          <p className="mt-3 text-sm text-white/70">
            Thank you. Your order is recorded and we will contact you about the
            project kick-off process.
          </p>

          {order ? (
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-white/60">Order reference</p>
              <p className="text-lg font-semibold">{order.id}</p>
              <p className="text-sm text-white/60">
                Status: <span className="text-white">{order.status}</span>
              </p>
              <p className="text-sm text-white/60">
                Total:{" "}
                <span className="text-white">
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                    maximumFractionDigits: 0,
                  }).format(order.totalCents / 100)}
                </span>
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Go to workspace
            </Link>
            <Link
              href="/"
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
