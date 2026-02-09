export type DefaultServicePackage = {
  name: string;
  slug: string;
  summary: string;
  priceCents: number | null;
  isCustomQuote: boolean;
  maxPages: number | null;
  includesBackend: boolean;
  includesDatabase: boolean;
  includesHosting: boolean;
  includesAdminPanel: boolean;
  requiresKickoffCall: boolean;
};

export const DEFAULT_SERVICE_PACKAGES: DefaultServicePackage[] = [
  {
    name: "Single Page Sprint",
    slug: "single-page-sprint",
    summary:
      "A focused, high-converting landing page with sharp copy and design.",
    priceCents: 50000,
    isCustomQuote: false,
    maxPages: 1,
    includesBackend: false,
    includesDatabase: false,
    includesHosting: false,
    includesAdminPanel: false,
    requiresKickoffCall: true,
  },
  {
    name: "Five Page Studio",
    slug: "five-page-studio",
    summary:
      "A full marketing site with multiple sections, built for credibility.",
    priceCents: 120000,
    isCustomQuote: false,
    maxPages: 5,
    includesBackend: false,
    includesDatabase: false,
    includesHosting: false,
    includesAdminPanel: false,
    requiresKickoffCall: true,
  },
  {
    name: "Full Stack Growth",
    slug: "full-stack-growth",
    summary:
      "A complete web platform with database, admin panel, and scale-ready architecture.",
    priceCents: 250000,
    isCustomQuote: false,
    maxPages: 10,
    includesBackend: true,
    includesDatabase: true,
    includesHosting: false,
    includesAdminPanel: true,
    requiresKickoffCall: true,
  },
  {
    name: "Bespoke Build",
    slug: "bespoke-build",
    summary: "Tailored scope, advanced integrations, and product strategy.",
    priceCents: null,
    isCustomQuote: true,
    maxPages: null,
    includesBackend: true,
    includesDatabase: true,
    includesHosting: false,
    includesAdminPanel: true,
    requiresKickoffCall: true,
  },
];

export function findDefaultServicePackage(slug: string) {
  return DEFAULT_SERVICE_PACKAGES.find((pkg) => pkg.slug === slug) ?? null;
}
