import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { formatDate } from "@/lib/format";
import { getPublicNewsPostBySlug } from "@/lib/news";

type NewsPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = await getPublicNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm text-forest-900/58">
            {formatDate(post.published_at ?? post.created_at)}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 text-lg leading-8 text-forest-900/74">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-8 whitespace-pre-line border-t border-forest-900/10 pt-8 text-base leading-8 text-forest-900/78">
            {post.body ?? "This post does not have body content yet."}
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
