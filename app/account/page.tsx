import Link from "next/link";
import { requireUser, destroySession } from "@/lib/auth";

async function signOutAction() {
  "use server";
  await destroySession();
}

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-20 sm:px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Client workspace
            </p>
            <h1 className="text-2xl font-semibold">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}.
            </h1>
            <p className="text-sm text-white/60">
              This is where we will track your project status, files, and next
              steps.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
            >
              Back to site
            </Link>
            <Link
              href="/account/profile"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
            >
              Profile
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
