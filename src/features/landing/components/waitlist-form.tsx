"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { joinWaitlist } from "@/lib/waitlist";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const successMessage =
  "You’re on the list. We’ll send private beta invites and early-access updates.";

type WaitlistFormValues = {
  email: string;
};

export default function WaitlistForm() {
  const mutation = useMutation({
    mutationFn: joinWaitlist,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const message =
    errors.email?.message ||
    (mutation.isError ? mutation.error.message : "") ||
    (mutation.isSuccess ? successMessage : "");

  const onSubmit = handleSubmit(({ email }) => {
    mutation.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        reset();
      },
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
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
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        className="h-14 w-full rounded-lg border border-transparent px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 sm:flex-1"
        style={{ background: "var(--paper)", color: "var(--ink)" }}
        aria-invalid={errors.email ? "true" : "false"}
        aria-describedby={message ? "waitlist-message" : undefined}
        {...register("email", {
          required: "Please enter your work email.",
          pattern: {
            value: emailPattern,
            message: "Please enter a valid email address.",
          },
          onChange: () => {
            if (mutation.isSuccess || mutation.isError) {
              mutation.reset();
            }
          },
        })}
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2 h-12 w-full rounded-lg px-5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
        style={{
          background: "var(--moss)",
          color: "var(--paper)",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)",
        }}
      >
        {mutation.isPending ? "Joining..." : "Join waitlist"}
      </button>
      {message ? (
        <p
          id="waitlist-message"
          aria-live="polite"
          className="px-2 pt-3 text-sm font-medium sm:absolute sm:left-2 sm:top-full"
          style={{ color: mutation.isSuccess ? "var(--moss)" : "#b91c1c" }}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
