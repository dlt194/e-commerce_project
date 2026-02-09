"use client";

import Link from "next/link";
import { useActionState } from "react";

type RegisterState = {
  error?: string;
};

export function RegisterForm({
  action,
}: {
  action: (
    prevState: RegisterState,
    formData: FormData
  ) => Promise<RegisterState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-white/70" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
            placeholder="Thomas"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-white/70" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
            placeholder="Smith"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-white/70" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
          placeholder="you@company.com"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-white/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
          placeholder="At least 8 characters"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-white/70" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
          placeholder="Repeat password"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
      <button
        type="submit"
        className="h-11 rounded-full bg-emerald-400 text-sm font-semibold text-black transition hover:bg-emerald-300"
      >
        Create account
      </button>
      <p className="text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-200">
          Sign in
        </Link>
      </p>
    </form>
  );
}
