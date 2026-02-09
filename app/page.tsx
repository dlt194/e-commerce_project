import { NavBar } from "@/components/nav-bar";
import { addServiceToCartAction } from "@/app/actions/service-cart";
import { DEFAULT_SERVICE_PACKAGES } from "@/lib/default-service-packages";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";

type ServiceTier = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  priceCents: number | null;
  isCustomQuote: boolean;
  maxPages: number | null;
  includesBackend: boolean;
  includesDatabase: boolean;
  includesAdminPanel: boolean;
};

function formatPrice(priceCents: number | null, isCustomQuote: boolean) {
  if (isCustomQuote || priceCents === null) return "Custom";
  return `£${(priceCents / 100).toFixed(0)}`;
}

function packageDetails(pkg: {
  maxPages: number | null;
  includesBackend: boolean;
  includesDatabase: boolean;
  includesAdminPanel: boolean;
}) {
  return [
    pkg.maxPages ? `Up to ${pkg.maxPages} page${pkg.maxPages > 1 ? "s" : ""}` : "Flexible pages",
    pkg.includesDatabase ? "Database included" : "No database",
    pkg.includesBackend ? "Backend included" : "No backend",
    pkg.includesAdminPanel ? "Admin panel included" : "Admin panel not included",
  ];
}

export default async function Page() {
  const siteSetting = await getSiteSetting();
  const acceptingOrders = siteSetting?.acceptingOrders ?? true;

  let dbPackages: ServiceTier[] = [];
  try {
    dbPackages = await prisma.servicePackage.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        summary: true,
        priceCents: true,
        isCustomQuote: true,
        maxPages: true,
        includesBackend: true,
        includesDatabase: true,
        includesAdminPanel: true,
      },
    });
  } catch (error) {
    console.error("Failed to load service packages from database", error);
  }

  const fallbackPackages: ServiceTier[] = DEFAULT_SERVICE_PACKAGES.map(
    (pkg) => ({
      id: `default-${pkg.slug}`,
      slug: pkg.slug,
      name: pkg.name,
      summary: pkg.summary,
      priceCents: pkg.priceCents,
      isCustomQuote: pkg.isCustomQuote,
      maxPages: pkg.maxPages,
      includesBackend: pkg.includesBackend,
      includesDatabase: pkg.includesDatabase,
      includesAdminPanel: pkg.includesAdminPanel,
    })
  );

  const packages: ServiceTier[] =
    dbPackages.length > 0
      ? dbPackages
      : fallbackPackages;

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-emerald-400/30 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-lime-300/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_50%)]" />
      </div>
      <NavBar />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-20 sm:px-6 lg:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
          Web Development Studio
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              acceptingOrders
                ? "bg-emerald-400/20 text-emerald-200"
                : "bg-rose-400/20 text-rose-200"
            }`}
          >
            {acceptingOrders ? "2026 bookings open" : "orders currently closed"}
          </span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Turn your service business into a high-converting web experience.
            </h1>
            <p className="text-lg text-white/70 sm:text-xl">
              I design and build premium websites for consultants, agencies, and
              founders who need a site that sells. Pick a package or request a
              bespoke build — every project ships with strategy, copy guidance,
              and polish.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Schedule a discovery call
              </a>
              <a
                href="#services"
                className="rounded-full border border-white/20 px-6 py-3 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
              >
                See service tiers
              </a>
            </div>
          </div>
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                Studio highlights
              </p>
              <h2 className="text-2xl font-semibold">
                Crafted to feel premium and personal
              </h2>
              <p className="text-sm text-white/70">
                Clean design, thoughtful copy, and fast performance that lets
                your work speak for itself.
              </p>
            </div>
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Timeline</span>
                <span className="font-semibold text-white">3 weeks</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Pages shipped</span>
                <span className="font-semibold text-white">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Tech stack</span>
                <span className="font-semibold text-white">Next.js + Prisma</span>
              </div>
            </div>
            <p className="text-xs text-white/40">
              Ask for a demo walk-through in the discovery call.
            </p>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
      >
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Services
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Choose a clear, outcome-driven package.
            </h2>
          </div>
          <span className="hidden text-sm text-white/60 md:block">
            Custom quotes available within 24 hours.
          </span>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {packages.map((tier) => (
            <div
              key={tier.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-emerald-300/40 hover:bg-white/10"
            >
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-300/30" />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{tier.name}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {tier.summary ?? "Built to match your project goals."}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold">
                  {formatPrice(tier.priceCents, tier.isCustomQuote)}
                </span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-white/70">
                {packageDetails(tier).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <form action={addServiceToCartAction} className="mt-6">
                <input type="hidden" name="slug" value={tier.slug} />
                <button
                  type="submit"
                  disabled={!acceptingOrders}
                  className="w-full rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-white/20 disabled:hover:bg-transparent"
                >
                  {acceptingOrders ? "Add to cart" : "Orders closed"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section
        id="process"
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
      >
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Process
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Clear steps, zero guesswork.
              </h2>
              <p className="text-white/70">
                Every engagement includes strategy, wireframes, and a launch
                checklist. You stay in the loop with weekly updates and shared
                milestones.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                "Discovery call + proposal",
                "UX flow + visual direction",
                "Build, polish, and optimize",
                "Launch + 30-day support",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/20 text-sm font-semibold text-emerald-100">
                    0{index + 1}
                  </span>
                  <span className="text-sm text-white/80">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="hosting"
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
      >
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Hosting
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Optional managed hosting scaled to your package.
            </h2>
            <p className="text-white/70">
              Prefer a hands-off setup? I can provision and manage your hosting,
              monitor uptime, and handle deployments so your site stays fast and
              secure. Pricing scales with complexity and traffic.
            </p>
          </div>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Platform</span>
              <span className="font-semibold text-white">Vercel Pro</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Includes</span>
              <span className="font-semibold text-white">
                Hosting + monitoring
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Range</span>
              <span className="font-semibold text-white">£80–£140 p/m</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
      >
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/60 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready to launch your next site?
          </h2>
          <p className="text-white/70">
            Share your goals, timeline, and budget. I’ll reply within 24 hours
            with the best next step.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@craftededge.studio"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Email hello@thomaswebstudio.com
            </a>
            <a
              href="#services"
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Review packages
            </a>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Limited availability each month.
          </p>
        </div>
      </section>
    </main>
  );
}
