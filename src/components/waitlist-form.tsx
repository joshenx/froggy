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
    <form onSubmit={onSubmit} className="relative mx-auto rounded-xl border border-black/[0.08] bg-white p-2 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:flex sm:items-center sm:gap-2">
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
        className="h-14 w-full rounded-lg border border-transparent bg-white px-4 text-base text-black outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 sm:flex-1"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 h-12 w-full rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
      >
        {status === "loading" ? "Joining…" : "Try Froggy"}
      </button>
      {message ? (
        <p className={`px-2 pt-3 text-sm font-medium sm:absolute sm:left-2 sm:top-full ${status === "success" ? "text-[#17663a]" : "text-red-700"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
