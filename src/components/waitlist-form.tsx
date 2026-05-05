"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/interested", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
      setMessage("You’re on the list. We’ll send early access when Froggy opens up.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-emerald-900/10 bg-white/80 p-3 shadow-xl shadow-emerald-950/10 backdrop-blur sm:flex sm:items-center sm:gap-3">
      <label className="sr-only" htmlFor="email">
        Work email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        className="h-14 w-full rounded-2xl border border-transparent bg-white px-5 text-base font-semibold text-slate-950 outline-none ring-emerald-500/20 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 sm:flex-1"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-3 h-14 w-full rounded-2xl bg-emerald-500 px-6 text-base font-black text-emerald-950 shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
      >
        {status === "loading" ? "Joining…" : "Get early access"}
      </button>
      {message ? (
        <p className={`px-2 pt-3 text-sm font-semibold sm:absolute sm:translate-y-14 ${status === "success" ? "text-emerald-800" : "text-red-700"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
