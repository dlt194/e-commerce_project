import {
  cancelAndArchiveServiceOrderAction,
  confirmKickoffCallAction,
  markServiceOrderDeliveredAction,
  toggleAcceptingOrdersAction,
} from "./actions";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    orders?: string;
  }>;
};

type OrderFilter = "all" | "pending" | "delivered" | "cancelled";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function supportExpiryLabel(order: {
  supportExpiresAt: Date | null;
  deliveredAt: Date | null;
}) {
  if (order.supportExpiresAt) return order.supportExpiresAt.toDateString();
  if (order.deliveredAt) return addDays(order.deliveredAt, 30).toDateString();
  return "Not started";
}

function hasServiceOrderDelegates() {
  const db = prisma as unknown as {
    serviceOrder?: { findMany?: unknown };
  };
  return typeof db.serviceOrder?.findMany === "function";
}

function filterOrderByStatus(
  order: { status: "PENDING" | "PAID" | "DELIVERED" | "CANCELLED" },
  filter: OrderFilter
) {
  if (filter === "all") return true;
  if (filter === "pending") {
    return order.status === "PENDING" || order.status === "PAID";
  }
  if (filter === "delivered") return order.status === "DELIVERED";
  return order.status === "CANCELLED";
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const siteSetting = await getSiteSetting();
  const acceptingOrders = siteSetting?.acceptingOrders ?? true;
  const params = await searchParams;
  const orderToggleMessage =
    params.orders === "open"
      ? "Order intake is now OPEN."
      : params.orders === "closed"
        ? "Order intake is now CLOSED."
        : null;
  const selectedFilter: OrderFilter =
    params.status === "pending" ||
    params.status === "delivered" ||
    params.status === "cancelled"
      ? params.status
      : "all";

  const serviceOrders = hasServiceOrderDelegates()
    ? await prisma.serviceOrder.findMany({
        include: {
          user: true,
          items: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const filteredOrders = serviceOrders.filter((order) =>
    filterOrderByStatus(order, selectedFilter)
  );
  const activeOrders = filteredOrders.filter((order) => !order.isArchived);
  const archivedOrders = filteredOrders.filter((order) => order.isArchived);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Orders
        </p>
        <h1 className="text-2xl font-semibold">Service orders</h1>
        <p className="text-sm text-white/60">
          Paid and pending Stripe checkouts for service packages.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Order intake</p>
            <p className="text-xs text-white/60">
              Current status: {acceptingOrders ? "OPEN" : "CLOSED"}
            </p>
          </div>
          <form action={toggleAcceptingOrdersAction}>
            <input
              type="hidden"
              name="acceptingOrders"
              value={acceptingOrders ? "false" : "true"}
            />
            <button
              type="submit"
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                acceptingOrders
                  ? "border border-rose-300/40 text-rose-100 hover:bg-rose-300/10"
                  : "bg-emerald-400 text-black hover:bg-emerald-300"
              }`}
            >
              {acceptingOrders ? "Close orders" : "Open orders"}
            </button>
          </form>
        </div>
      </div>
      {orderToggleMessage ? (
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {orderToggleMessage}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map((option) => {
          const active = selectedFilter === option.key;
          return (
            <Link
              key={option.key}
              href={
                option.key === "all"
                  ? "/admin/orders"
                  : `/admin/orders?status=${option.key}`
              }
              className={`rounded-full border px-4 py-2 text-xs transition ${
                active
                  ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-100"
                  : "border-white/20 text-white/80 hover:border-white/60 hover:bg-white/10"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {activeOrders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/60">
          No active orders available yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-white/10 bg-black/40 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Order {order.id}</p>
                  <p className="text-sm text-white/60">
                    {order.user.email} ·{" "}
                    {order.createdAt.toDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Total</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: order.currency,
                      maximumFractionDigits: 0,
                    }).format(order.totalCents / 100)}
                  </p>
                </div>
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-white/70">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.serviceName} x {item.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
                <span>Status: {order.status}</span>
                <span>
                  Kick-off call:{" "}
                  {order.requiresKickoffCall
                    ? order.kickoffCallConfirmed
                      ? "COMPLETED"
                      : "REQUIRED"
                    : "NOT REQUIRED"}
                </span>
                <span>Payment: {order.payment?.status ?? "PENDING"}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/50">
                <span>
                  Kick-off confirmed:{" "}
                  {order.kickoffCallConfirmed
                    ? order.kickoffCallConfirmedAt?.toDateString() ?? "Yes"
                    : "No"}
                </span>
                <span>
                  Delivered: {order.deliveredAt ? order.deliveredAt.toDateString() : "No"}
                </span>
                <span>
                  Support expires:{" "}
                  {supportExpiryLabel(order)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {order.requiresKickoffCall && !order.kickoffCallConfirmed ? (
                  <form action={confirmKickoffCallAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-4 py-2 text-xs text-white transition hover:border-white/60 hover:bg-white/10"
                    >
                      Confirm kick-off call
                    </button>
                  </form>
                ) : null}
                {order.status !== "DELIVERED" ? (
                  <form action={markServiceOrderDeliveredAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
                    >
                      Mark as delivered
                    </button>
                  </form>
                ) : null}
                {order.status !== "CANCELLED" &&
                order.status !== "DELIVERED" ? (
                  <form action={cancelAndArchiveServiceOrderAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-300/40 px-4 py-2 text-xs text-rose-100 transition hover:bg-rose-300/10"
                    >
                      Cancel & archive
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {archivedOrders.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Archived orders</h2>
          <div className="grid gap-4">
            {archivedOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-black/30 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">Order {order.id}</p>
                    <p className="text-sm text-white/60">
                      {order.user.email} · {order.createdAt.toDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">Archived</p>
                    <p className="text-sm text-white/80">
                      {order.archivedAt?.toDateString() ?? "Yes"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-white/40">
                  Status: {order.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
