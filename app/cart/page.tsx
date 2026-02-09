import Link from "next/link";
import {
  removeServiceCartItemAction,
  updateServiceCartItemQuantityAction,
} from "@/app/actions/service-cart";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) return "Custom";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function CartPage() {
  const user = await requireUser();

  const cart = await prisma.serviceCart.findUnique({
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

  const items = cart?.items ?? [];
  const totalCents = items.reduce((sum, item) => {
    if (item.servicePackage.priceCents === null) return sum;
    return sum + item.servicePackage.priceCents * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
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
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
