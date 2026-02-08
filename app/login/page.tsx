import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "./actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/account");
  }

  return (
    <main className="min-h-screen bg-[#0b0d0b] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-emerald-400/30 blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-lime-300/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />
      </div>
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Thomas Web Studio
            </p>
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="text-sm text-white/70">
              Sign in to access your project workspace.
            </p>
          </div>
          <LoginForm action={loginAction} />
        </div>
      </section>
    </main>
  );
}
