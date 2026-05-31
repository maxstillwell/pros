import { SiteShell } from "@/components/layout/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-clay">About PROS</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            A private outdoor community with simple, responsible standards.
          </h1>
          <p className="mt-6 text-lg leading-8 text-forest-900/74">
            Prime Range Outdoor Society Inc. exists for members who value
            responsible recreation, safety, community, and respect for the
            outdoors. The club is private, practical, and focused on clear
            communication.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Mission",
                body: "Support a safe, respectful outdoor society with clear member expectations.",
              },
              {
                title: "Values",
                body: "Responsibility, care for place, good judgement, and community-minded conduct.",
              },
              {
                title: "Focus",
                body: "A maintainable club website that makes applications, news, and admin work simpler.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-md border border-forest-900/10 bg-white p-6"
              >
                <h2 className="text-xl font-semibold text-forest-900">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-forest-900/70">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
