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
    <form
      onSubmit={onSubmit}
      className="relative mx-auto rounded-xl border p-2 sm:flex sm:items-center sm:gap-2"
      style={{
        borderColor: "var(--line)",
        background: "var(--paper)",
        boxShadow: "0 18px 60px rgba(45,95,63,0.10)",
      }}
    >
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
        className="h-14 w-full rounded-lg border border-transparent px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 sm:flex-1"
        style={{ background: "var(--paper)", color: "var(--ink)" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 h-12 w-full rounded-lg px-5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
        style={{
          background: "var(--moss)",
          color: "var(--paper)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)",
        }}
      >
        {status === "loading" ? "Joining…" : "Get early access"}
      </button>
      {message ? (
        <p
          className="px-2 pt-3 text-sm font-medium sm:absolute sm:left-2 sm:top-full"
          style={{ color: status === "success" ? "var(--moss)" : "#b91c1c" }}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
