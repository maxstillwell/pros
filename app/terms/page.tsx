import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

const termsSections = [
  {
    title: "1. Acceptance of these terms",
    body: [
      "By using this website, submitting an application, attending a PROS activity, paying a membership fee or communicating with PROS, you agree to follow these Terms, any society rules, activity directions, safety briefings, committee decisions and applicable laws.",
      "These Terms apply to members, applicants, first-time guests, sponsors, website visitors and anyone participating in or assisting with PROS activities.",
    ],
  },
  {
    title: "2. Member-only association",
    body: [
      "PROS is a private, member-only outdoor society. Membership is required before a person may participate in society activities, events, member communications or any activity arranged by PROS, unless the committee has approved a one-time guest attendance under the guest rule below.",
      "Membership is not automatic. Applications are reviewed by the committee. PROS may accept, decline, defer, suspend or cancel membership at its discretion, acting consistently with society rules and reasonable governance standards.",
    ],
  },
  {
    title: "3. First-time guest attendance",
    body: [
      "A non-member may attend one activity only if they are nominated by a current member and approved by the committee before the activity. Approval may be refused or withdrawn at any time.",
      "A guest must sign any required acknowledgements, follow all safety directions, meet any age, licence, permit, insurance, land access or activity-specific requirements and remain under the supervision or responsibility arrangements set by PROS.",
      "Guest attendance does not create membership, an ongoing right to attend, or any right to participate in shooting, hunting or other regulated activities. After one approved guest attendance, the person must apply for membership before attending further PROS activities.",
    ],
  },
  {
    title: "4. Outdoor activity risk",
    body: [
      "Outdoor activities carry inherent risks. These may include uneven ground, weather, heat, cold, water, fire, animals, insects, vehicles, tools, camping equipment, remote locations, limited communications, medical delay, slips, falls, impact injuries, property damage, serious injury or death.",
      "You participate voluntarily and must make your own assessment of your fitness, skills, equipment, experience and legal eligibility. You must tell PROS before an activity if you have any condition, restriction or concern that may affect your safe participation.",
    ],
  },
  {
    title: "5. Shooting, hunting and regulated activities",
    body: [
      "Where an activity involves firearms, hunting, bows, crossbows, knives, traps, target shooting, private land access, range attendance or any regulated equipment or activity, every participant is personally responsible for complying with all applicable laws, licences, permits, storage, transport, landowner permissions, range rules and lawful directions.",
      "PROS does not grant firearm, hunting or land access rights. PROS does not authorise anyone to possess, carry, transport, store, use or handle firearms or other regulated equipment unless that person is legally entitled and specifically authorised for the relevant activity.",
      "No person may participate while impaired by alcohol, drugs, fatigue, illness or any condition that creates unacceptable risk. Unsafe, unlawful, reckless, disrespectful or unethical conduct may result in immediate removal, suspension, cancellation of membership and notification to relevant authorities where appropriate.",
    ],
  },
  {
    title: "6. Safety directions and conduct",
    body: [
      "Members and guests must follow committee directions, activity coordinator directions, landowner requirements, safety briefings, range rules, hunting ethics, conservation requirements and all society conduct standards.",
      "Participants must respect land, wildlife, cultural heritage, neighbouring properties, other participants and the public. Harassment, discrimination, intimidation, illegal activity, unsafe firearm handling, poaching, trespass, property damage or bringing PROS into disrepute is not acceptable.",
    ],
  },
  {
    title: "7. Waiver, release and indemnity",
    body: [
      "To the maximum extent permitted by law, you acknowledge and accept the risks of participating in PROS activities and release PROS, its committee, officers, volunteers, members, coordinators, sponsors and landowners from liability for loss, damage, injury, illness or death arising from your participation, except to the extent caused by conduct that cannot lawfully be excluded.",
      "You agree to indemnify PROS and its committee, officers, volunteers, members, coordinators, sponsors and landowners against claims, losses, costs or liabilities arising from your breach of these Terms, unlawful conduct, unsafe conduct, negligence, failure to follow directions, misuse of equipment, breach of land access conditions or breach of any licence, permit or law.",
      "Nothing in these Terms excludes, restricts or modifies any consumer guarantee, statutory right or liability that cannot be excluded under Australian law.",
    ],
  },
  {
    title: "8. Payments, refunds and membership status",
    body: [
      "Approved applicants may receive a membership fee payment link. Payment does not guarantee membership unless the committee has approved the application and the member register has been activated.",
      "Membership fees, event fees, sponsor payments, refunds, cancellations and transfers are handled according to PROS rules, committee decisions and any written terms given for the relevant payment. PROS may refuse or reverse payments connected with declined, suspended or cancelled membership.",
    ],
  },
  {
    title: "9. Insurance and personal property",
    body: [
      "PROS may hold insurance, but insurance may not cover every person, activity, risk, item or claim. You are responsible for your own personal insurance, medical cover, travel arrangements, licences, equipment and property.",
      "You are responsible for keeping your own equipment safe, lawful, suitable, secure and in good condition. PROS is not responsible for lost, stolen or damaged personal property except where liability cannot lawfully be excluded.",
    ],
  },
  {
    title: "10. Website information",
    body: [
      "Website content is general information only. It is not legal, firearms, hunting, safety, medical, land access, financial or professional advice. You must make your own enquiries and obtain appropriate advice, licences, permits, training and permissions before participating in any activity.",
      "PROS may change website content, membership processes, activities, fees, sponsor listings and public information at any time.",
    ],
  },
  {
    title: "11. Sponsors and third-party links",
    body: [
      "Sponsor profiles, links and acknowledgements are provided for information and recognition. PROS does not automatically endorse every product, service, claim, price or external website linked from sponsor or third-party content.",
      "You deal with sponsors and third parties at your own discretion and subject to their own terms and policies.",
    ],
  },
  {
    title: "12. Privacy and records",
    body: [
      "Personal information is handled under the PROS Privacy Policy. Activity attendance, application outcomes, incident records, payment status, membership status, licence confirmations and committee notes may be recorded for governance, safety, insurance and legal purposes.",
    ],
  },
  {
    title: "13. Changes and governing law",
    body: [
      "PROS may update these Terms as the society, website, activities or legal requirements change. The latest version will be published on this page.",
      "These Terms are intended to operate under applicable Australian law. Activities are also subject to the laws, regulations and lawful directions that apply in the state, territory, land, range or venue where the activity occurs.",
    ],
  },
];

export default function TermsPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-clay">
            Terms and waiver
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Terms, waiver and activity disclaimer.
          </h1>
          <p className="mt-3 text-sm text-forest-900/58">
            Last updated: 5 June 2026
          </p>
          <p className="mt-6 text-lg leading-8 text-forest-900/74">
            PROS is a private member-only outdoor society. These terms are
            written to make membership, guest attendance, shooting, hunting,
            safety and lawful participation expectations clear.
          </p>

          <div className="mt-10 grid gap-5">
            {termsSections.map((section) => (
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

          <div className="mt-8 rounded-md border border-forest-900/10 bg-forest-50 p-6 text-base leading-7 text-forest-900/74">
            <p className="font-semibold text-forest-900">
              Membership and activity participation
            </p>
            <p className="mt-3">
              If you want to attend PROS activities after a committee-approved
              first guest attendance, apply for membership first.
            </p>
            <Link
              href="/apply"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Apply for Membership
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
