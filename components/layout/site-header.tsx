import Link from "next/link";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/membership", label: "Membership" },
  { href: "/sponsorship", label: "Sponsorship" },
  { href: "/news", label: "News" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-stone/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-base font-semibold text-forest-900"
          aria-label="Prime Range Outdoor Society Inc. home"
        >
          PROS
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-forest-900/80 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-forest-900">
              {item.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="rounded-md bg-forest-700 px-4 py-2 text-white transition hover:bg-forest-900"
          >
            Apply
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-forest-900/20 px-3 py-2 text-sm font-semibold text-forest-900">
            Menu
          </summary>
          <nav className="absolute right-0 mt-3 flex w-56 flex-col gap-1 rounded-md border border-forest-900/10 bg-stone p-2 text-sm font-medium text-forest-900 shadow-soft">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 hover:bg-forest-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="rounded-md bg-forest-700 px-3 py-2 text-white hover:bg-forest-900"
            >
              Apply for Membership
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
