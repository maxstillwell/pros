import Link from "next/link";

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function LinkButton({
  href,
  children,
  variant = "primary",
}: LinkButtonProps) {
  const className =
    variant === "primary"
      ? "bg-forest-700 text-white hover:bg-forest-900"
      : "border border-white/55 bg-white/10 text-white hover:bg-white/20";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${className}`}
    >
      {children}
    </Link>
  );
}
