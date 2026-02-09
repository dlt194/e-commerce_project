import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function hasServiceCartDelegates() {
  const db = prisma as unknown as {
    serviceCart?: { findUnique?: unknown };
  };
  return typeof db.serviceCart?.findUnique === "function";
}

export const NavBar = async () => {
  let cartItemCount = 0;
  const user = await getCurrentUser();
  const profileHref = user?.role === "ADMIN" ? "/admin/profile" : "/account/profile";

  if (user && hasServiceCartDelegates()) {
    try {
      const cart = await prisma.serviceCart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });
      cartItemCount =
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    } catch (error) {
      console.error("Failed to load cart count for nav", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-black font-semibold">
            TW
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/#services" className="transition hover:text-white">
            Services
          </Link>
          <Link href="/#process" className="transition hover:text-white">
            Process
          </Link>
          <Link href="/#hosting" className="transition hover:text-white">
            Hosting
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={profileHref}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Login
            </Link>
          )}
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/10"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-black">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </nav>
    </header>
  );
};
