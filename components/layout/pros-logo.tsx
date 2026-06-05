import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type ProsLogoProps = {
  className?: string;
  href?: string;
  invert?: boolean;
  label?: string;
  markClassName?: string;
  showSubtitle?: boolean;
  subtitle?: string;
};

export function ProsLogo({
  className,
  href,
  invert = false,
  label = "PROS",
  markClassName,
  showSubtitle = true,
  subtitle = "Prime Range Outdoor Society Inc.",
}: ProsLogoProps) {
  const content = (
    <>
      <span
        className={clsx(
          "relative block shrink-0 overflow-hidden rounded-full",
          markClassName ?? "h-11 w-11",
        )}
      >
        <Image
          src="/images/pros-badge.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="56px"
          className="object-contain"
        />
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={clsx(
            "block text-base font-semibold",
            invert ? "text-white" : "text-forest-900",
          )}
        >
          {label}
        </span>
        {showSubtitle ? (
          <span
            className={clsx(
              "mt-1 block text-xs",
              invert ? "text-stone/68" : "text-forest-900/62",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  const classes = clsx("inline-flex items-center gap-3", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={`${subtitle} home`}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
