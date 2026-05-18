"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { submitInterviewScorecard } from "@/lib/mvp/client";
import type { InterviewGuide, Recommendation } from "@/lib/mvp/types";

type ScorecardFormProps = {
  sessionId: string;
  guide: InterviewGuide;
};

type ScorecardFormValues = {
  recommendation: Recommendation;
  confidence: number;
  overallNotes: string;
  axisScores: Array<{
    axisId: string;
    score: number;
    evidence: string;
  }>;
  questionNotes: Array<{
    questionId: string;
    notes: string;
  }>;
};

export default function ScorecardForm({ sessionId, guide }: ScorecardFormProps) {
  const router = useRouter();
  const locked = Boolean(guide.existingScorecard?.locked);
  const axisDefaults = guide.stage.axisIds.map((axisId) => {
    const existing = guide.existingAxisScores.find((score) => score.axisId === axisId);
    return {
      axisId,
      score: existing?.score ?? 3,
      evidence: existing?.evidence ?? "",
    };
  });
  const questionDefaults = guide.questions.map((question) => {
    const existing = guide.existingQuestionNotes.find(
      (note) => note.questionId === question.originalQuestionId,
    );
    return {
      questionId: question.originalQuestionId,
      notes: existing?.notes ?? "",
    };
  });

  const mutation = useMutation({
    mutationFn: (values: ScorecardFormValues) =>
      submitInterviewScorecard(sessionId, {
        recommendation: values.recommendation,
        confidence: values.confidence as 1 | 2 | 3 | 4 | 5,
        overallNotes: values.overallNotes,
        axisScores: values.axisScores.map((axisScore) => ({
          axisId: axisScore.axisId,
          score: axisScore.score as 1 | 2 | 3 | 4 | 5,
          evidence: axisScore.evidence,
        })),
        questionNotes: values.questionNotes,
      }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ScorecardFormValues>({
    defaultValues: {
      recommendation: guide.existingScorecard?.recommendation ?? "lean_yes",
      confidence: guide.existingScorecard?.confidence ?? 3,
      overallNotes: guide.existingScorecard?.overallNotes ?? "",
      axisScores: axisDefaults,
      questionNotes: questionDefaults,
    },
  });

  const message =
    errors.overallNotes?.message ||
    (mutation.isError ? mutation.error.message : "") ||
    "";

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: () => {
            router.refresh();
          },
        }),
      )}
      className="grid gap-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="recommendation">
            Recommendation
          </label>
          <select
            id="recommendation"
            disabled={locked}
            className="h-12 w-full rounded-2xl border px-4 outline-none disabled:opacity-70"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            {...register("recommendation")}
          >
            <option value="strong_no">Strong no</option>
            <option value="no">No</option>
            <option value="lean_no">Lean no</option>
            <option value="lean_yes">Lean yes</option>
            <option value="yes">Yes</option>
            <option value="strong_yes">Strong yes</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="confidence">
            Confidence
          </label>
          <select
            id="confidence"
            disabled={locked}
            className="h-12 w-full rounded-2xl border px-4 outline-none disabled:opacity-70"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            {...register("confidence", { valueAsNumber: true })}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {guide.stage.axisIds.map((axisId, index) => {
          const axis = guide.questions
            .flatMap((question) => question.rubricSnapshots)
            .find((rubric) => rubric.axisId === axisId);

          return (
            <div
              key={axisId}
              className="rounded-3xl border p-5"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div className="grid gap-4 lg:grid-cols-[200px_120px_1fr]">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {axis?.axisName ?? axisId}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    {axis?.score4 ?? "Score against the anchored rubric and capture evidence."}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor={`axis-score-${index}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    Score
                  </label>
                  <input type="hidden" {...register(`axisScores.${index}.axisId` as const)} />
                  <select
                    id={`axis-score-${index}`}
                    disabled={locked}
                    className="h-12 w-full rounded-2xl border px-4 outline-none disabled:opacity-70"
                    style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                    {...register(`axisScores.${index}.score` as const, { valueAsNumber: true })}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`axis-evidence-${index}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    Evidence
                  </label>
                  <textarea
                    id={`axis-evidence-${index}`}
                    rows={4}
                    disabled={locked}
                    className="w-full rounded-2xl border px-4 py-3 outline-none disabled:opacity-70"
                    style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                    {...register(`axisScores.${index}.evidence` as const, {
                      required: "Evidence is required for every axis score.",
                    })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4">
        {guide.questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-3xl border p-5"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <p className="text-sm font-semibold">{question.titleSnapshot}</p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              {question.promptSnapshot}
            </p>
            <input type="hidden" {...register(`questionNotes.${index}.questionId` as const)} />
            <label
              htmlFor={`question-note-${index}`}
              className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Question notes
            </label>
            <textarea
              id={`question-note-${index}`}
              rows={3}
              disabled={locked}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none disabled:opacity-70"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              {...register(`questionNotes.${index}.notes` as const)}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="overall-notes">
          Final summary
        </label>
        <textarea
          id="overall-notes"
          rows={5}
          disabled={locked}
          className="w-full rounded-3xl border px-4 py-3 outline-none disabled:opacity-70"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("overallNotes", {
            required: "A final summary is required.",
          })}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={mutation.isPending || locked}
          className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          style={{ background: "var(--moss)", color: "var(--paper)" }}
        >
          {locked ? "Feedback locked" : mutation.isPending ? "Submitting..." : "Submit scorecard"}
        </button>
        {message ? (
          <p className="text-sm font-medium text-red-700">{message}</p>
        ) : locked ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            This scorecard is locked and visible only as read-only evidence.
          </p>
        ) : mutation.isSuccess ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            Feedback submitted, locked, and queued for ATS write-back.
          </p>
        ) : null}
      </div>
    </form>
  );
}
