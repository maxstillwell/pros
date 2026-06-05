import { SiteShell } from "@/components/layout/site-shell";

const sections = [
  {
    title: "1. Who this policy covers",
    body: [
      "This Privacy Policy explains how Prime Range Outdoor Society Inc. (PROS, we, us or our) handles personal information collected through this website, membership applications, contact tickets, sponsor enquiries, member administration and society communications.",
      "PROS is a private, member-based outdoor society. Our activities may include camping, fishing, hunting, fieldcraft, conservation, community events and other lawful outdoor activities. Because some activities may involve firearms, hunting, private land access, safety checks, emergency planning and legal compliance, we may need to collect information that is more detailed than an ordinary social club.",
    ],
  },
  {
    title: "2. Information we may collect",
    body: [
      "We may collect your name, contact details, address, date of birth, emergency contact, membership history, application answers, outdoor interests, committee notes, payment status, attendance records, contact form messages and club communication preferences.",
      "Where reasonably required for safety, insurance, legal compliance or committee review, we may ask to sight or record limited details of relevant licences, permits, training, declarations, medical or emergency information. This may include firearms licence status, hunting permits, land access permission, guardian consent for minors, or other information needed for a particular activity.",
      "We may also collect technical information from the website, such as IP address, browser type, device information, form submission metadata, cookies or similar data used for security, analytics, spam prevention and website operation.",
    ],
  },
  {
    title: "3. Why we collect it",
    body: [
      "We collect personal information to assess membership applications, manage the member register, process payments, communicate with applicants and members, organise activities, record attendance, handle incidents, answer enquiries, manage sponsors and operate the website.",
      "We may also use information to maintain safety standards, check eligibility for member-only activities, comply with laws and directions, support insurance or incident reporting, prevent misuse of the website and enforce society rules.",
    ],
  },
  {
    title: "4. Sensitive information and licences",
    body: [
      "Some information connected with outdoor activities, health, emergency contacts, firearms licensing, hunting permissions or safety declarations may be sensitive or high-risk personal information. We only ask for this information where it is reasonably needed for a PROS purpose.",
      "Do not upload or send copies of licences, permits, medical records or government identifiers unless PROS specifically asks for them. If we only need to confirm that a licence or permit exists, we may choose to sight it or record limited confirmation rather than keep a copy.",
    ],
  },
  {
    title: "5. Disclosure",
    body: [
      "We may disclose personal information to committee members, authorised administrators, activity coordinators, payment processors, email providers, website hosting and database providers, professional advisers, insurers, emergency services, regulators, law enforcement, landowners or range/event operators where reasonably necessary.",
      "We do not sell member or applicant information. Sponsor information that a sponsor approves for publication may be displayed on the website, including logo, website link, description and contact details.",
    ],
  },
  {
    title: "6. Website providers and overseas storage",
    body: [
      "The website may use third-party services such as hosting, database, email and payment providers. These providers may store or process information in Australia or overseas.",
      "Where practical, PROS will take reasonable steps to use reputable providers and limit access to personal information to what is required for website, payment, email and administration functions.",
    ],
  },
  {
    title: "7. Security and retention",
    body: [
      "We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access, modification or disclosure. Access to administration systems should be limited to authorised people who need it for PROS purposes.",
      "We keep information for as long as reasonably needed for membership administration, legal compliance, insurance, dispute handling, safety records, financial records and society governance. When information is no longer needed, we will take reasonable steps to delete, destroy or de-identify it.",
    ],
  },
  {
    title: "8. Access and correction",
    body: [
      "You may ask PROS to access or correct personal information we hold about you. We may need to confirm your identity before responding.",
      "We may refuse access in limited circumstances, for example where access would affect another person's privacy, reveal confidential committee deliberations, prejudice safety or legal processes, or where another lawful reason applies.",
    ],
  },
  {
    title: "9. Photos, video and club communications",
    body: [
      "PROS activities may involve photography or video for club records, member updates, newsletters, sponsor recognition or public website content. We will try to respect reasonable requests not to be photographed or published, especially for minors or sensitive activity contexts.",
      "Members and guests should not publish other participants' personal information, images, location details, private land details or activity details without permission.",
    ],
  },
  {
    title: "10. Complaints and data breaches",
    body: [
      "If you have a privacy concern, contact PROS through the website contact form and mark the topic as privacy. We will review the issue and respond within a reasonable time.",
      "If a data breach occurs, PROS will assess the incident and take reasonable steps to contain harm. Where the Privacy Act 1988 (Cth), the Australian Privacy Principles or the Notifiable Data Breaches scheme applies, PROS will handle notification obligations accordingly.",
    ],
  },
  {
    title: "11. Changes",
    body: [
      "PROS may update this Privacy Policy as the website, membership process, activities or legal requirements change. The latest version will be published on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-clay">Privacy</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Privacy Policy.
          </h1>
          <p className="mt-3 text-sm text-forest-900/58">
            Last updated: 5 June 2026
          </p>
          <p className="mt-6 text-lg leading-8 text-forest-900/74">
            PROS respects member, applicant, sponsor and visitor privacy. This
            policy is written for a private Australian outdoor society where
            safety, lawful participation and careful member administration
            matter.
          </p>

          <div className="mt-10 grid gap-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-forest-900">
                  {section.title}
                </h2>
                <div className="mt-4 grid gap-4 text-base leading-7 text-forest-900/74">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
