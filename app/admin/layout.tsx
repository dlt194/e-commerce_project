import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#0b0d0b] text-white">
      <header className="border-b border-white/10 bg-black/30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-black font-semibold">
              TW
            </span>
            <div>
              <p className="text-sm font-semibold">Thomas Web Studio</p>
              <p className="text-xs text-white/50">Admin Console</p>
            </div>
          </div>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 pb-4 text-sm text-white/70 sm:px-6">
          <Link href="/admin/services" className="transition hover:text-white">
            Services
          </Link>
          <Link href="/admin/orders" className="transition hover:text-white">
            Orders
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
