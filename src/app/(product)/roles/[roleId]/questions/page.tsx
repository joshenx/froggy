import { notFound } from "next/navigation";
import QuestionBankBrowser from "@/features/question-bank/components/question-bank-browser";
import { getQuestionBankWorkspace } from "@/lib/mvp/store";

export default async function RoleQuestionsPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  const workspace = await getQuestionBankWorkspace(roleId);

  if (!workspace) {
    notFound();
  }

  return (
    <QuestionBankBrowser
      scope="role"
      roleId={workspace.role.id}
      questions={workspace.questions}
      axes={workspace.axes}
      companies={workspace.companies}
      stages={workspace.stages}
      newQuestionHref={`/roles/${workspace.role.id}/questions/new`}
      editBaseHref={`/roles/${workspace.role.id}/questions`}
      contextLinks={[{ href: `/roles/${workspace.role.id}/flow`, label: "Loops" }]}
      breadcrumbs={[
        { label: "Roles", href: "/roles" },
        { label: workspace.role.name, href: `/roles/${workspace.role.id}/flow` },
        { label: "Question bank" },
      ]}
    />
  );
}
