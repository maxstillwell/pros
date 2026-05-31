import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export default function ApplyPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">
            Membership application
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-forest-900">
            Application form coming in this first build.
          </h1>
          <p className="mt-4 text-base leading-7 text-forest-900/72">
            This page will be replaced with the validated Supabase-backed form
            in the application form step.
          </p>
          <Link
            href="/membership"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50"
          >
            Review membership process
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
