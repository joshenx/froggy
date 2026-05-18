"use client";

import "@xyflow/react/dist/style.css";

import { useMutation } from "@tanstack/react-query";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  Position,
} from "@xyflow/react";
import { useMemo, useState } from "react";
import { saveFlow } from "@/lib/mvp/client";
import AddStageForm from "./add-stage-form";

type FlowCanvasEditorProps = {
  roleId: string;
  flowId: string;
  roleName: string;
  stages: Array<{
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
    questions: Array<{ id: string; title: string; expectedDurationMinutes: number }>;
    axes: Array<{ id: string; name: string }>;
  }>;
};

type StageDraft = FlowCanvasEditorProps["stages"][number];

type StageNodeData = {
  title: string;
  durationMinutes: number;
  questionCount: number;
  axisCount: number;
  orderIndex: number;
};

const nodeTypes = {
  stage: StageNode,
};

export default function FlowCanvasEditor(props: FlowCanvasEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasEditorInner {...props} />
    </ReactFlowProvider>
  );
}

function FlowCanvasEditorInner({
  roleId,
  flowId,
  roleName,
  stages,
}: FlowCanvasEditorProps) {
  const [draftStages, setDraftStages] = useState<StageDraft[]>(stages);
  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id ?? "");

  const sortedStages = useMemo(
    () =>
      [...draftStages].sort((left, right) =>
        left.canvasX === right.canvasX ? left.canvasY - right.canvasY : left.canvasX - right.canvasX,
      ),
    [draftStages],
  );

  const nodes = useMemo<Node<StageNodeData>[]>(
    () =>
      sortedStages.map((stage, index) => ({
        id: stage.id,
        type: "stage",
        position: { x: stage.canvasX, y: stage.canvasY },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          title: stage.name,
          durationMinutes: stage.durationMinutes,
          questionCount: stage.questionIds.length,
          axisCount: stage.axisIds.length,
          orderIndex: index + 1,
        },
      })),
    [sortedStages],
  );

  const edges = useMemo<Edge[]>(
    () =>
      sortedStages.slice(0, -1).map((stage, index) => ({
        id: `edge-${stage.id}-${sortedStages[index + 1]?.id}`,
        source: stage.id,
        target: sortedStages[index + 1]?.id ?? stage.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--moss)",
        },
        style: {
          stroke: "var(--moss)",
          strokeWidth: 1.5,
        },
      })),
    [sortedStages],
  );

  const selectedStage =
    draftStages.find((stage) => stage.id === selectedStageId) ?? draftStages[0] ?? null;

  const saveMutation = useMutation({
    mutationFn: () =>
      saveFlow(roleId, {
        stages: sortedStages.map((stage, index) => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          durationMinutes: stage.durationMinutes,
          interviewerRole: stage.interviewerRole,
          scoringRules: stage.scoringRules,
          canvasX: stage.canvasX,
          canvasY: stage.canvasY,
          orderIndex: index + 1,
        })),
      }),
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section
        className="overflow-hidden rounded-[22px] border"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        <div
          className="flex items-center justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: "var(--line-soft)" }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
              Stage canvas
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Drag stage cards into their preferred order, then save the flow layout.
            </p>
          </div>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
            style={{ background: "var(--moss)", color: "var(--paper)" }}
          >
            {saveMutation.isPending ? "Saving flow..." : "Save flow"}
          </button>
        </div>

        <div style={{ height: 620 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            onNodeClick={(_, node) => setSelectedStageId(node.id)}
            onNodeDragStop={(_, node) => {
              setDraftStages((current) =>
                current.map((stage) =>
                  stage.id === node.id
                    ? { ...stage, canvasX: node.position.x, canvasY: node.position.y }
                    : stage,
                ),
              );
            }}
            defaultEdgeOptions={{
              type: "smoothstep",
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} size={1} color="rgba(45,95,63,0.12)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </section>

      <div className="grid gap-6">
        <section
          className="rounded-[22px] border p-6"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                Stage inspector
              </p>
              <h2 className="mt-2 text-[22px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {selectedStage?.name ?? `${roleName} flow`}
              </h2>
            </div>
            <p className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: "rgba(220,231,213,0.28)", color: "var(--moss)" }}>
              {flowId}
            </p>
          </div>

          {selectedStage ? (
            <div className="mt-5 grid gap-4">
              <Field label="Stage name">
                <input
                  value={selectedStage.name}
                  onChange={(event) =>
                    setDraftStages((current) =>
                      current.map((stage) =>
                        stage.id === selectedStage.id ? { ...stage, name: event.target.value } : stage,
                      ),
                    )
                  }
                  className="h-12 w-full rounded-2xl border px-4 outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  value={selectedStage.description ?? ""}
                  onChange={(event) =>
                    setDraftStages((current) =>
                      current.map((stage) =>
                        stage.id === selectedStage.id
                          ? { ...stage, description: event.target.value }
                          : stage,
                      ),
                    )
                  }
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={selectedStage.durationMinutes}
                    onChange={(event) =>
                      setDraftStages((current) =>
                        current.map((stage) =>
                          stage.id === selectedStage.id
                            ? { ...stage, durationMinutes: Number(event.target.value) || 15 }
                            : stage,
                        ),
                      )
                    }
                    className="h-12 w-full rounded-2xl border px-4 outline-none"
                    style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                  />
                </Field>
                <Field label="Interviewer role">
                  <input
                    value={selectedStage.interviewerRole ?? ""}
                    onChange={(event) =>
                      setDraftStages((current) =>
                        current.map((stage) =>
                          stage.id === selectedStage.id
                            ? { ...stage, interviewerRole: event.target.value }
                            : stage,
                        ),
                      )
                    }
                    className="h-12 w-full rounded-2xl border px-4 outline-none"
                    style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                  />
                </Field>
              </div>

              <Field label="Scoring rules">
                <textarea
                  rows={4}
                  value={selectedStage.scoringRules.join("\n")}
                  onChange={(event) =>
                    setDraftStages((current) =>
                      current.map((stage) =>
                        stage.id === selectedStage.id
                          ? {
                              ...stage,
                              scoringRules: event.target.value
                                .split("\n")
                                .map((rule) => rule.trim())
                                .filter(Boolean),
                            }
                          : stage,
                      ),
                    )
                  }
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <MiniCard label="Questions" value={String(selectedStage.questions.length)} />
                <MiniCard label="Axes" value={String(selectedStage.axes.length)} />
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  Attached questions
                </p>
                {selectedStage.questions.length ? (
                  selectedStage.questions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border px-4 py-3 text-sm"
                      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
                    >
                      <div className="font-semibold">{question.title}</div>
                      <div style={{ color: "var(--muted)" }}>{question.expectedDurationMinutes} minutes</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No questions attached yet. Use the question bank to add one.
                  </p>
                )}
              </div>

              {saveMutation.isError ? (
                <p className="text-sm font-medium text-red-700">{saveMutation.error.message}</p>
              ) : saveMutation.isSuccess ? (
                <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
                  Flow layout saved.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section
          className="rounded-[22px] border p-6"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <h2 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Add another stage
          </h2>
          <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
            New stages land on the canvas automatically and can be repositioned before saving.
          </p>
          <div className="mt-5">
            <AddStageForm roleId={roleId} />
          </div>
        </section>
      </div>
    </div>
  );
}

function StageNode({ id, data, selected }: NodeProps<Node<StageNodeData>>) {
  return (
    <div
      data-testid={`stage-node-${id}`}
      className="min-w-[240px] rounded-[18px] border px-4 py-4 shadow-sm"
      style={{
        borderColor: selected ? "var(--moss)" : "var(--line)",
        background: "var(--paper)",
        boxShadow: selected
          ? "0 0 0 2px color-mix(in oklab, var(--leaf) 35%, transparent)"
          : "0 8px 24px -22px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div className="flex items-center justify-between gap-4">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ background: "rgba(220,231,213,0.28)", color: "var(--moss)" }}
        >
          Stage {data.orderIndex}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {data.durationMinutes}m
        </span>
      </div>
      <p className="mt-3 text-[17px] font-semibold leading-tight">{data.title}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span>{data.questionCount} questions</span>
        <span>{data.axisCount} axes</span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
