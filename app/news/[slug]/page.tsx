import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { placeholderPosts } from "@/lib/site-content";

type NewsPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return placeholderPosts.map((post) => ({ slug: post.slug }));
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = placeholderPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm text-forest-900/58">{post.publishedAt}</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-forest-900/74">
            {post.excerpt}
          </p>
          <div className="mt-8 border-t border-forest-900/10 pt-8 text-base leading-8 text-forest-900/78">
            <p>{post.body}</p>
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
