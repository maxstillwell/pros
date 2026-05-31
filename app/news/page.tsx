import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { placeholderPosts } from "@/lib/site-content";

export default function NewsPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase text-clay">News</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Club news and public updates.
          </h1>
          <div className="mt-10 grid gap-5">
            {placeholderPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-forest-900/58">{post.publishedAt}</p>
                <h2 className="mt-2 text-2xl font-semibold text-forest-900">
                  <Link href={`/news/${post.slug}`} className="hover:text-clay">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-forest-900/72">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
