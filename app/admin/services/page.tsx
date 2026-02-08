import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createPackageAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  const summary = String(formData.get("summary") ?? "").trim();
  const maxPages = Number(formData.get("maxPages") ?? "");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceValue = Number(priceRaw);
  const priceCents = Number.isFinite(priceValue)
    ? Math.round(priceValue * 100)
    : null;
  const isCustomQuote = formData.get("isCustomQuote") === "on";

  await prisma.servicePackage.create({
    data: {
      name,
      slug,
      summary: summary || null,
      maxPages: Number.isFinite(maxPages) ? maxPages : null,
      priceCents: isCustomQuote ? null : priceCents,
      isCustomQuote,
      includesBackend: formData.get("includesBackend") === "on",
      includesDatabase: formData.get("includesDatabase") === "on",
      includesHosting: formData.get("includesHosting") === "on",
      includesAdminPanel: formData.get("includesAdminPanel") === "on",
      requiresKickoffCall: formData.get("requiresKickoffCall") === "on",
      status: String(formData.get("status") ?? "DRAFT") as
        | "DRAFT"
        | "ACTIVE"
        | "ARCHIVED",
    },
  });

  revalidatePath("/admin/services");
}

async function updatePackageAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceValue = Number(priceRaw);
  const priceCents = Number.isFinite(priceValue)
    ? Math.round(priceValue * 100)
    : null;
  const isCustomQuote = formData.get("isCustomQuote") === "on";
  const maxPages = Number(formData.get("maxPages") ?? "");

  await prisma.servicePackage.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      slug: slugify(String(formData.get("slug") ?? "")),
      summary: String(formData.get("summary") ?? "").trim() || null,
      maxPages: Number.isFinite(maxPages) ? maxPages : null,
      priceCents: isCustomQuote ? null : priceCents,
      isCustomQuote,
      includesBackend: formData.get("includesBackend") === "on",
      includesDatabase: formData.get("includesDatabase") === "on",
      includesHosting: formData.get("includesHosting") === "on",
      includesAdminPanel: formData.get("includesAdminPanel") === "on",
      requiresKickoffCall: formData.get("requiresKickoffCall") === "on",
      status: String(formData.get("status") ?? "DRAFT") as
        | "DRAFT"
        | "ACTIVE"
        | "ARCHIVED",
    },
  });

  revalidatePath("/admin/services");
}

export default async function AdminServicesPage() {
  await requireAdmin();
  const packages = await prisma.servicePackage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            New service
          </p>
          <h1 className="text-2xl font-semibold">Create a service package</h1>
        </div>
        <form action={createPackageAction} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder="Name"
              className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
              required
            />
            <input
              name="slug"
              placeholder="Slug (optional)"
              className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
            />
          </div>
          <textarea
            name="summary"
            placeholder="Summary"
            className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="price"
              placeholder="Price in GBP"
              className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
            />
            <input
              name="maxPages"
              placeholder="Max pages"
              className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
            />
            <select
              name="status"
              className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
              defaultValue="ACTIVE"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includesBackend" />
              Includes backend
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includesDatabase" />
              Includes database
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includesHosting" />
              Includes hosting
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="includesAdminPanel" />
              Includes admin panel
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requiresKickoffCall" defaultChecked />
              Requires kickoff call
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isCustomQuote" />
              Custom quote
            </label>
          </div>
          <button
            type="submit"
            className="h-11 rounded-full bg-emerald-400 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            Add service
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Service packages</h2>
          <p className="text-sm text-white/50">{packages.length} total</p>
        </div>
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <form
              key={pkg.id}
              action={updatePackageAction}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/40 p-6"
            >
              <input type="hidden" name="id" value={pkg.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="name"
                  defaultValue={pkg.name}
                  className="h-11 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm text-white"
                  required
                />
                <input
                  name="slug"
                  defaultValue={pkg.slug}
                  className="h-11 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm text-white"
                  required
                />
              </div>
              <textarea
                name="summary"
                defaultValue={pkg.summary ?? ""}
                className="min-h-20 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  name="price"
                  defaultValue={
                    pkg.priceCents ? (pkg.priceCents / 100).toFixed(0) : ""
                  }
                  placeholder="Price in GBP"
                  className="h-11 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm text-white"
                />
                <input
                  name="maxPages"
                  defaultValue={pkg.maxPages ?? ""}
                  placeholder="Max pages"
                  className="h-11 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm text-white"
                />
                <select
                  name="status"
                  defaultValue={pkg.status}
                  className="h-11 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm text-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesBackend"
                    defaultChecked={pkg.includesBackend}
                  />
                  Includes backend
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesDatabase"
                    defaultChecked={pkg.includesDatabase}
                  />
                  Includes database
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesHosting"
                    defaultChecked={pkg.includesHosting}
                  />
                  Includes hosting
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesAdminPanel"
                    defaultChecked={pkg.includesAdminPanel}
                  />
                  Includes admin panel
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresKickoffCall"
                    defaultChecked={pkg.requiresKickoffCall}
                  />
                  Requires kickoff call
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isCustomQuote"
                    defaultChecked={pkg.isCustomQuote}
                  />
                  Custom quote
                </label>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Created {pkg.createdAt.toDateString()}</span>
                <button
                  type="submit"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
                >
                  Save changes
                </button>
              </div>
            </form>
          ))}
          {packages.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/60">
              No services yet. Create your first package above.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
