const statusClassName: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-900 border-yellow-200",
  pending_payment: "bg-yellow-50 text-yellow-900 border-yellow-200",
  approved: "bg-blue-50 text-blue-900 border-blue-200",
  active: "bg-forest-50 text-forest-900 border-forest-700/20",
  paid: "bg-forest-50 text-forest-900 border-forest-700/20",
  not_required: "bg-stone text-forest-900 border-forest-900/20",
  failed: "bg-red-50 text-red-900 border-red-200",
  refunded: "bg-blue-50 text-blue-900 border-blue-200",
  expired: "bg-stone text-forest-900 border-forest-900/20",
  cancelled: "bg-stone text-forest-900 border-forest-900/20",
  rejected: "bg-red-50 text-red-900 border-red-200",
  new: "bg-yellow-50 text-yellow-900 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-900 border-blue-200",
  resolved: "bg-forest-50 text-forest-900 border-forest-700/20",
  archived: "bg-stone text-forest-900 border-forest-900/20",
  draft: "bg-stone text-forest-900 border-forest-900/20",
  published: "bg-forest-50 text-forest-900 border-forest-700/20",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
        statusClassName[status] ?? "border-forest-900/20 bg-white text-forest-900"
      }`}
    >
      {label}
    </span>
  );
}
