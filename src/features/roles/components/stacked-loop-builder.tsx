"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { saveFlow } from "@/lib/mvp/client";
import type { FlowStatus } from "@/lib/mvp/types";
import styles from "./loop-builder-stacked.module.css";

type AxisOption = {
  id: string;
  name: string;
};

type QuestionSummary = {
  id: string;
  title: string;
  prompt: string;
  axisIds: string[];
  expectedDurationMinutes: number;
  usedLastQuarter: number;
  signalScore: number;
};

type StageSummary = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  interviewerRole?: string;
  scoringRules: string[];
  questionIds: string[];
  axisIds: string[];
  orderIndex: number;
  canvasX: number;
  canvasY: number;
};

type StackedLoopBuilderProps = {
  roleId: string;
  roleName: string;
  flowName: string;
  flowVersion: number;
  flowStatus: FlowStatus;
  targetAxisIds: string[];
  axes: AxisOption[];
  stages: StageSummary[];
  questionBank: QuestionSummary[];
  builderHref: string;
  canvasHref: string;
  questionBankHref: string;
  newQuestionHref: string;
};

type DraftStage = StageSummary;

type Notice = {
  tone: "success" | "error";
  message: string;
};

type DragState =
  | { kind: "stage"; stageId: string }
  | { kind: "question"; stageId: string; questionId: string }
  | null;

type CoverageSummary = {
  axisQuestionCounts: Map<string, number>;
  coveredAxisIds: string[];
  gapAxisIds: string[];
  totalQuestionCount: number;
};

const DEFAULT_NEW_STAGE_DURATION = 45;

export default function StackedLoopBuilder({
  roleId,
  roleName,
  flowName: initialFlowName,
  flowVersion,
  flowStatus,
  targetAxisIds: initialTargetAxisIds,
  axes,
  stages,
  questionBank,
  builderHref,
  canvasHref,
  questionBankHref,
  newQuestionHref,
}: StackedLoopBuilderProps) {
  const [flowName, setFlowName] = useState(initialFlowName);
  const [currentStatus, setCurrentStatus] = useState<FlowStatus>(flowStatus);
  const [targetAxisIds, setTargetAxisIds] = useState<string[]>(initialTargetAxisIds);
  const [draftStages, setDraftStages] = useState<DraftStage[]>(() =>
    stages.map((stage) => ({ ...stage, questionIds: [...stage.questionIds] })),
  );
  const [activeStageId, setActiveStageId] = useState(stages[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"coverage" | "library">("coverage");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [dragState, setDragState] = useState<DragState>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const axisMap = useMemo(
    () => new Map(axes.map((axis) => [axis.id, axis])),
    [axes],
  );
  const questionMap = useMemo(
    () => new Map(questionBank.map((question) => [question.id, question])),
    [questionBank],
  );

  const questionIdsInLoop = useMemo(
    () => new Set(draftStages.flatMap((stage) => stage.questionIds)),
    [draftStages],
  );

  const stageFilterAxisIds = useMemo(() => {
    const availableAxisIds = new Set(questionBank.flatMap((question) => question.axisIds));
    return axes.filter((axis) => availableAxisIds.has(axis.id)).map((axis) => axis.id);
  }, [axes, questionBank]);

  const coverage = useMemo<CoverageSummary>(() => {
    const axisQuestionCounts = new Map<string, number>();
    let totalQuestionCount = 0;

    draftStages.forEach((stage) => {
      totalQuestionCount += stage.questionIds.length;
      stage.questionIds.forEach((questionId) => {
        const question = questionMap.get(questionId);
        if (!question) {
          return;
        }

        question.axisIds.forEach((axisId) => {
          axisQuestionCounts.set(axisId, (axisQuestionCounts.get(axisId) ?? 0) + 1);
        });
      });
    });

    const uniqueTargetAxisIds = Array.from(new Set(targetAxisIds.filter(Boolean)));
    const coveredAxisIds = uniqueTargetAxisIds.filter(
      (axisId) => (axisQuestionCounts.get(axisId) ?? 0) > 0,
    );
    const gapAxisIds = uniqueTargetAxisIds.filter(
      (axisId) => (axisQuestionCounts.get(axisId) ?? 0) === 0,
    );

    return {
      axisQuestionCounts,
      coveredAxisIds,
      gapAxisIds,
      totalQuestionCount,
    };
  }, [draftStages, questionMap, targetAxisIds]);

  const coveragePercent = targetAxisIds.length
    ? Math.round((coverage.coveredAxisIds.length / targetAxisIds.length) * 100)
    : 0;
  const totalLoopMinutes = draftStages.reduce(
    (sum, stage) => sum + stage.durationMinutes,
    0,
  );

  const orderedCoverageAxisIds = useMemo(() => {
    const seen = new Set<string>();
    const ordered = [...targetAxisIds, ...Array.from(coverage.axisQuestionCounts.keys())];
    return ordered.filter((axisId) => {
      if (seen.has(axisId)) {
        return false;
      }
      seen.add(axisId);
      return true;
    });
  }, [coverage.axisQuestionCounts, targetAxisIds]);

  const suggestedQuestions = useMemo(() => {
    if (coverage.gapAxisIds.length === 0) {
      return [];
    }

    return questionBank
      .filter((question) => !questionIdsInLoop.has(question.id))
      .map((question) => {
        const matchedGapAxisIds = question.axisIds.filter((axisId) =>
          coverage.gapAxisIds.includes(axisId),
        );

        return {
          question,
          matchedGapAxisIds,
          score:
            matchedGapAxisIds.length * 10000 +
            Math.round(question.signalScore * 1000) +
            question.usedLastQuarter,
        };
      })
      .filter(({ matchedGapAxisIds }) => matchedGapAxisIds.length > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);
  }, [coverage.gapAxisIds, questionBank, questionIdsInLoop]);

  const filteredLibraryQuestions = useMemo(() => {
    const normalizedQuery = libraryQuery.trim().toLowerCase();

    return questionBank.filter((question) => {
      const matchesFilter =
        libraryFilter === "all" || question.axisIds.includes(libraryFilter);
      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const axisNames = question.axisIds
        .map((axisId) => axisMap.get(axisId)?.name ?? axisId)
        .join(" ");

      return (
        question.title.toLowerCase().includes(normalizedQuery) ||
        question.prompt.toLowerCase().includes(normalizedQuery) ||
        axisNames.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [axisMap, libraryFilter, libraryQuery, questionBank]);

  const saveMutation = useMutation({
    mutationFn: async (nextStatus: FlowStatus) =>
      saveFlow(roleId, {
        flowName,
        status: nextStatus,
        targetAxisIds,
        stages: draftStages.map((stage, index) => ({
          id: stage.id.startsWith("temp-stage-") ? stage.id : stage.id,
          name: stage.name,
          description: stage.description,
          durationMinutes: stage.durationMinutes,
          interviewerRole: stage.interviewerRole,
          scoringRules: stage.scoringRules,
          questionIds: stage.questionIds,
          canvasX: stage.canvasX,
          canvasY: stage.canvasY,
          orderIndex: index + 1,
        })),
      }),
    onSuccess: (result, nextStatus) => {
      const stageIdMap = result.stageIdMap ?? {};

      if (Object.keys(stageIdMap).length > 0) {
        setDraftStages((current) =>
          current.map((stage, index) => ({
            ...stage,
            id: stageIdMap[stage.id] ?? stage.id,
            orderIndex: index + 1,
          })),
        );
        setActiveStageId((current) => stageIdMap[current] ?? current);
      } else {
        setDraftStages((current) =>
          current.map((stage, index) => ({ ...stage, orderIndex: index + 1 })),
        );
      }

      setCurrentStatus(result.status ?? nextStatus);
      setNotice({
        tone: "success",
        message:
          nextStatus === "active"
            ? currentStatus === "active"
              ? "Published loop updated."
              : "Loop published and ready for ATS mappings."
            : "Draft saved.",
      });
    },
    onError: (error) => {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not save the loop.",
      });
    },
  });

  const activeStage =
    draftStages.find((stage) => stage.id === activeStageId) ?? draftStages[0] ?? null;

  function setStageQuestionIds(
    stageId: string,
    update: (questionIds: string[]) => string[],
  ) {
    setDraftStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? { ...stage, questionIds: update([...stage.questionIds]) }
          : stage,
      ),
    );
  }

  function handleStageDrop(targetStageId: string) {
    if (!dragState) {
      return;
    }

    if (dragState.kind === "stage") {
      if (dragState.stageId === targetStageId) {
        return;
      }

      setDraftStages((current) => reorderStageList(current, dragState.stageId, targetStageId));
      setDragState(null);
      return;
    }

    if (dragState.stageId === targetStageId) {
      return;
    }

    setDraftStages((current) =>
      moveQuestionBetweenStages(
        current,
        dragState.stageId,
        targetStageId,
        dragState.questionId,
      ),
    );
    setActiveStageId(targetStageId);
    setDragState(null);
  }

  function handleQuestionDrop(targetStageId: string, targetQuestionId: string) {
    if (!dragState || dragState.kind !== "question") {
      return;
    }

    setDraftStages((current) =>
      moveQuestionBeforeTarget(
        current,
        dragState.stageId,
        targetStageId,
        dragState.questionId,
        targetQuestionId,
      ),
    );
    setActiveStageId(targetStageId);
    setDragState(null);
  }

  function handleAddStage() {
    const randomId = globalThis.crypto?.randomUUID?.();
    const newStageId = `temp-stage-${randomId ? randomId.slice(0, 8) : Date.now()}`;
    setDraftStages((current) => [
      ...current,
      {
        id: newStageId,
        name: "New stage",
        description: "New stage awaiting questions, rubrics, and mappings.",
        durationMinutes: DEFAULT_NEW_STAGE_DURATION,
        interviewerRole: "Interviewer",
        scoringRules: ["Every score must include evidence before submission."],
        questionIds: [],
        axisIds: [],
        orderIndex: current.length + 1,
        canvasX: 40 + current.length * 320,
        canvasY: 70 + Math.floor(current.length / 3) * 220,
      },
    ]);
    setActiveStageId(newStageId);
  }

  function handleRemoveStage(stageId: string) {
    if (draftStages.length === 1) {
      setNotice({
        tone: "error",
        message: "Keep at least one stage in the loop.",
      });
      return;
    }

    setDraftStages((current) => current.filter((stage) => stage.id !== stageId));
    if (activeStageId === stageId) {
      const fallback = draftStages.find((stage) => stage.id !== stageId);
      setActiveStageId(fallback?.id ?? "");
    }
  }

  function handleAddQuestion(questionId: string) {
    const stageId = activeStage?.id ?? draftStages[0]?.id;
    if (!stageId || questionIdsInLoop.has(questionId)) {
      return;
    }

    setStageQuestionIds(stageId, (questionIds) => [...questionIds, questionId]);
    const stageName = draftStages.find((stage) => stage.id === stageId)?.name ?? "stage";
    setNotice({
      tone: "success",
      message: `Added question to ${stageName}.`,
    });
  }

  function handleRemoveQuestion(stageId: string, questionId: string) {
    setStageQuestionIds(stageId, (questionIds) =>
      questionIds.filter((currentQuestionId) => currentQuestionId !== questionId),
    );
  }

  function toggleTargetAxis(axisId: string) {
    setTargetAxisIds((current) =>
      current.includes(axisId)
        ? current.filter((candidate) => candidate !== axisId)
        : [...current, axisId],
    );
  }

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.crumb}>
          <span>Loops</span>
          <span className={styles.crumbSeparator}>›</span>
          <h1 className={styles.crumbTitle}>{flowName || roleName}</h1>
          <span
            className={`${styles.statusPill} ${
              currentStatus === "active" ? styles.statusActive : styles.statusDraft
            }`}
            data-testid="flow-status-pill"
          >
            {currentStatus}
          </span>
        </div>
        <div className={styles.topbarActions}>
          <div className={styles.viewSwitch}>
            <Link href={builderHref} className={`${styles.viewButton} ${styles.viewButtonActive}`}>
              Builder
            </Link>
            <Link href={canvasHref} className={styles.viewButton}>
              Canvas
            </Link>
          </div>
          <Link href={questionBankHref} className={styles.ghostButton}>
            Question bank
          </Link>
          <button
            type="button"
            className={styles.softButton}
            onClick={() => saveMutation.mutate(currentStatus === "active" ? "active" : "draft")}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? "Saving..."
              : currentStatus === "active"
                ? "Save changes"
                : "Save draft"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => saveMutation.mutate("active")}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Publishing..." : "Publish loop"}
          </button>
        </div>
      </div>

      <div className={styles.builder}>
        <section className={styles.mainColumn}>
          <div className={styles.loopHead}>
            <div className={styles.loopTitleRow}>
              <input
                value={flowName}
                onChange={(event) => setFlowName(event.target.value)}
                className={styles.loopTitle}
                aria-label="Loop name"
                data-testid="loop-flow-name"
              />
              <span className={styles.rolePill}>{roleName}</span>
              <span className={styles.versionPill}>v{flowVersion}</span>
            </div>

            <div className={styles.headerGrid}>
              <div>
                <label className={styles.metaLabel}>Target evaluation axes</label>
                <div className={styles.axisChipList}>
                  {axes.map((axis) => {
                    const isOn = targetAxisIds.includes(axis.id);
                    const isGap =
                      isOn && (coverage.axisQuestionCounts.get(axis.id) ?? 0) === 0;

                    return (
                      <button
                        key={axis.id}
                        type="button"
                        onClick={() => toggleTargetAxis(axis.id)}
                        className={`${styles.axisChip} ${isOn ? styles.axisChipOn : ""} ${
                          isGap ? styles.axisChipGap : ""
                        }`}
                        data-testid={`target-axis-${axis.id}`}
                      >
                        {axis.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={styles.metaLabel}>Loop stats</label>
                <div className={styles.statRow}>
                  <Stat label="Questions" value={coverage.totalQuestionCount} />
                  <Stat label="Stages" value={draftStages.length} />
                  <Stat label="Total time" value={`${totalLoopMinutes}m`} />
                </div>
              </div>

              <div>
                <label className={styles.metaLabel}>Coverage</label>
                <div className={styles.statRow}>
                  <Stat
                    label="Target axes hit"
                    value={`${coverage.coveredAxisIds.length}/${targetAxisIds.length || 0}`}
                    tone={coverage.gapAxisIds.length === 0 ? "success" : "warning"}
                  />
                  <Stat
                    label="Gaps"
                    value={coverage.gapAxisIds.length}
                    tone={coverage.gapAxisIds.length === 0 ? "success" : "warning"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stageList}>
            {draftStages.map((stage, index) => {
              const stageQuestions = stage.questionIds
                .map((questionId) => questionMap.get(questionId))
                .filter((question): question is QuestionSummary => Boolean(question));

              return (
                <section
                  key={stage.id}
                  className={`${styles.stageCard} ${
                    activeStage?.id === stage.id ? styles.stageCardActive : ""
                  }`}
                  onClick={() => setActiveStageId(stage.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleStageDrop(stage.id);
                  }}
                  data-testid={`stage-card-${stage.id}`}
                >
                  <div className={styles.stageHead}>
                    <span className={styles.stageNumber}>{index + 1}</span>
                    <button
                      type="button"
                      className={styles.dragHandle}
                      draggable
                      aria-label={`Reorder ${stage.name}`}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", stage.id);
                        setDragState({ kind: "stage", stageId: stage.id });
                      }}
                      onDragEnd={() => setDragState(null)}
                    >
                      <GripIcon />
                    </button>
                    <input
                      value={stage.name}
                      onChange={(event) =>
                        setDraftStages((current) =>
                          current.map((candidate) =>
                            candidate.id === stage.id
                              ? { ...candidate, name: event.target.value }
                              : candidate,
                          ),
                        )
                      }
                      className={styles.stageName}
                      aria-label={`Stage name ${index + 1}`}
                    />
                    <div className={styles.stageMeta}>
                      <span>
                        {stage.questionIds.length} question{stage.questionIds.length === 1 ? "" : "s"}
                      </span>
                      <span className={styles.metaDot} />
                      <span>{stage.durationMinutes}m</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${stage.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveStage(stage.id);
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  <div className={styles.questionList}>
                    {stageQuestions.length > 0 ? (
                      stageQuestions.map((question) => (
                        <div
                          key={question.id}
                          className={styles.questionRow}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleQuestionDrop(stage.id, question.id);
                          }}
                          data-testid={`stage-question-${stage.id}-${question.id}`}
                        >
                          <button
                            type="button"
                            className={styles.questionGrip}
                            draggable
                            aria-label={`Reorder ${question.title}`}
                            onDragStart={(event) => {
                              event.stopPropagation();
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", question.id);
                              setDragState({
                                kind: "question",
                                stageId: stage.id,
                                questionId: question.id,
                              });
                            }}
                            onDragEnd={() => setDragState(null)}
                          >
                            <GripIcon />
                          </button>
                          <div className={styles.questionBody}>
                            <div className={styles.questionText}>{question.prompt}</div>
                            <div className={styles.questionTags}>
                              {question.axisIds.slice(0, 3).map((axisId) => (
                                <span
                                  key={axisId}
                                  className={styles.questionTag}
                                  style={pillStyleForAxis(axisId)}
                                >
                                  {formatAxisLabel(axisMap.get(axisId)?.name ?? axisId)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={styles.questionActions}>
                            <span className={styles.questionDuration}>
                              {question.expectedDurationMinutes}m
                            </span>
                            <button
                              type="button"
                              className={styles.inlineIconButton}
                              aria-label={`Remove ${question.title}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveQuestion(stage.id, question.id);
                              }}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.stageEmpty}>
                        Click a question in the Library tab to add it here.
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <button type="button" className={styles.addStageButton} onClick={handleAddStage}>
            <PlusIcon />
            Add stage
          </button>
        </section>

        <aside className={styles.rail}>
          <div className={styles.railTabs}>
            <button
              type="button"
              className={`${styles.railTab} ${
                activeTab === "coverage" ? styles.railTabActive : ""
              } ${coverage.gapAxisIds.length > 0 ? styles.railTabWarn : ""}`}
              onClick={() => setActiveTab("coverage")}
            >
              Coverage
              <span className={styles.railBadge}>
                {coverage.coveredAxisIds.length}/{targetAxisIds.length || 0}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.railTab} ${
                activeTab === "library" ? styles.railTabActive : ""
              }`}
              onClick={() => setActiveTab("library")}
            >
              Library
              <span className={styles.railBadge}>{filteredLibraryQuestions.length}</span>
            </button>
          </div>

          <div className={styles.railBody}>
            {activeTab === "coverage" ? (
              <div>
                <div className={styles.coverageHead}>
                  <div className={styles.coverageScore}>
                    <div
                      className={`${styles.coverageBig} ${
                        coverage.gapAxisIds.length > 0 ? styles.coverageBigWarn : ""
                      }`}
                    >
                      {coveragePercent}%
                    </div>
                    <div className={styles.coverageLabel}>target axes covered</div>
                  </div>
                  <div className={styles.coverageStrip}>
                    {targetAxisIds.length > 0 ? (
                      targetAxisIds.map((axisId) => {
                        const count = coverage.axisQuestionCounts.get(axisId) ?? 0;
                        const className =
                          count === 0
                            ? styles.coverageSegmentGap
                            : count === 1
                              ? styles.coverageSegmentWarn
                              : styles.coverageSegmentGood;

                        return <i key={axisId} className={className} />;
                      })
                    ) : (
                      <i className={styles.coverageSegmentGap} />
                    )}
                  </div>
                </div>

                <div className={styles.coverageAxisList}>
                  {orderedCoverageAxisIds.map((axisId) => {
                    const count = coverage.axisQuestionCounts.get(axisId) ?? 0;
                    const isTarget = targetAxisIds.includes(axisId);
                    const barWidth = Math.max(
                      count > 0 ? 10 : 6,
                      Math.min(100, count * 22),
                    );
                    const barClassName =
                      isTarget && count === 0
                        ? styles.coverageBarGap
                        : !isTarget && count >= 2
                          ? styles.coverageBarOver
                          : count === 1
                            ? styles.coverageBarWarn
                            : styles.coverageBarGood;

                    return (
                      <div
                        key={axisId}
                        className={`${styles.coverageAxisRow} ${
                          isTarget && count === 0 ? styles.coverageAxisGap : ""
                        }`}
                      >
                        <div className={styles.coverageAxisTop}>
                          <div className={styles.coverageAxisName}>
                            <span
                              className={styles.coverageAxisPip}
                              style={{ background: axisSwatch(axisId) }}
                            />
                            {axisMap.get(axisId)?.name ?? axisId}
                            {!isTarget ? (
                              <span className={styles.extraPill}>extra</span>
                            ) : null}
                          </div>
                          <div className={styles.coverageAxisCount}>
                            {count} question{count === 1 ? "" : "s"}
                          </div>
                        </div>
                        <div className={styles.coverageAxisBar}>
                          <i className={barClassName} style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`${styles.coverageCallout} ${
                    coverage.totalQuestionCount > 0 && coverage.gapAxisIds.length === 0
                      ? styles.coverageCalloutGood
                      : ""
                  }`}
                >
                  <span className={styles.calloutIcon}>
                    {coverage.totalQuestionCount > 0 && coverage.gapAxisIds.length === 0
                      ? "✓"
                      : "!"}
                  </span>
                  <div>
                    <strong>
                      {coverage.totalQuestionCount === 0
                        ? "Empty loop."
                        : coverage.gapAxisIds.length === 0
                          ? "Loop is holistic."
                          : `${coverage.gapAxisIds.length} uncovered target axis${
                              coverage.gapAxisIds.length === 1 ? "" : "es"
                            }.`}
                    </strong>
                    <div>
                      {coverage.totalQuestionCount === 0
                        ? "Add questions from the Library tab to start building coverage."
                        : coverage.gapAxisIds.length === 0
                          ? "Every target axis is tested by at least one tagged question. Ready to publish."
                          : coverage.gapAxisIds
                              .map((axisId) => axisMap.get(axisId)?.name ?? axisId)
                              .join(", ")}
                    </div>
                  </div>
                </div>

                {suggestedQuestions.length > 0 ? (
                  <div className={styles.suggestionSection}>
                    <h3 className={styles.sectionLabel}>Suggested questions to close gaps</h3>
                    <div className={styles.suggestionList}>
                      {suggestedQuestions.map(({ question, matchedGapAxisIds }) => (
                        <button
                          key={question.id}
                          type="button"
                          className={styles.suggestionRow}
                          onClick={() => handleAddQuestion(question.id)}
                        >
                          <div>
                            <div className={styles.suggestionText}>{question.prompt}</div>
                            <div className={styles.questionTags}>
                              {question.axisIds.slice(0, 3).map((axisId) => (
                                <span
                                  key={axisId}
                                  className={styles.questionTag}
                                  style={pillStyleForAxis(axisId)}
                                >
                                  {formatAxisLabel(axisMap.get(axisId)?.name ?? axisId)}
                                </span>
                              ))}
                              <span className={styles.closesPill}>
                                closes{" "}
                                {matchedGapAxisIds
                                  .map((axisId) => axisMap.get(axisId)?.name ?? axisId)
                                  .join(", ")}
                              </span>
                            </div>
                          </div>
                          <span className={styles.suggestionAdd}>
                            <PlusIcon />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <label className={styles.librarySearch}>
                  <SearchIcon />
                  <input
                    value={libraryQuery}
                    onChange={(event) => setLibraryQuery(event.target.value)}
                    placeholder="Search the question bank..."
                    aria-label="Search the question bank"
                  />
                </label>
                <div className={styles.libraryFilters}>
                  <button
                    type="button"
                    className={`${styles.libraryFilter} ${
                      libraryFilter === "all" ? styles.libraryFilterActive : ""
                    }`}
                    onClick={() => setLibraryFilter("all")}
                  >
                    All
                  </button>
                  {stageFilterAxisIds.map((axisId) => (
                    <button
                      key={axisId}
                      type="button"
                      className={`${styles.libraryFilter} ${
                        libraryFilter === axisId ? styles.libraryFilterActive : ""
                      }`}
                      onClick={() => setLibraryFilter(axisId)}
                    >
                      {formatAxisLabel(axisMap.get(axisId)?.name ?? axisId)}
                    </button>
                  ))}
                </div>

                <div className={styles.libraryList}>
                  {filteredLibraryQuestions.length > 0 ? (
                    filteredLibraryQuestions.map((question) => {
                      const inLoop = questionIdsInLoop.has(question.id);

                      return (
                        <button
                          key={question.id}
                          type="button"
                          className={`${styles.libraryRow} ${
                            inLoop ? styles.libraryRowDisabled : ""
                          }`}
                          onClick={() => handleAddQuestion(question.id)}
                          disabled={inLoop}
                          data-testid={`library-question-${question.id}`}
                        >
                          <div>
                            <div className={styles.libraryText}>{question.prompt}</div>
                            <div className={styles.questionTags}>
                              {question.axisIds.slice(0, 3).map((axisId) => (
                                <span
                                  key={axisId}
                                  className={styles.questionTag}
                                  style={pillStyleForAxis(axisId)}
                                >
                                  {formatAxisLabel(axisMap.get(axisId)?.name ?? axisId)}
                                </span>
                              ))}
                              <span className={styles.questionDuration}>
                                {question.expectedDurationMinutes}m
                              </span>
                            </div>
                          </div>
                          <span className={styles.libraryAddButton}>
                            {inLoop ? <CheckIcon /> : <PlusIcon />}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className={styles.libraryEmpty}>
                      No matching questions.{" "}
                      <Link href={newQuestionHref} className={styles.inlineLink}>
                        Add a new one
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {notice ? (
        <div
          className={`${styles.toast} ${
            notice.tone === "error" ? styles.toastError : styles.toastSuccess
          }`}
        >
          {notice.message}
        </div>
      ) : null}
    </>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className={styles.statCard}>
      <div
        className={`${styles.statValue} ${
          tone === "success"
            ? styles.statValueSuccess
            : tone === "warning"
              ? styles.statValueWarning
              : ""
        }`}
      >
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function reorderStageList(stages: DraftStage[], sourceStageId: string, targetStageId: string) {
  const sourceIndex = stages.findIndex((stage) => stage.id === sourceStageId);
  const targetIndex = stages.findIndex((stage) => stage.id === targetStageId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return stages;
  }

  const nextStages = [...stages];
  const [movedStage] = nextStages.splice(sourceIndex, 1);
  nextStages.splice(targetIndex, 0, movedStage);
  return nextStages.map((stage, index) => ({ ...stage, orderIndex: index + 1 }));
}

function moveQuestionBetweenStages(
  stages: DraftStage[],
  sourceStageId: string,
  targetStageId: string,
  questionId: string,
) {
  return stages.map((stage) => {
    if (stage.id === sourceStageId && stage.id === targetStageId) {
      return stage;
    }

    if (stage.id === sourceStageId) {
      return {
        ...stage,
        questionIds: stage.questionIds.filter((candidate) => candidate !== questionId),
      };
    }

    if (stage.id === targetStageId) {
      if (stage.questionIds.includes(questionId)) {
        return stage;
      }

      return {
        ...stage,
        questionIds: [...stage.questionIds, questionId],
      };
    }

    return stage;
  });
}

function moveQuestionBeforeTarget(
  stages: DraftStage[],
  sourceStageId: string,
  targetStageId: string,
  questionId: string,
  targetQuestionId: string,
) {
  const sourceStage = stages.find((stage) => stage.id === sourceStageId);
  const targetStage = stages.find((stage) => stage.id === targetStageId);
  if (!sourceStage || !targetStage) {
    return stages;
  }

  return stages.map((stage) => {
    if (stage.id === sourceStageId && stage.id === targetStageId) {
      const questionIds = [...stage.questionIds].filter((candidate) => candidate !== questionId);
      const targetIndex = questionIds.indexOf(targetQuestionId);
      if (targetIndex === -1) {
        questionIds.push(questionId);
      } else {
        questionIds.splice(targetIndex, 0, questionId);
      }

      return {
        ...stage,
        questionIds,
      };
    }

    if (stage.id === sourceStageId) {
      return {
        ...stage,
        questionIds: stage.questionIds.filter((candidate) => candidate !== questionId),
      };
    }

    if (stage.id === targetStageId) {
      const questionIds = [...stage.questionIds].filter((candidate) => candidate !== questionId);
      const targetIndex = questionIds.indexOf(targetQuestionId);
      if (targetIndex === -1) {
        questionIds.push(questionId);
      } else {
        questionIds.splice(targetIndex, 0, questionId);
      }

      return {
        ...stage,
        questionIds,
      };
    }

    return stage;
  });
}

function formatAxisLabel(value: string) {
  return value.toLowerCase();
}

function axisSwatch(axisId: string) {
  if (axisId.includes("communication") || axisId.includes("leadership")) {
    return "var(--terra)";
  }

  if (axisId.includes("product") || axisId.includes("ownership")) {
    return "var(--leaf)";
  }

  return "var(--moss)";
}

function pillStyleForAxis(axisId: string) {
  if (axisId.includes("communication") || axisId.includes("leadership")) {
    return {
      background: "rgba(232,152,94,0.18)",
      color: "#9a4d1d",
    };
  }

  if (axisId.includes("product") || axisId.includes("ownership")) {
    return {
      background: "rgba(127,176,105,0.2)",
      color: "var(--moss)",
    };
  }

  return {
    background: "rgba(45,95,63,0.14)",
    color: "var(--moss-deep)",
  };
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="4" r="1.1" fill="currentColor" />
      <circle cx="10" cy="4" r="1.1" fill="currentColor" />
      <circle cx="6" cy="8" r="1.1" fill="currentColor" />
      <circle cx="10" cy="8" r="1.1" fill="currentColor" />
      <circle cx="6" cy="12" r="1.1" fill="currentColor" />
      <circle cx="10" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
