"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  createBankQuestion,
  createGlobalBankQuestion,
  updateBankQuestion,
} from "@/lib/mvp/client";
import type { Company, EvaluationAxis, Question, RoleLevel } from "@/lib/mvp/types";
import styles from "./question-bank.module.css";

type QuestionComposerMode = "create" | "edit" | "duplicate";

type CreateQuestionFormProps = {
  roleId?: string;
  roleFamily: string;
  axes: EvaluationAxis[];
  companies: Company[];
  cancelHref: string;
  mode?: QuestionComposerMode;
  questionId?: string;
  initialQuestion?: Question | null;
};

type CreateQuestionFormValues = {
  prompt: string;
  roleFamily: string;
  collection: string;
  expectedDurationMinutes: number;
  axisIds: string[];
  companyIds: string[];
  levels: RoleLevel[];
  difficulty: number;
  rationale: string;
  anchor1: string;
  anchor3: string;
  anchor5: string;
  followUps: Array<{ value: string }>;
};

const levelOptions: RoleLevel[] = ["junior", "mid", "senior", "staff", "manager"];

export default function CreateQuestionForm({
  roleId,
  roleFamily,
  axes,
  companies,
  cancelHref,
  mode = "create",
  questionId,
  initialQuestion,
}: CreateQuestionFormProps) {
  const router = useRouter();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<CreateQuestionFormValues>({
    defaultValues: {
      prompt: initialQuestion?.prompt ?? "",
      roleFamily: initialQuestion?.roleFamily ?? roleFamily,
      collection: initialQuestion?.collection ?? "Engineering",
      expectedDurationMinutes: initialQuestion?.expectedDurationMinutes ?? 20,
      axisIds: initialQuestion?.axisIds ?? [],
      companyIds: initialQuestion?.companyIds ?? [],
      levels: initialQuestion?.levels ?? [],
      difficulty: initialQuestion?.difficulty ?? 0,
      rationale: initialQuestion?.rationale ?? "",
      anchor1: initialQuestion?.anchors[0] ?? "",
      anchor3: initialQuestion?.anchors[1] ?? "",
      anchor5: initialQuestion?.anchors[2] ?? "",
      followUps:
        initialQuestion?.followUps.length
          ? initialQuestion.followUps.map((followUp) => ({ value: followUp }))
          : [{ value: "What evidence would change your mind?" }],
    },
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "followUps",
  });

  const prompt = useWatch({ control, name: "prompt" }) ?? "";
  const selectedAxes = useWatch({ control, name: "axisIds" }) ?? [];
  const selectedCompanies = useWatch({ control, name: "companyIds" }) ?? [];
  const selectedLevels = useWatch({ control, name: "levels" }) ?? [];
  const difficulty = useWatch({ control, name: "difficulty" }) ?? 0;
  const selectedRoleFamily = useWatch({ control, name: "roleFamily" }) ?? "";
  const selectedCollection = useWatch({ control, name: "collection" }) ?? "";
  const duration = useWatch({ control, name: "expectedDurationMinutes" }) ?? 20;
  const rationale = useWatch({ control, name: "rationale" }) ?? "";
  const anchor1 = useWatch({ control, name: "anchor1" }) ?? "";
  const anchor3 = useWatch({ control, name: "anchor3" }) ?? "";
  const anchor5 = useWatch({ control, name: "anchor5" }) ?? "";

  const mutation = useMutation({
    mutationFn: async (values: CreateQuestionFormValues) => {
      const payload = {
        title: buildTitle(values.prompt),
        prompt: values.prompt,
        difficulty: values.difficulty as 1 | 2 | 3 | 4 | 5,
        seniority: pickPrimaryLevel(values.levels),
        levels: values.levels,
        axisIds: values.axisIds,
        companyIds: values.companyIds,
        followUps: values.followUps.map((item) => item.value.trim()).filter(Boolean),
        expectedSignals: values.axisIds.map(
          (axisId) => axes.find((axis) => axis.id === axisId)?.name ?? axisId,
        ),
        expectedDurationMinutes: Number(values.expectedDurationMinutes),
        collection: values.collection,
        roleFamily: values.roleFamily,
        rationale: values.rationale,
        anchors: [values.anchor1, values.anchor3, values.anchor5] as [string, string, string],
      };

      if (mode === "edit" && questionId) {
        return updateBankQuestion(questionId, payload);
      }

      return roleId ? createBankQuestion(roleId, payload) : createGlobalBankQuestion(payload);
    },
  });

  const qualityChecks = [
    { label: "Question text written", done: prompt.trim().length >= 10 },
    { label: "Role family chosen", done: selectedRoleFamily.trim().length > 0 },
    { label: "At least one competency tag", done: selectedAxes.length >= 1 },
    { label: "At least one level selected", done: selectedLevels.length >= 1 },
    { label: "Difficulty set", done: difficulty >= 1 },
    {
      label: "Anchors for 1, 3, and 5",
      done: [anchor1, anchor3, anchor5].every((value) => value.trim().length > 0),
    },
  ];
  const completedChecks = qualityChecks.filter((check) => check.done).length;
  const message =
    errors.prompt?.message ||
    errors.roleFamily?.message ||
    errors.collection?.message ||
    errors.expectedDurationMinutes?.message ||
    errors.axisIds?.message ||
    errors.levels?.message ||
    errors.difficulty?.message ||
    errors.anchor1?.message ||
    errors.anchor3?.message ||
    errors.anchor5?.message ||
    (mutation.isError ? mutation.error.message : "") ||
    "";

  const submitLabel =
    mode === "edit"
      ? mutation.isPending
        ? "Saving question..."
        : "Save question"
      : mode === "duplicate"
        ? mutation.isPending
          ? "Creating duplicate..."
          : "Add duplicate"
        : mutation.isPending
          ? "Adding question..."
          : "Add to bank";

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (values.axisIds.length === 0) {
          setError("axisIds", { message: "Select at least one competency tag." });
          return;
        }

        if (values.levels.length === 0) {
          setError("levels", { message: "Select at least one level." });
          return;
        }

        if (values.difficulty < 1 || values.difficulty > 5) {
          setError("difficulty", { message: "Choose a difficulty." });
          return;
        }

        mutation.mutate(values, {
          onSuccess: () => {
            router.replace(cancelHref);
          },
        });
      })}
      className={styles.formWrap}
    >
      <div className={styles.formMain}>
        <ComposerSection
          title="The question"
          description="Write it the way you'd ask it. Aim for a single clear prompt. Follow-ups and anchors come below."
        >
          <div className={styles.field}>
            <textarea
              rows={5}
              aria-label="Question"
              className={styles.textarea}
              placeholder="e.g. Tell me about a time you disagreed with your manager and stayed."
              {...register("prompt", { required: "Question text is required." })}
            />
            <div className={styles.help} style={{ color: promptLengthColor(prompt.length) }}>
              {prompt.length} characters · we recommend 80-200 for the main prompt.
            </div>
          </div>

          <div className={styles.grid2} style={{ marginTop: 14 }}>
            <Field label="Role family">
              <input
                aria-label="Role family"
                className={styles.input}
                {...register("roleFamily", { required: "Role family is required." })}
              />
            </Field>

            <Field label="Expected duration" optional="in minutes">
              <input
                type="number"
                min={5}
                step={5}
                aria-label="Expected duration"
                className={styles.input}
                {...register("expectedDurationMinutes", {
                  required: "Expected duration is required.",
                  valueAsNumber: true,
                  min: { value: 5, message: "Duration should be at least 5 minutes." },
                })}
              />
            </Field>
          </div>

          <div className={styles.grid2} style={{ marginTop: 14 }}>
            <Field label="Collection">
              <input
                aria-label="Collection"
                className={styles.input}
                {...register("collection", { required: "Collection is required." })}
              />
            </Field>
            <div />
          </div>
        </ComposerSection>

        <ComposerSection
          title="Competency tags"
          description="What does this question actually evaluate? Tags drive coverage analysis, so be specific."
        >
          <div className={styles.tagPicker}>
            {axes.map((axis) => {
              const active = selectedAxes.includes(axis.id);
              return (
                <button
                  key={axis.id}
                  type="button"
                  onClick={() => {
                    clearErrors("axisIds");
                    setValue(
                      "axisIds",
                      active
                        ? selectedAxes.filter((axisId) => axisId !== axis.id)
                        : [...selectedAxes, axis.id],
                      { shouldDirty: true },
                    );
                  }}
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                >
                  {normalizeAxisLabel(axis.name)}
                </button>
              );
            })}
          </div>
          <div className={styles.help}>
            Tip: questions tagged with 1-2 axes usually calibrate more cleanly than broad catch-all prompts.
          </div>
        </ComposerSection>

        <ComposerSection
          title="Reference companies"
          description="Tag companies whose interview style or archetype this question mirrors. These tags are optional and help the bank stay searchable."
        >
          <div className={styles.tagPicker}>
            {companies.map((company) => {
              const active = selectedCompanies.includes(company.id);
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() =>
                    setValue(
                      "companyIds",
                      active
                        ? selectedCompanies.filter((companyId) => companyId !== company.id)
                        : [...selectedCompanies, company.id],
                      { shouldDirty: true },
                    )
                  }
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                >
                  {company.name}
                </button>
              );
            })}
          </div>
          <p className={styles.help}>
            Tagging is optional. Use it when a question clearly matches a company’s style, domain,
            or calibration reference.
          </p>
        </ComposerSection>

        <ComposerSection
          title="Level & difficulty"
          description="Which levels is this calibrated for, and how hard is it?"
        >
          <div className={styles.grid2}>
            <Field label="Levels" optional="multi-select">
              <div className={styles.levelRow}>
                {levelOptions.map((level) => {
                  const active = selectedLevels.includes(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={active}
                      className={`${styles.levelButton} ${active ? styles.levelButtonActive : ""}`}
                      onClick={() => {
                        clearErrors("levels");
                        setValue(
                          "levels",
                          active
                            ? selectedLevels.filter((item) => item !== level)
                            : [...selectedLevels, level],
                          { shouldDirty: true },
                        );
                      }}
                    >
                      {levelButtonLabel(level)}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Difficulty">
              <div className={styles.diffRow}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = difficulty === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      className={`${styles.diffButton} ${active ? styles.diffButtonActive : ""}`}
                      onClick={() => {
                        clearErrors("difficulty");
                        setValue("difficulty", value, { shouldDirty: true });
                      }}
                    >
                      {value}
                    </button>
                  );
                })}
                <span className={styles.diffLabel}>
                  {difficulty ? difficultyLabel(difficulty) : "— select one —"}
                </span>
              </div>
            </Field>
          </div>
        </ComposerSection>

        <ComposerSection
          title="Why this question"
          description="Leave a short note for future interviewers. What signal are you trying to pull out of the answer?"
        >
          <textarea
            rows={4}
            aria-label="Why this question"
            className={styles.textarea}
            placeholder="e.g. Tests how candidates navigate principled disagreement vs. compliance."
            {...register("rationale")}
          />
        </ComposerSection>

        <ComposerSection
          title="Calibration anchors"
          description="Describe what a 1, 3, and 5 look like. Make them concrete enough that a new interviewer could score from them."
        >
          {[
            { key: "anchor1", label: "1", badgeClass: styles.badge1 },
            { key: "anchor3", label: "3", badgeClass: styles.badge3 },
            { key: "anchor5", label: "5", badgeClass: styles.badge5 },
          ].map((anchor) => (
            <div key={anchor.key} className={styles.anchorRow}>
              <div className={`${styles.anchorBadge} ${anchor.badgeClass}`}>{anchor.label}</div>
              <textarea
                rows={3}
                aria-label={`Anchor ${anchor.label}`}
                className={styles.textarea}
                placeholder={`A ${anchor.label} looks like...`}
                {...register(anchor.key as "anchor1" | "anchor3" | "anchor5", {
                  required: `Anchor ${anchor.label} is required.`,
                })}
              />
            </div>
          ))}
        </ComposerSection>

        <ComposerSection
          title="Suggested follow-ups"
          description="Optional probes interviewers can use if the initial answer is thin or they want to test depth."
        >
          <div className={styles.followUps}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.followUpItem}>
                <input
                  aria-label={`Follow-up ${index + 1}`}
                  className={styles.input}
                  placeholder="A follow-up probe..."
                  {...register(`followUps.${index}.value` as const)}
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.followUpAdd}
              onClick={() => append({ value: "" })}
            >
              + Add follow-up
            </button>
          </div>
        </ComposerSection>
      </div>

      <aside className={styles.previewPanel}>
        <div className={styles.previewCard}>
          <p className={styles.previewHeading}>Live preview</p>
          <p className={`${styles.previewQuestion} ${prompt.trim() ? "" : styles.previewEmpty}`}>
            {prompt.trim() || "Your question will appear here..."}
          </p>
          <div className={styles.previewMeta}>
            {selectedAxes.length > 0 ? (
              selectedAxes.map((axisId) => {
                const axis = axes.find((item) => item.id === axisId);
                const tone = axisTone(axis?.name ?? axisId);
                return (
                  <span
                    key={axisId}
                    className={`${styles.pill} ${
                      tone === "moss"
                        ? styles.pillMoss
                        : tone === "terra"
                          ? styles.pillTerra
                          : styles.pillLeaf
                    }`}
                  >
                    {normalizeAxisLabel(axis?.name ?? axisId)}
                  </span>
                );
              })
            ) : (
              <span className={`${styles.pill} ${styles.pillNeutral}`}>no tags yet</span>
            )}
          </div>
          <PreviewRow label="Role" value={selectedRoleFamily || "—"} />
          <PreviewRow
            label="Companies"
            value={
              selectedCompanies.length
                ? selectedCompanies
                    .map((companyId) => companies.find((company) => company.id === companyId)?.name ?? companyId)
                    .join(", ")
                : "—"
            }
          />
          <PreviewRow
            label="Levels"
            value={selectedLevels.length ? displayLevels(selectedLevels) : "—"}
          />
          <PreviewRow label="Difficulty" value={difficulty ? difficultyLabel(difficulty) : "—"} />
          <PreviewRow label="Duration" value={`${duration || 20}m`} />
          <PreviewRow label="Collection" value={selectedCollection || "—"} />
          <PreviewRow label="Rationale" value={rationale.trim() ? "Included" : "—"} />
        </div>

        <div className={styles.checklist}>
          <p className={styles.previewHeading}>Quality checklist</p>
          <div className={styles.checklistList}>
            {qualityChecks.map((check) => (
              <div
                key={check.label}
                className={`${styles.checklistItem} ${check.done ? styles.checklistDone : ""}`}
              >
                <span className={styles.checklistDot}>{check.done ? "✓" : ""}</span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.previewCard} style={{ marginTop: 14 }}>
          <p
            className={styles.inlineStatus}
            style={{
              color:
                completedChecks === qualityChecks.length ? "var(--moss)" : "var(--muted)",
            }}
          >
            {completedChecks < qualityChecks.length
              ? `${completedChecks} / ${qualityChecks.length} checks complete.`
              : "All checks passed. This question is ready for the bank."}
          </p>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {submitLabel}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => router.push(cancelHref)}
            >
              Cancel
            </button>
            {message ? <p className={`${styles.inlineStatus} ${styles.statusError}`}>{message}</p> : null}
          </div>
        </div>
      </aside>
    </form>
  );
}

function ComposerSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.formSection}>
      <h2 className={styles.formHeading}>{title}</h2>
      <p className={styles.formSub}>{description}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {optional ? <span className={styles.optional}>{optional}</span> : null}
      </span>
      {children}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.previewRow}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function buildTitle(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return "Untitled question";
  }

  const sentence = trimmed.split(/[.?!]/)[0]?.trim() || trimmed;
  return sentence.length > 64 ? `${sentence.slice(0, 61).trim()}...` : sentence;
}

function pickPrimaryLevel(levels: RoleLevel[]) {
  return [...levels].sort(
    (left, right) => levelOptions.indexOf(right) - levelOptions.indexOf(left),
  )[0] ?? "senior";
}

function displayLevel(level: RoleLevel) {
  if (level === "junior") return "L3";
  if (level === "mid") return "L4";
  if (level === "senior") return "L5";
  if (level === "staff") return "L6+";
  return "L6+";
}

function levelButtonLabel(level: RoleLevel) {
  if (level === "staff") return "L6+ IC";
  if (level === "manager") return "L6+ Mgr";
  return displayLevel(level);
}

function displayLevels(levels: RoleLevel[]) {
  return Array.from(new Set(levels.map(displayLevel))).join(" · ");
}

function difficultyLabel(difficulty: number) {
  if (difficulty === 1) return "Easy";
  if (difficulty === 2) return "Light";
  if (difficulty === 3) return "Medium";
  if (difficulty === 4) return "Hard";
  return "Stretch";
}

function promptLengthColor(length: number) {
  if ((length > 0 && length < 40) || length > 240) {
    return "#a4571f";
  }
  return "var(--muted)";
}

function normalizeAxisLabel(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function axisTone(label: string): "moss" | "terra" | "leaf" {
  const lower = label.toLowerCase();
  if (lower.includes("coding") || lower.includes("design") || lower.includes("debug")) {
    return "moss";
  }
  if (lower.includes("ownership") || lower.includes("leadership") || lower.includes("judgment")) {
    return "terra";
  }
  return "leaf";
}
