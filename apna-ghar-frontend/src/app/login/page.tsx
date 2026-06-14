"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-3xl border-2 border-marigold bg-white p-8 shadow-offset-marigold">
        <h1 className="font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-1 font-ui text-sm text-spice">Log in to your ApnaGhar account.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-xl border-2 border-flame/40 bg-flame/10 px-4 py-3 font-ui text-sm text-flame-dark"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-ui text-sm font-bold text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border-2 border-dotted border-sun bg-white px-4 py-3 font-ui text-sm text-ink outline-none transition focus:border-marigold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-ui text-sm font-bold text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border-2 border-dotted border-sun bg-white px-4 py-3 font-ui text-sm text-ink outline-none transition focus:border-marigold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-flame px-6 py-3 font-ui text-sm font-bold text-white transition hover:bg-rani disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center font-ui text-sm text-spice">
          New to ApnaGhar?{" "}
          <Link href="/register" className="font-bold text-rani hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
