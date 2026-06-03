import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/logout", label: "Logout" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-forest-50 text-forest-900">
      <div className="grid min-h-screen md:grid-cols-[16rem_1fr]">
        <aside className="border-b border-forest-900/10 bg-forest-900 px-5 py-5 text-stone md:border-b-0 md:border-r">
          <Link href="/" className="block text-lg font-semibold">
            PROS Admin
          </Link>
          <nav className="mt-8 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-stone/78 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-stone/70">
            <Link href="/" className="hover:text-white">
              Public site
            </Link>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="border-b border-forest-900/10 bg-white px-5 py-4">
            <p className="text-sm font-semibold uppercase text-clay">
              Prime Range Outdoor Society Inc.
            </p>
          </header>
          <main className="px-5 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
