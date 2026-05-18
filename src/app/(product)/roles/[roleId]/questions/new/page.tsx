import Link from "next/link";
import { notFound } from "next/navigation";
import CreateQuestionForm from "@/features/question-bank/components/create-question-form";
import QuestionComposerShell from "@/features/question-bank/components/question-composer-shell";
import { getQuestion, getQuestionBankWorkspace } from "@/lib/mvp/store";

export default async function NewQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ duplicateQuestionId?: string }>;
}) {
  const { roleId } = await params;
  const { duplicateQuestionId } = await searchParams;
  const workspace = await getQuestionBankWorkspace(roleId);

  if (!workspace) {
    notFound();
  }

  const duplicateQuestion = duplicateQuestionId
    ? await getQuestion(roleId, duplicateQuestionId)
    : null;

  if (duplicateQuestionId && !duplicateQuestion) {
    notFound();
  }

  return (
    <QuestionComposerShell
      title={duplicateQuestion ? "Duplicate question" : "New question"}
      breadcrumbs={[
        { label: "Roles", href: "/roles" },
        { label: workspace.role.name, href: `/roles/${workspace.role.id}/flow` },
        { label: "Question bank", href: `/roles/${workspace.role.id}/questions` },
      ]}
      actions={
        <Link
          href={`/roles/${workspace.role.id}/questions`}
          className="inline-flex items-center justify-center rounded-[7px] border px-[10px] py-[5px] text-[12.5px] font-semibold"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        >
          Cancel
        </Link>
      }
    >
      <CreateQuestionForm
        roleId={workspace.role.id}
        roleFamily={workspace.role.name}
        axes={workspace.axes}
        companies={workspace.companies}
        cancelHref={`/roles/${workspace.role.id}/questions`}
        mode={duplicateQuestion ? "duplicate" : "create"}
        initialQuestion={duplicateQuestion}
      />
    </QuestionComposerShell>
  );
}
