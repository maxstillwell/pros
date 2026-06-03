"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  value: string;
};

export function CopyLinkButton({ value }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-forest-900/20 px-4 py-2 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
