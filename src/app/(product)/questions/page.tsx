import QuestionBankBrowser from "@/features/question-bank/components/question-bank-browser";
import { getQuestionBankWorkspace } from "@/lib/mvp/store";

export default async function QuestionsPage() {
  const workspace = await getQuestionBankWorkspace();

  return (
    <QuestionBankBrowser
      scope="global"
      questions={workspace.questions}
      axes={workspace.axes}
      companies={workspace.companies}
      stages={workspace.stages}
      newQuestionHref="/questions/new"
      editBaseHref="/questions"
      breadcrumbs={[
        { label: "Workspace", href: "/roles" },
        { label: "Question bank" },
      ]}
    />
  );
}
