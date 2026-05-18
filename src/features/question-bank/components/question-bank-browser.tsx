"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  attachQuestionToStages,
  importGlobalQuestions,
  importQuestions as importRoleQuestions,
} from "@/lib/mvp/client";
import type {
  Company,
  EvaluationAxis,
  Question,
  QuestionBankStageOption,
  RoleLevel,
} from "@/lib/mvp/types";
import styles from "./question-bank.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type QuestionBankBrowserProps = {
  scope: "global" | "role";
  questions: Question[];
  axes: EvaluationAxis[];
  companies: Company[];
  stages: QuestionBankStageOption[];
  newQuestionHref: string;
  editBaseHref: string;
  breadcrumbs: BreadcrumbItem[];
  contextLinks?: Array<{ href: string; label: string }>;
  roleId?: string;
};

type SortMode = "recent" | "used" | "signal";

const levelOrder: RoleLevel[] = ["junior", "mid", "senior", "staff", "manager"];

export default function QuestionBankBrowser({
  scope,
  questions,
  axes,
  companies,
  stages,
  newQuestionHref,
  editBaseHref,
  breadcrumbs,
  contextLinks = [],
  roleId,
}: QuestionBankBrowserProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRoleFamily, setSelectedRoleFamily] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [selectedQuestionId, setSelectedQuestionId] = useState(questions[0]?.id ?? "");
  const [toast, setToast] = useState<string | null>(null);
  const [attachPanelQuestionId, setAttachPanelQuestionId] = useState<string | null>(null);
  const [pendingStageIds, setPendingStageIds] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const importMutation = useMutation({
    mutationFn: (csvText: string) =>
      roleId
        ? importRoleQuestions(roleId, { csvText })
        : importGlobalQuestions({ csvText }),
    onSuccess: (result) => {
      setToast(
        result.failedCount > 0
          ? `Imported ${result.importedCount} question${result.importedCount === 1 ? "" : "s"} with ${result.failedCount} row issue${result.failedCount === 1 ? "" : "s"}.`
          : `Imported ${result.importedCount} question${result.importedCount === 1 ? "" : "s"} into the bank.`,
      );
      router.refresh();
    },
    onError: (error) => {
      setToast(error.message);
    },
  });

  const attachMutation = useMutation({
    mutationFn: async ({
      questionId,
      stageIds,
    }: {
      questionId: string;
      stageIds: string[];
    }) => {
      if (!questionId) {
        throw new Error("Choose a question before attaching it to a loop.");
      }

      return attachQuestionToStages(questionId, { stageIds });
    },
    onSuccess: (result) => {
      setToast(
        `Added question to ${result.attachedStageIds.length} stage${result.attachedStageIds.length === 1 ? "" : "s"}.`,
      );
      setAttachPanelQuestionId(null);
      setPendingStageIds([]);
      router.refresh();
    },
    onError: (error) => {
      setToast(error.message);
    },
  });

  const collections = useMemo(
    () => [
      { id: "all", label: "All questions", count: questions.length },
      ...Array.from(new Set(questions.map((question) => question.collection)))
        .sort()
        .map((collection) => ({
          id: collection,
          label: collection,
          count: questions.filter((question) => question.collection === collection).length,
        })),
    ],
    [questions],
  );

  const roleFamilies = useMemo(
    () => Array.from(new Set(questions.map((question) => question.roleFamily))).sort(),
    [questions],
  );

  const tagEntries = useMemo(
    () =>
      axes
        .map((axis) => ({
          id: axis.id,
          label: normalizeAxisLabel(axis.name),
          count: questions.filter((question) => question.axisIds.includes(axis.id)).length,
        }))
        .filter((tag) => tag.count > 0)
        .sort((left, right) => right.count - left.count),
    [axes, questions],
  );

  const filteredQuestions = useMemo(
    () =>
      questions
        .filter((question) => {
          const normalizedQuery = deferredQuery.trim().toLowerCase();
          const matchesQuery =
            !normalizedQuery ||
            [
              question.title,
              question.prompt,
              question.rationale,
              question.roleFamily,
              ...question.companyIds.map(
                (companyId) => companies.find((company) => company.id === companyId)?.name ?? companyId,
              ),
              ...question.followUps,
              ...question.expectedSignals,
              ...question.axisIds.map(
                (axisId) => axes.find((axis) => axis.id === axisId)?.name ?? axisId,
              ),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

          const matchesCollection =
            selectedCollection === "all" || question.collection === selectedCollection;
          const matchesTag = !selectedTag || question.axisIds.includes(selectedTag);
          const matchesRole =
            selectedRoleFamily === "all" || question.roleFamily === selectedRoleFamily;
          const matchesCompany =
            selectedCompanyId === "all" || question.companyIds.includes(selectedCompanyId);
          const matchesLevel =
            selectedLevel === "all" || question.levels.includes(selectedLevel as RoleLevel);
          const matchesDifficulty =
            selectedDifficulty === "all" || String(question.difficulty) === selectedDifficulty;

          return (
            matchesQuery &&
            matchesCollection &&
            matchesTag &&
            matchesRole &&
            matchesCompany &&
            matchesLevel &&
            matchesDifficulty
          );
        })
        .sort((left, right) => {
          if (sortMode === "used") {
            return right.usedLastQuarter - left.usedLastQuarter;
          }
          if (sortMode === "signal") {
            return right.signalScore - left.signalScore;
          }
          return right.createdAt.localeCompare(left.createdAt);
        }),
    [
      axes,
      companies,
      deferredQuery,
      questions,
      selectedCollection,
      selectedCompanyId,
      selectedDifficulty,
      selectedLevel,
      selectedRoleFamily,
      selectedTag,
      sortMode,
    ],
  );

  const selectedQuestion =
    filteredQuestions.find((question) => question.id === selectedQuestionId) ??
    filteredQuestions[0] ??
    null;
  const activeQuestionId = selectedQuestion?.id ?? "";
  const attachPanelOpen = attachPanelQuestionId === activeQuestionId;
  const selectedQuestionOrder = selectedQuestion
    ? filteredQuestions.findIndex((question) => question.id === selectedQuestion.id) + 1
    : 0;

  return (
    <div className={styles.main}>
      <div className={styles.topbar}>
        <div className={styles.crumb}>
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className={styles.crumbItem}>
              {index > 0 ? <span>&rsaquo;</span> : null}
              {index === breadcrumbs.length - 1 ? (
                <h1 className={styles.crumbTitle}>{item.label}</h1>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </div>

        <div className={styles.topbarRight}>
          {contextLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.btn} ${styles.btnSoft} ${styles.btnSm}`}
            >
              {item.label}
            </Link>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              try {
                const csvText = await file.text();
                importMutation.mutate(csvText);
              } finally {
                input.value = "";
              }
            }}
          />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            Import CSV
          </button>
          <Link
            href={newQuestionHref}
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
          >
            <PlusIcon />
            Add question
          </Link>
        </div>
      </div>

      <div className={styles.bankLayout}>
        <aside className={styles.bankSidebar}>
          <section>
            <p className={styles.sectionTitle}>Collections</p>
            <div className={styles.sideList}>
              {collections.map((collection) => {
                const active = collection.id === selectedCollection;

                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setSelectedCollection(collection.id)}
                    className={`${styles.sideButton} ${active ? styles.sideActive : ""}`}
                  >
                    <span>{collection.label}</span>
                    <span className={styles.sideCount}>{collection.count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className={styles.sectionTitle}>Tags</p>
            <div className={styles.tagCloud}>
              {tagEntries.map((tag) => {
                const active = tag.id === selectedTag;

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTag(active ? null : tag.id)}
                    className={`${styles.tagButton} ${active ? styles.tagActive : ""}`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className={styles.sectionTitle}>Companies</p>
            <div className={styles.tagCloud}>
              <button
                type="button"
                onClick={() => setSelectedCompanyId("all")}
                className={`${styles.tagButton} ${selectedCompanyId === "all" ? styles.tagActive : ""}`}
              >
                All
              </button>
              {companies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() =>
                    setSelectedCompanyId((current) =>
                      current === company.id ? "all" : company.id,
                    )
                  }
                  className={`${styles.tagButton} ${selectedCompanyId === company.id ? styles.tagActive : ""}`}
                >
                  {company.name}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div className={styles.bankContent}>
          <div className={styles.filterBar}>
            <label className={styles.search} htmlFor="question-bank-search">
              <SearchIcon />
              <input
                id="question-bank-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search questions, tags, or competencies..."
                className={styles.searchInput}
              />
            </label>

            <select
              aria-label="Role family"
              className={styles.filterSelect}
              value={selectedRoleFamily}
              onChange={(event) => setSelectedRoleFamily(event.target.value)}
            >
              <option value="all">All roles</option>
              {roleFamilies.map((roleFamily) => (
                <option key={roleFamily} value={roleFamily}>
                  {roleFamily}
                </option>
              ))}
            </select>

            <select
              aria-label="Company"
              className={styles.filterSelect}
              value={selectedCompanyId}
              onChange={(event) => setSelectedCompanyId(event.target.value)}
            >
              <option value="all">All companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Level"
              className={styles.filterSelect}
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              <option value="all">All levels</option>
              {levelOrder.map((level) => (
                <option key={level} value={level}>
                  {filterLevelLabel(level)}
                </option>
              ))}
            </select>

            <select
              aria-label="Difficulty"
              className={styles.filterSelect}
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
            >
              <option value="all">Any difficulty</option>
              <option value="1">Easy (1)</option>
              <option value="2">2</option>
              <option value="3">Medium (3)</option>
              <option value="4">4</option>
              <option value="5">Hard (5)</option>
            </select>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnSoft} ${styles.btnSm}`}
              onClick={() => {
                setQuery("");
                setSelectedCollection("all");
                setSelectedTag(null);
                setSelectedRoleFamily("all");
                setSelectedCompanyId("all");
                setSelectedLevel("all");
                setSelectedDifficulty("all");
                setSortMode("recent");
              }}
            >
              Clear
            </button>
          </div>

          <div className={styles.resultsBar}>
            <p className={styles.resultsCount}>
              <strong>{filteredQuestions.length}</strong> questions · filtered from {questions.length}
            </p>
            <div className={styles.sortToggle}>
              {(["recent", "used", "signal"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`${styles.sortButton} ${sortMode === mode ? styles.sortActive : ""}`}
                >
                  {mode === "recent" ? "Recent" : mode === "used" ? "Most used" : "Best signal"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.listWrap}>
            <div className={styles.listColumn}>
              {filteredQuestions.length === 0 ? (
                <div className={styles.empty}>
                  No questions match. Try clearing a filter, or add a new question.
                </div>
              ) : (
                filteredQuestions.map((question) => {
                  const active = selectedQuestion?.id === question.id;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      data-testid={`question-row-${question.id}`}
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        setAttachPanelQuestionId(null);
                        setPendingStageIds([]);
                      }}
                      className={`${styles.questionRow} ${active ? styles.questionSelected : ""}`}
                    >
                      <span className={styles.grip}>
                        <GripIcon />
                      </span>
                      <div>
                        <div className={styles.questionPrompt}>{question.prompt}</div>
                        <div className={styles.questionMeta}>
                          {question.axisIds.map((axisId) => {
                            const axis = axes.find((item) => item.id === axisId);
                            return (
                              <QuestionPill
                                key={axisId}
                                tone={axisTone(axis?.name ?? axisId)}
                                label={normalizeAxisLabel(axis?.name ?? axisId)}
                              />
                            );
                          })}
                          <QuestionPill tone="leaf" label={displayLevels(question.levels)} />
                          {question.companyIds.slice(0, 2).map((companyId) => {
                            const company = companies.find((item) => item.id === companyId);
                            return company ? (
                              <QuestionPill
                                key={company.id}
                                tone="neutral"
                                label={company.name}
                              />
                            ) : null;
                          })}
                          <QuestionPill
                            tone="neutral"
                            label={`${question.expectedDurationMinutes}m`}
                            mono
                          />
                          <span className={`${styles.pill} ${styles.usagePill}`}>
                            used {question.usedLastQuarter}×
                          </span>
                        </div>
                      </div>
                      <div className={styles.questionAction}>
                        <DifficultyMeter difficulty={question.difficulty} />
                        <span className={`${styles.pill} ${styles.usagePill}`}>
                          signal {Math.round(question.signalScore * 100)}%
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <aside className={styles.detailPanel}>
              {selectedQuestion ? (
                <>
                  <div className={styles.detailHeader}>
                    <QuestionPill
                      tone="neutral"
                      label={`Q${selectedQuestionOrder || 1} · ${selectedQuestion.collection.toUpperCase()}`}
                      mono
                    />
                    <Link
                      href={`${editBaseHref}/${selectedQuestion.id}/edit`}
                      className={`${styles.btn} ${styles.btnSoft} ${styles.btnSm}`}
                      data-testid={`edit-question-${selectedQuestion.id}`}
                    >
                      Edit
                    </Link>
                  </div>

                  <h2 className={styles.detailTitle} data-testid="question-detail-title">
                    {selectedQuestion.prompt}
                  </h2>

                  <div className={styles.metaRow}>
                    {selectedQuestion.axisIds.map((axisId) => {
                      const axis = axes.find((item) => item.id === axisId);
                      return (
                        <QuestionPill
                          key={axisId}
                          tone={axisTone(axis?.name ?? axisId)}
                          label={normalizeAxisLabel(axis?.name ?? axisId)}
                        />
                      );
                    })}
                    <QuestionPill tone="leaf" label={displayLevels(selectedQuestion.levels)} />
                  </div>

                  {selectedQuestion.companyIds.length > 0 ? (
                    <>
                      <p className={styles.detailHeading}>Reference companies</p>
                      <div className={styles.attachedStages}>
                        {selectedQuestion.companyIds.map((companyId) => {
                          const company = companies.find((item) => item.id === companyId);
                          if (!company) {
                            return null;
                          }

                          return (
                            <span
                              key={company.id}
                              data-testid={`question-company-${company.id}`}
                              className={`${styles.pill} ${styles.pillNeutral}`}
                            >
                              {company.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={company.logoUrl}
                                  alt=""
                                  width={14}
                                  height={14}
                                  className={styles.companyLogo}
                                />
                              ) : null}
                              {company.name}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  <div className={styles.statStrip}>
                    <DetailStat
                      label="Duration"
                      value={`${selectedQuestion.expectedDurationMinutes}m`}
                    />
                    <DetailStat label="Used" value={`${selectedQuestion.usedLastQuarter}×`} />
                    <DetailStat
                      label="Signal"
                      value={`${Math.round(selectedQuestion.signalScore * 100)}%`}
                    />
                  </div>

                  <p className={styles.detailHeading}>Why this question</p>
                  <p className={styles.detailText}>
                    {selectedQuestion.rationale || "No rationale saved yet."}
                  </p>

                  <p className={styles.detailHeading}>Suggested follow-ups</p>
                  {selectedQuestion.followUps.length > 0 ? (
                    <ul className={styles.detailList}>
                      {selectedQuestion.followUps.map((followUp) => (
                        <li key={followUp}>{followUp}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.detailText}>No follow-ups saved yet.</p>
                  )}

                  <p className={styles.detailHeading}>Calibration anchors</p>
                  <ul className={styles.detailList}>
                    {selectedQuestion.anchors.map((anchor) => (
                      <li key={anchor}>{anchor}</li>
                    ))}
                  </ul>

                  <p className={styles.detailHeading}>Attached stages</p>
                  {selectedQuestion.stageIds.length > 0 ? (
                    <div className={styles.attachedStages}>
                      {selectedQuestion.stageIds.map((stageId) => {
                        const stage = stages.find((item) => item.id === stageId);
                        return (
                          <QuestionPill
                            key={stageId}
                            tone="neutral"
                            label={formatStageLabel(stage, scope)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.detailText}>
                      This question is in the bank but not attached to a loop stage yet.
                    </p>
                  )}

                  <div className={styles.detailActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} ${styles.detailButtonGrow}`}
                      onClick={() => {
                        if (attachPanelOpen) {
                          setAttachPanelQuestionId(null);
                          setPendingStageIds([]);
                          return;
                        }

                        setAttachPanelQuestionId(activeQuestionId);
                        setPendingStageIds([]);
                      }}
                    >
                      Add to loop
                    </button>
                    <Link
                      href={`${newQuestionHref}?duplicateQuestionId=${selectedQuestion.id}`}
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      data-testid={`duplicate-question-${selectedQuestion.id}`}
                    >
                      Duplicate
                    </Link>
                  </div>

                  {attachPanelOpen ? (
                    <div className={styles.attachPanel}>
                      <p className={styles.detailHeading}>Choose stages</p>
                      <div className={styles.stageChoices}>
                        {stages.map((stage) => {
                          const alreadyAttached = selectedQuestion.stageIds.includes(stage.id);
                          const checked = pendingStageIds.includes(stage.id);

                          return (
                            <label
                              key={stage.id}
                              className={`${styles.stageChoice} ${alreadyAttached ? styles.stageChoiceDisabled : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={alreadyAttached || checked}
                                disabled={alreadyAttached}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setPendingStageIds((current) => [...current, stage.id]);
                                  } else {
                                    setPendingStageIds((current) =>
                                      current.filter((item) => item !== stage.id),
                                    );
                                  }
                                }}
                              />
                              <span>
                                <span className={styles.stageChoiceTitle}>{stage.name}</span>
                                <span className={styles.stageChoiceMeta}>
                                  {formatStageMeta(stage, scope, alreadyAttached)}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {stages.every((stage) => selectedQuestion.stageIds.includes(stage.id)) ? (
                        <p className={styles.detailText}>
                          This question is already attached to every available stage.
                        </p>
                      ) : null}
                      <div className={styles.attachActions}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          disabled={pendingStageIds.length === 0 || attachMutation.isPending}
                          onClick={() =>
                            attachMutation.mutate({
                              questionId: activeQuestionId,
                              stageIds: pendingStageIds,
                            })
                          }
                        >
                          {attachMutation.isPending ? "Adding..." : "Save stages"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                          onClick={() => {
                            setAttachPanelQuestionId(null);
                            setPendingStageIds([]);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className={styles.empty}>Select a question.</div>
              )}

              {importMutation.isError || attachMutation.isError ? (
                <p className={`${styles.statusText} ${styles.statusError}`}>
                  {(attachMutation.error ?? importMutation.error)?.message}
                </p>
              ) : null}
            </aside>
          </div>
        </div>
      </div>

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

function QuestionPill({
  tone,
  label,
  mono = false,
}: {
  tone: "moss" | "terra" | "leaf" | "neutral";
  label: string;
  mono?: boolean;
}) {
  const toneClass =
    tone === "moss"
      ? styles.pillMoss
      : tone === "terra"
        ? styles.pillTerra
        : tone === "leaf"
          ? styles.pillLeaf
          : styles.pillNeutral;

  return (
    <span className={`${styles.pill} ${toneClass} ${mono ? styles.pillMono : ""}`}>
      {label}
    </span>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function DifficultyMeter({ difficulty }: { difficulty: number }) {
  const useTerra = difficulty >= 4;

  return (
    <span className={styles.diff} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`${styles.diffBar} ${
            index < difficulty
              ? useTerra
                ? styles.diffOnTerra
                : styles.diffOn
              : ""
          }`}
        />
      ))}
    </span>
  );
}

function displayLevel(level: RoleLevel) {
  if (level === "junior") return "L3";
  if (level === "mid") return "L4";
  if (level === "senior") return "L5";
  if (level === "staff") return "L6+";
  return "L6+";
}

function filterLevelLabel(level: RoleLevel) {
  if (level === "staff") return "L6+ IC";
  if (level === "manager") return "L6+ Manager";
  return displayLevel(level);
}

function displayLevels(levels: RoleLevel[]) {
  return Array.from(new Set(levels.map(displayLevel))).join(" · ");
}

function normalizeAxisLabel(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function axisTone(label: string): "moss" | "terra" | "leaf" {
  const normalized = label.toLowerCase();
  if (
    normalized.includes("coding") ||
    normalized.includes("design") ||
    normalized.includes("debug")
  ) {
    return "moss";
  }
  if (
    normalized.includes("leadership") ||
    normalized.includes("ownership") ||
    normalized.includes("judgment") ||
    normalized.includes("tradeoff")
  ) {
    return "terra";
  }
  return "leaf";
}

function formatStageLabel(
  stage: QuestionBankStageOption | undefined,
  scope: "global" | "role",
) {
  if (!stage) {
    return "Unknown stage";
  }

  return scope === "global" ? `${stage.name} · ${stage.roleName}` : stage.name;
}

function formatStageMeta(
  stage: QuestionBankStageOption,
  scope: "global" | "role",
  alreadyAttached: boolean,
) {
  const parts =
    scope === "global"
      ? [`${stage.roleName}`, stage.flowName, `${stage.durationMinutes}m`]
      : [`${stage.durationMinutes}m`];

  if (alreadyAttached) {
    parts.push("already attached");
  }

  return parts.join(" · ");
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--muted)" }}
    >
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

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="4" r="1.2" />
      <circle cx="10" cy="4" r="1.2" />
      <circle cx="6" cy="8" r="1.2" />
      <circle cx="10" cy="8" r="1.2" />
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="10" cy="12" r="1.2" />
    </svg>
  );
}
