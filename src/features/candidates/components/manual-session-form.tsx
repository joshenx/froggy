"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createInterviewSession } from "@/lib/mvp/client";
import type { InterviewStage, User } from "@/lib/mvp/types";

type ManualSessionFormProps = {
  applicationId: string;
  stages: InterviewStage[];
  users: User[];
};

type ManualSessionFormValues = {
  froggyStageId: string;
  interviewerUserId: string;
  scheduledAt: string;
};

export default function ManualSessionForm({
  applicationId,
  stages,
  users,
}: ManualSessionFormProps) {
  const mutation = useMutation({
    mutationFn: (values: ManualSessionFormValues) =>
      createInterviewSession({
        applicationId,
        froggyStageId: values.froggyStageId,
        interviewerUserId: values.interviewerUserId || undefined,
        scheduledAt: values.scheduledAt || undefined,
      }),
  });
  const { register, handleSubmit, reset } = useForm<ManualSessionFormValues>({
    defaultValues: {
      froggyStageId: stages[0]?.id ?? "",
      interviewerUserId: users.find((user) => user.role === "interviewer")?.id ?? "",
      scheduledAt: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: ({ sessionId }) => {
            reset();
            window.location.assign(`/interviews/${sessionId}`);
          },
        }),
      )}
      className="grid gap-4 md:grid-cols-3"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="manual-session-stage">
          Froggy stage
        </label>
        <select
          id="manual-session-stage"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("froggyStageId")}
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="manual-session-interviewer">
          Interviewer
        </label>
        <select
          id="manual-session-interviewer"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("interviewerUserId")}
        >
          <option value="">Unassigned interviewer</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold" htmlFor="manual-session-scheduled-at">
            Scheduled at
          </label>
          <input
            id="manual-session-scheduled-at"
            type="datetime-local"
            className="h-12 w-full rounded-2xl border px-4 outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            {...register("scheduledAt")}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          {mutation.isPending ? "Creating..." : "Create"}
        </button>
      </div>
      {mutation.isError ? <p className="md:col-span-3 text-sm text-red-700">{mutation.error.message}</p> : null}
    </form>
  );
}
