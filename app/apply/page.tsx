import { SiteShell } from "@/components/layout/site-shell";
import { ApplicationForm } from "@/components/forms/application-form";

export default function ApplyPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <ApplicationForm />
        </div>
      </main>
    </SiteShell>
  );
}
