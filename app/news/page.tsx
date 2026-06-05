import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { formatDate } from "@/lib/format";
import { getPublicNewsPosts } from "@/lib/news";

export default async function NewsPage() {
  const posts = await getPublicNewsPosts();

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase text-clay">News</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Club news and public updates.
          </h1>
          <div className="mt-8 overflow-hidden rounded-md border border-forest-900/10 bg-forest-900 shadow-sm">
            <Image
              src="/images/pros-track-morning.jpg"
              alt="Morning track through Australian bushland"
              width={1600}
              height={900}
              unoptimized
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
          <div className="mt-10 grid gap-5">
            {posts.length ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-forest-900/58">
                    {formatDate(post.published_at ?? post.created_at)}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-forest-900">
                    <Link href={`/news/${post.slug}`} className="hover:text-clay">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 text-sm leading-6 text-forest-900/72">
                      {post.excerpt}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm leading-6 text-forest-900/70">
                  No public news has been published yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
