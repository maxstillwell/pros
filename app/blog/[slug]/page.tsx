import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { formatDate } from "@/lib/format";
import { getPublicBlogPostBySlug } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-sm font-semibold text-clay hover:text-forest-900"
          >
            Back to Blog
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase text-clay">Blog</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-forest-900/58">
            By PROS Committee |{" "}
            {formatDate(post.published_at ?? post.created_at)}
          </p>
          {post.excerpt ? (
            <p className="mt-6 text-lg leading-8 text-forest-900/74">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-8 whitespace-pre-line border-t border-forest-900/10 pt-8 text-base leading-8 text-forest-900/78">
            {post.body ?? "This article does not have body content yet."}
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
