import Link from "next/link";
import { notFound } from "next/navigation";
import CreateQuestionForm from "@/features/question-bank/components/create-question-form";
import QuestionComposerShell from "@/features/question-bank/components/question-composer-shell";
import { getQuestion, getQuestionBankWorkspace } from "@/lib/mvp/store";

export default async function GlobalEditQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const [workspace, question] = await Promise.all([
    getQuestionBankWorkspace(),
    getQuestion(questionId),
  ]);

  if (!question) {
    notFound();
  }

  return (
    <QuestionComposerShell
      title="Edit question"
      breadcrumbs={[
        { label: "Workspace", href: "/roles" },
        { label: "Question bank", href: "/questions" },
      ]}
      actions={
        <Link
          href="/questions"
          className="inline-flex items-center justify-center rounded-[7px] border px-[10px] py-[5px] text-[12.5px] font-semibold"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        >
          Cancel
        </Link>
      }
    >
      <CreateQuestionForm
        roleFamily={question.roleFamily || workspace.questions[0]?.roleFamily || "Engineering"}
        axes={workspace.axes}
        companies={workspace.companies}
        cancelHref="/questions"
        mode="edit"
        questionId={question.id}
        initialQuestion={question}
      />
    </QuestionComposerShell>
  );
}
