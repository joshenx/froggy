"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createRole } from "@/lib/mvp/client";
import type { RoleLevel } from "@/lib/mvp/types";

type CreateRoleFormValues = {
  name: string;
  level: RoleLevel;
  flowName: string;
  stageList: string;
};

export default function CreateRoleForm() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: createRole,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({
    defaultValues: {
      name: "",
      level: "senior",
      flowName: "",
      stageList: "Recruiter screen\nTechnical interview\nHiring manager",
    },
  });

  const message =
    errors.name?.message ||
    errors.flowName?.message ||
    errors.stageList?.message ||
    (mutation.isError ? mutation.error.message : "") ||
    "";

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      {
        name: values.name,
        level: values.level,
        flowName: values.flowName,
        stageNames: values.stageList
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      {
        onSuccess: ({ roleId }) => {
          router.replace(`/roles/${roleId}/flow`);
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="role-name">
          Role
        </label>
        <input
          id="role-name"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("name", { required: "Role name is required." })}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="role-level">
          Level
        </label>
        <select
          id="role-level"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("level")}
        >
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold" htmlFor="flow-name">
          Flow name
        </label>
        <input
          id="flow-name"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("flowName", { required: "Flow name is required." })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold" htmlFor="stage-list">
          Stages
        </label>
        <textarea
          id="stage-list"
          rows={5}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("stageList", { required: "Add at least one stage." })}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          One stage per line. Froggy will create a draft flow and stage order for you.
        </p>
      </div>
      <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          {mutation.isPending ? "Creating role..." : "Create role and flow"}
        </button>
        {message ? (
          <p className="text-sm font-medium text-red-700">{message}</p>
        ) : mutation.isSuccess ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            Draft flow created. Opening the flow builder...
          </p>
        ) : null}
      </div>
    </form>
  );
}
