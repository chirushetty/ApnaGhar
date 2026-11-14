"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim() || !email.trim() || !password) {
      setError("Please fill in your name, email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
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
        <h1 className="font-display text-3xl text-ink">Create your account</h1>
        <p className="mt-1 font-ui text-sm text-spice">
          Join ApnaGhar to save and post listings.
        </p>

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
            <label htmlFor="displayName" className="font-ui text-sm font-bold text-ink">
              Full name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl border-2 border-dotted border-sun bg-white px-4 py-3 font-ui text-sm text-ink outline-none transition focus:border-marigold"
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="rounded-xl border-2 border-dotted border-sun bg-white px-4 py-3 font-ui text-sm text-ink outline-none transition focus:border-marigold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-flame px-6 py-3 font-ui text-sm font-bold text-white transition hover:bg-rani disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center font-ui text-sm text-spice">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-rani hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
