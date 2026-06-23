import Image from "next/image";
import { SiteShell } from "@/components/layout/site-shell";
import { ApplicationForm } from "@/components/forms/application-form";
import { membershipPricing } from "@/lib/membership/pricing";

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
        <div className="mx-auto max-w-5xl">
          <section className="mb-10 grid gap-6 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_18rem] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                Before you apply
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-forest-900">
                Committee approval comes before payment.
              </h1>
              <p className="mt-4 text-sm leading-6 text-forest-900/72">
                Approved applicants receive a secure payment link for PROS
                Membership Application {membershipPricing.applicationFee} +
                First Year Annual Fee {membershipPricing.firstYearAnnualFee}.
                Member numbers are issued only after payment is confirmed.
              </p>
              <p className="mt-4 text-sm font-semibold leading-6 text-forest-900">
                For limited time only, new approved members who complete payment
                will receive a {membershipPricing.welcomeGiftName} as a welcome
                gift. Valued at {membershipPricing.welcomeGiftValue}.
              </p>
            </div>
            <Image
              src="/images/pros-aluminum-case.png"
              alt="PROS Designed Aluminum Hard Case welcome gift"
              width={1600}
              height={1024}
              unoptimized
              className="aspect-[16/10] w-full rounded-sm bg-forest-50 object-contain"
            />
          </section>

          <div className="mx-auto max-w-4xl">
            <ApplicationForm
              error={params.error === "1"}
              submitted={params.submitted === "1"}
            />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
