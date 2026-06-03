import { SiteShell } from "@/components/layout/site-shell";
import { ApplicationForm } from "@/components/forms/application-form";

type ApplyPageProps = {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
  }>;
};

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <ApplicationForm
            error={params.error === "1"}
            submitted={params.submitted === "1"}
          />
        </div>
      </main>
    </SiteShell>
  );
}
