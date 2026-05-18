"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { addStage } from "@/lib/mvp/client";

type AddStageFormProps = {
  roleId: string;
};

type AddStageFormValues = {
  name: string;
  description: string;
  durationMinutes: number;
  interviewerRole: string;
  scoringRules: string;
};

export default function AddStageForm({ roleId }: AddStageFormProps) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (values: AddStageFormValues) =>
      addStage(roleId, {
        name: values.name,
        description: values.description,
        durationMinutes: Number(values.durationMinutes),
        interviewerRole: values.interviewerRole,
        scoringRules: values.scoringRules
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddStageFormValues>({
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 45,
      interviewerRole: "",
      scoringRules: "Every score must include evidence.",
    },
  });

  const message =
    errors.name?.message ||
    errors.durationMinutes?.message ||
    (mutation.isError ? mutation.error.message : "") ||
    "";

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: () => {
            reset();
            router.refresh();
          },
        }),
      )}
      className="grid gap-4 lg:grid-cols-2"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-name">
          Stage name
        </label>
        <input
          id="stage-name"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("name", { required: "Stage name is required." })}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-duration">
          Duration (minutes)
        </label>
        <input
          id="stage-duration"
          type="number"
          min={15}
          step={15}
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("durationMinutes", {
            required: "Duration is required.",
            valueAsNumber: true,
            min: { value: 15, message: "Stage should be at least 15 minutes." },
          })}
        />
      </div>
      <div className="lg:col-span-2">
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-description">
          Description
        </label>
        <textarea
          id="stage-description"
          rows={3}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("description")}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-interviewer-role">
          Interviewer role
        </label>
        <input
          id="stage-interviewer-role"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("interviewerRole")}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-scoring-rules">
          Scoring rules
        </label>
        <textarea
          id="stage-scoring-rules"
          rows={3}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("scoringRules")}
        />
      </div>
      <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          {mutation.isPending ? "Adding stage..." : "Add stage"}
        </button>
        {message ? (
          <p className="text-sm font-medium text-red-700">{message}</p>
        ) : mutation.isSuccess ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            Stage added to the flow.
          </p>
        ) : null}
      </div>
    </form>
  );
}
