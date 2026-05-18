"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  next: string;
};

export default function LoginForm({ next }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
          const supabase = getSupabaseBrowserClient();
          const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
          const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              emailRedirectTo: redirectTo,
            },
          });

          if (error) {
            throw error;
          }

          setMessage("Magic link sent. Open it on this browser to continue into Froggy.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Could not send the magic link.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <label className="grid gap-2 text-sm font-semibold" htmlFor="login-email">
        Work email
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          placeholder="you@company.com"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
        style={{ background: "var(--moss)", color: "var(--paper)" }}
      >
        {submitting ? "Sending magic link..." : "Send magic link"}
      </button>
      {message ? (
        <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
