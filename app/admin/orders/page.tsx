import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    where: { requiresKickoffCall: false },
    include: { user: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Orders
        </p>
        <h1 className="text-2xl font-semibold">No kick-off call required</h1>
        <p className="text-sm text-white/60">
          Orders here can be fulfilled without a scheduled call.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/60">
          No orders available yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-white/10 bg-black/40 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-white/60">
                    {order.user?.email ?? "Guest"} ·{" "}
                    {order.createdAt.toDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Total</p>
                  <p className="text-lg font-semibold">
                    {(order.totalCents / 100).toFixed(0)} {order.currency}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
                <span>Status: {order.status}</span>
                <span>Fulfillment: {order.fulfillmentStatus}</span>
                <span>Payment: {order.payments.length ? "Recorded" : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
