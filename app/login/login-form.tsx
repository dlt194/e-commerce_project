"use client";

import { useFormState } from "react-dom";

type LoginState = {
  error?: string;
};

export function LoginForm({
  action,
}: {
  action: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-4">
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
          autoComplete="current-password"
          required
          className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-300/60 focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
      <button
        type="submit"
        className="h-11 rounded-full bg-emerald-400 text-sm font-semibold text-black transition hover:bg-emerald-300"
      >
        Sign in
      </button>
    </form>
  );
}
