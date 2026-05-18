import { PageHeader, WorkspacePage } from "@/components/ui";
import CompanyAdminPanel from "@/features/companies/components/company-admin-panel";
import { getCompanies } from "@/lib/mvp/store";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Reference catalog"
        title="Company tags and logos"
        description="Build the shared company catalog that questions can tag against. Logos upload to Supabase storage when it is configured, and the question bank uses the catalog for filtering and display."
      />
      <CompanyAdminPanel companies={companies} />
    </WorkspacePage>
  );
}
