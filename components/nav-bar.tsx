import Link from "next/link";

export const NavBar = () => {
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
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
          >
            Book a Call
          </Link>
          <Link
            href="/#services"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            View Packages
          </Link>
        </div>
      </nav>
    </header>
  );
};
