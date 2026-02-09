import Link from "next/link";
import { createStripeCheckoutSessionAction } from "@/app/actions/stripe-checkout";
import {
  removeServiceCartItemAction,
  updateServiceCartItemQuantityAction,
} from "@/app/actions/service-cart";
import { NavBar } from "@/components/nav-bar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CartPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function cartErrorMessage(error?: string) {
  if (error === "cart_unavailable") {
    return "Cart is temporarily unavailable. Apply the latest migrations for this deployment.";
  }
  if (error === "empty_cart") {
    return "Your cart is empty. Add a service before checkout.";
  }
  if (error === "custom_quote_checkout") {
    return "Custom quote services cannot be checked out directly. Contact us to finalize pricing.";
  }
  if (error === "checkout_cancelled") {
    return "Checkout was canceled. Your cart has been preserved.";
  }
  if (error === "checkout_unavailable") {
    return "Checkout session could not be created. Please try again.";
  }
  if (error === "orders_closed") {
    return "Orders are currently closed. Please check back soon.";
  }
  return null;
}

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) return "Custom";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function hasServiceCartDelegates() {
  const db = prisma as unknown as {
    serviceCart?: { findUnique?: unknown };
    serviceCartItem?: { findUnique?: unknown };
  };
  return (
    typeof db.serviceCart?.findUnique === "function" &&
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

export default async function CartPage({ searchParams }: CartPageProps) {
  const user = await requireUser();
  const { error } = await searchParams;
  const errorMessage = cartErrorMessage(error);
  let cartAvailable = hasServiceCartDelegates();
  let cart = null;

  if (cartAvailable) {
    try {
      cart = await prisma.serviceCart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              servicePackage: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (queryError) {
      if (isMissingCartTableError(queryError)) {
        cartAvailable = false;
      } else {
        throw queryError;
      }
    }
  }

  const items = cart?.items ?? [];
  const totalCents = items.reduce((sum, item) => {
    if (item.servicePackage.priceCents === null) return sum;
    return sum + item.servicePackage.priceCents * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <NavBar />
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Cart
              </p>
              <h1 className="text-3xl font-semibold">Your services</h1>
            </div>
            <Link
              href="/#services"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Add more services
            </Link>
          </div>

          {!cartAvailable || errorMessage ? (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">
              {errorMessage ??
                "Cart is temporarily unavailable. Regenerate Prisma client and apply migrations for this deployment."}
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
              <p className="text-white/70">Your cart is empty.</p>
              <Link
                href="/#services"
                className="mt-4 inline-flex rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black"
              >
                Browse services
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {item.servicePackage.name}
                      </h2>
                      <p className="mt-1 text-sm text-white/60">
                        {item.servicePackage.summary}
                      </p>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatMoney(
                        item.servicePackage.priceCents === null
                          ? null
                          : item.servicePackage.priceCents * item.quantity,
                        item.servicePackage.priceCurrency
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <form action={updateServiceCartItemQuantityAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input
                        type="hidden"
                        name="quantity"
                        value={Math.max(item.quantity - 1, 0)}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80"
                      >
                        -
                      </button>
                    </form>
                    <span className="text-sm text-white/80">
                      Qty {item.quantity}
                    </span>
                    <form action={updateServiceCartItemQuantityAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input
                        type="hidden"
                        name="quantity"
                        value={item.quantity + 1}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80"
                      >
                        +
                      </button>
                    </form>
                    <form action={removeServiceCartItemAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-rose-300/30 px-3 py-1 text-sm text-rose-100"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Estimated subtotal</p>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: "GBP",
                      maximumFractionDigits: 0,
                    }).format(totalCents / 100)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-white/50">
                  Custom-quote services are excluded from subtotal until priced.
                </p>
                <form action={createStripeCheckoutSessionAction} className="mt-4">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Proceed to payment
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
