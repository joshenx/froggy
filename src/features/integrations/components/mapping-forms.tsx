"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { saveJobMapping, saveStageMapping } from "@/lib/mvp/client";
import type {
  AtsJob,
  AtsJobMapping,
  AtsProvider,
  AtsStage,
  InterviewFlow,
  InterviewStage,
  Role,
} from "@/lib/mvp/types";

type JobMappingFormProps = {
  provider: AtsProvider;
  jobs: AtsJob[];
  roles: Role[];
  flows: InterviewFlow[];
};

export function JobMappingForm({ provider, jobs, roles, flows }: JobMappingFormProps) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (values: { externalJobId: string; froggyRoleId: string; froggyFlowId: string }) =>
      saveJobMapping(provider, values),
  });
  const { control, register, handleSubmit } = useForm<{
    externalJobId: string;
    froggyRoleId: string;
    froggyFlowId: string;
  }>({
    defaultValues: {
      externalJobId: jobs[0]?.externalJobId ?? "",
      froggyRoleId: roles[0]?.id ?? "",
      froggyFlowId: flows[0]?.id ?? "",
    },
  });

  const selectedRoleId = useWatch({ control, name: "froggyRoleId" });
  const visibleFlows = flows.filter((flow) => flow.roleId === selectedRoleId);

  return (
    <form
      data-testid={`${provider}-job-mapping-form`}
      onSubmit={handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: () => router.refresh(),
        }),
      )}
      className="grid gap-4 lg:grid-cols-3"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-job-mapping-job`}>
          ATS job
        </label>
        <select
          id={`${provider}-job-mapping-job`}
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("externalJobId")}
        >
          {jobs.map((job) => (
            <option key={job.externalJobId} value={job.externalJobId}>
              {job.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-job-mapping-role`}>
          Froggy role
        </label>
        <select
          id={`${provider}-job-mapping-role`}
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("froggyRoleId")}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-job-mapping-flow`}>
            Froggy flow
          </label>
          <select
            id={`${provider}-job-mapping-flow`}
            className="h-12 w-full rounded-2xl border px-4 outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            {...register("froggyFlowId")}
          >
            {visibleFlows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          Save
        </button>
      </div>
      {mutation.isError ? (
        <p className="lg:col-span-3 text-sm text-red-700">{mutation.error.message}</p>
      ) : mutation.isSuccess ? (
        <p className="lg:col-span-3 text-sm font-medium" style={{ color: "var(--moss)" }}>
          Job mapping saved.
        </p>
      ) : null}
    </form>
  );
}

type StageMappingFormProps = {
  provider: AtsProvider;
  jobMappings: AtsJobMapping[];
  atsStages: AtsStage[];
  froggyStages: InterviewStage[];
};

export function StageMappingForm({
  provider,
  jobMappings,
  atsStages,
  froggyStages,
}: StageMappingFormProps) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (values: { atsJobMappingId: string; externalStageId: string; froggyStageId: string }) =>
      saveStageMapping(provider, values),
  });
  const { register, handleSubmit } = useForm<{
    atsJobMappingId: string;
    externalStageId: string;
    froggyStageId: string;
  }>({
    defaultValues: {
      atsJobMappingId: jobMappings[0]?.id ?? "",
      externalStageId: atsStages[0]?.externalStageId ?? "",
      froggyStageId: froggyStages[0]?.id ?? "",
    },
  });

  return (
    <form
      data-testid={`${provider}-stage-mapping-form`}
      onSubmit={handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: () => router.refresh(),
        }),
      )}
      className="grid gap-4 lg:grid-cols-3"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-stage-mapping-job`}>
          Job mapping
        </label>
        <select
          id={`${provider}-stage-mapping-job`}
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("atsJobMappingId")}
        >
          {jobMappings.map((mapping) => (
            <option key={mapping.id} value={mapping.id}>
              {mapping.externalJobId}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-stage-mapping-ats-stage`}>
          ATS stage
        </label>
        <select
          id={`${provider}-stage-mapping-ats-stage`}
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("externalStageId")}
        >
          {atsStages.map((stage) => (
            <option key={stage.externalStageId} value={stage.externalStageId}>
              {stage.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold" htmlFor={`${provider}-stage-mapping-froggy-stage`}>
            Froggy stage
          </label>
          <select
            id={`${provider}-stage-mapping-froggy-stage`}
            className="h-12 w-full rounded-2xl border px-4 outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            {...register("froggyStageId")}
          >
            {froggyStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          Save
        </button>
      </div>
      {mutation.isError ? (
        <p className="lg:col-span-3 text-sm text-red-700">{mutation.error.message}</p>
      ) : mutation.isSuccess ? (
        <p className="lg:col-span-3 text-sm font-medium" style={{ color: "var(--moss)" }}>
          Stage mapping saved.
        </p>
      ) : null}
    </form>
  );
}
