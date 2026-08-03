"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, RefreshCw, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type EmailLogRow = {
  id: number;
  order_id: string | null;
  kind: string;
  recipient: string;
  subject: string | null;
  status: "sent" | "failed" | "skipped";
  provider_id: string | null;
  error: string | null;
  created_at: string;
};

const KIND_LABELS: Record<string, string> = {
  order_confirmation: "Order confirmation",
  order_recovery: "Order follow-up",
  cart_recovery: "Cart reminder",
};

const STATUS_STYLES: Record<string, { className: string; icon: React.ElementType }> = {
  sent: { className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  failed: { className: "bg-red-50 text-red-700", icon: XCircle },
  skipped: { className: "bg-gray-100 text-gray-600", icon: MinusCircle },
};

/**
 * What actually left the building.
 *
 * A NULL "sent at" on an order says nothing about why: the send may have
 * failed, been skipped because email isn't configured, or never been attempted.
 * This is the only place that tells them apart, which makes it the first place
 * to look when a customer says they got nothing.
 *
 * Read directly from Supabase — the table's policy already restricts SELECT to
 * admins, so no server route is needed to enforce anything.
 */
const EmailLogPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["email-log"],
    staleTime: 30 * 1000,
    queryFn: async (): Promise<EmailLogRow[]> => {
      const { data, error } = await supabase
        .from("email_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;
      return (data as EmailLogRow[]) || [];
    },
  });

  const rows = useMemo(() => {
    const all = data || [];
    if (statusFilter === "all") return all;
    return all.filter((row) => row.status === statusFilter);
  }, [data, statusFilter]);

  const counts = useMemo(() => {
    const all = data || [];
    return {
      sent: all.filter((r) => r.status === "sent").length,
      failed: all.filter((r) => r.status === "failed").length,
      skipped: all.filter((r) => r.status === "skipped").length,
    };
  }, [data]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Email Log"
        subtitle="Every send attempt and what came back from the mail provider."
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", `All (${(data || []).length})`],
              ["sent", `Sent (${counts.sent})`],
              ["failed", `Failed (${counts.failed})`],
              ["skipped", `Skipped (${counts.skipped})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="ms-auto rounded-xl"
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading…</div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-600">
            {(error as Error)?.message || "Couldn't load the log."}
            <div className="mt-2 text-xs text-gray-500">
              If this says permission denied, the email_log policy migration hasn&apos;t been run yet.
            </div>
          </div>
        ) : !rows.length ? (
          <div className="p-10 text-center text-sm text-gray-500">
            <Mail className="mx-auto mb-2 h-5 w-5 text-gray-300" />
            Nothing here yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const style = STATUS_STYLES[row.status] || STATUS_STYLES.skipped;
                  const StatusIcon = style.icon;
                  return (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0">
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-700">
                        {row.recipient}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {KIND_LABELS[row.kind] || row.kind}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${style.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {row.status}
                        </span>
                      </td>
                      <td className="max-w-[320px] px-6 py-4 text-xs text-gray-500">
                        {/* The error is why anyone opens this page. Shown in
                            full rather than truncated to a useless prefix. */}
                        {row.error ? (
                          <span className="text-red-600">{row.error}</span>
                        ) : (
                          <span className="block truncate" title={row.subject || ""}>
                            {row.subject}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmailLogPage;
