import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

async function getDashboardData() {
  const supabase = createSupabaseServiceClient();

  const [pendingApplications, activeMembers, publishedPosts, recentApplications] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("membership_status", "active"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    pendingApplicationsCount: pendingApplications.count ?? 0,
    activeMembersCount: activeMembers.count ?? 0,
    publishedPostsCount: publishedPosts.count ?? 0,
    recentApplications: recentApplications.data ?? [],
  };
}

export default async function AdminDashboardPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const dashboard = await getDashboardData();
  const cards = [
    {
      label: "Pending applications",
      value: dashboard.pendingApplicationsCount,
    },
    {
      label: "Active members",
      value: dashboard.activeMembersCount,
    },
    {
      label: "Published posts",
      value: dashboard.publishedPostsCount,
    },
  ];

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Club admin overview
        </h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-forest-900/60">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-forest-900">
              {card.value}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-forest-900">
          Recent applications
        </h2>
        {dashboard.recentApplications.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Applicant</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {application.full_name}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/68">
                      {formatDateTime(application.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-forest-900/70">
            No applications have been submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
