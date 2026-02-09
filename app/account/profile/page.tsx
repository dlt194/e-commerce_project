import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackButton } from "./back-button";

type ProfilePageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function buildProfileUrl(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `/account/profile?${query.toString()}`;
}

async function updateEmailAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(buildProfileUrl({ error: "email_required" }));
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(buildProfileUrl({ error: "email_taken" }));
    }
    throw error;
  }

  redirect(buildProfileUrl({ success: "email_updated" }));
}

async function updatePasswordAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect(buildProfileUrl({ error: "password_fields_required" }));
  }

  if (newPassword !== confirmPassword) {
    redirect(buildProfileUrl({ error: "password_mismatch" }));
  }

  if (newPassword.length < 8) {
    redirect(buildProfileUrl({ error: "password_too_short" }));
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  if (!passwordMatches) {
    redirect(buildProfileUrl({ error: "password_incorrect" }));
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  redirect(buildProfileUrl({ success: "password_updated" }));
}

function getMessage(success?: string, error?: string) {
  if (success === "email_updated") {
    return { type: "success", text: "Email updated successfully." };
  }
  if (success === "password_updated") {
    return { type: "success", text: "Password updated successfully." };
  }
  if (error === "email_required") {
    return { type: "error", text: "Email is required." };
  }
  if (error === "email_taken") {
    return { type: "error", text: "That email is already in use." };
  }
  if (error === "password_fields_required") {
    return { type: "error", text: "All password fields are required." };
  }
  if (error === "password_mismatch") {
    return { type: "error", text: "New password and confirmation do not match." };
  }
  if (error === "password_too_short") {
    return { type: "error", text: "New password must be at least 8 characters." };
  }
  if (error === "password_incorrect") {
    return { type: "error", text: "Current password is incorrect." };
  }
  return null;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser();
  const { success, error } = await searchParams;
  const message = getMessage(success, error);
  const fallbackHref = user.role === "ADMIN" ? "/admin" : "/account";
  const dashboardLabel = user.role === "ADMIN" ? "Admin panel" : "Workspace";

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <NavBar />
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton fallbackHref={fallbackHref} />
            <Link
              href={fallbackHref}
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
            >
              {dashboardLabel}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Account settings
            </p>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-white/60">
              Manage your login details for {user.email}.
            </p>
          </div>

          {message ? (
            <p
              className={`rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  : "border-rose-300/30 bg-rose-300/10 text-rose-100"
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-2">
            <form action={updateEmailAction} className="grid gap-4">
              <h2 className="text-lg font-semibold">Update email</h2>
              <label className="grid gap-2 text-sm text-white/70">
                New email
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
                />
              </label>
              <button
                type="submit"
                className="h-11 rounded-full bg-emerald-400 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Save email
              </button>
            </form>

            <form action={updatePasswordAction} className="grid gap-4">
              <h2 className="text-lg font-semibold">Update password</h2>
              <label className="grid gap-2 text-sm text-white/70">
                Current password
                <input
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
                />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                New password
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
                />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Confirm new password
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white"
                />
              </label>
              <button
                type="submit"
                className="h-11 rounded-full bg-emerald-400 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Save password
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
