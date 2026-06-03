import { redirect } from "next/navigation";

type SponsorRedirectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SponsorRedirectPage({
  params,
}: SponsorRedirectPageProps) {
  const { slug } = await params;
  redirect(`/sponsorship/${slug}`);
}
