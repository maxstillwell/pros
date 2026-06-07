import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { formatDate } from "@/lib/format";
import { getPublicBlogPosts } from "@/lib/blog";

export default async function BlogPage() {
  const posts = await getPublicBlogPosts();
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">Blog</p>
              <h1 className="mt-3 text-4xl font-semibold text-forest-900">
                Field notes, society updates and outdoor articles.
              </h1>
              <p className="mt-5 text-base leading-7 text-forest-900/72">
                Read public articles from PROS covering society updates,
                outdoor education, fieldcraft, conservation, hunting, camping
                and member community.
              </p>
            </div>
            <div className="overflow-hidden rounded-md border border-forest-900/10 bg-forest-900 shadow-sm">
              <Image
                src="/images/pros-track-morning.jpg"
                alt="Morning track through Australian bushland"
                width={1600}
                height={900}
                unoptimized
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>

          {featuredPost ? (
            <article className="mt-12 grid gap-8 border-y border-forest-900/10 bg-white py-8 md:grid-cols-[0.75fr_1.25fr] md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Featured article
                </p>
                <p className="mt-3 text-sm text-forest-900/58">
                  {formatDate(featuredPost.published_at ?? featuredPost.created_at)}
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-forest-900">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="hover:text-clay"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>
                {featuredPost.excerpt ? (
                  <p className="mt-4 text-base leading-7 text-forest-900/72">
                    {featuredPost.excerpt}
                  </p>
                ) : null}
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="mt-5 inline-flex text-sm font-semibold text-clay hover:text-forest-900"
                >
                  Read More
                </Link>
              </div>
            </article>
          ) : null}

          <section className="mt-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Latest articles
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-forest-900">
                  From the PROS blog.
                </h2>
              </div>
            </div>

            {posts.length ? (
              <div className="mt-7 divide-y divide-forest-900/10 border-y border-forest-900/10 bg-white">
                {(featuredPost ? remainingPosts : posts).map((post) => (
                  <article
                    key={post.id}
                    className="grid gap-4 py-6 md:grid-cols-[11rem_1fr_auto] md:items-start"
                  >
                    <p className="text-sm text-forest-900/58">
                      {formatDate(post.published_at ?? post.created_at)}
                    </p>
                    <div>
                      <h3 className="text-2xl font-semibold text-forest-900">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-clay"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-3 text-sm leading-6 text-forest-900/72">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex text-sm font-semibold text-clay hover:text-forest-900"
                    >
                      Read More
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm leading-6 text-forest-900/70">
                  No public blog articles have been published yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
