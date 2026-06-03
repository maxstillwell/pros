import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-forest-900/10 bg-forest-900 text-stone">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold">Prime Range Outdoor Society Inc.</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone/75">
            A private outdoor society for members who value responsible recreation,
            safety, community, and respect for the outdoors.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-stone/75">
          <Link href="/membership" className="hover:text-white">
            Membership
          </Link>
          <Link href="/apply" className="hover:text-white">
            Apply
          </Link>
          <Link href="/news" className="hover:text-white">
            News
          </Link>
          <Link href="/sponsors" className="hover:text-white">
            Sponsors
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm text-stone/75">
          <Link href="/sponsorship" className="hover:text-white">
            Become a Sponsor
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/login" className="hover:text-white">
            Member login
          </Link>
        </div>
      </div>
    </footer>
  );
}
