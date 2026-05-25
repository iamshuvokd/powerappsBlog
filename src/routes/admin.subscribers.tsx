import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Check, Copy, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { deleteSubscriber, getSubscribers, type Subscriber } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({ meta: [{ title: "Subscribers - PowerApps.blog Admin" }] }),
  component: SubscribersPage,
});

function SubscribersPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [copied, setCopied] = useState(false);

  const query = useQuery({ queryKey: ["admin", "subscribers"], queryFn: getSubscribers });

  const remove = useMutation({
    mutationFn: (id: number) => deleteSubscriber(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
      toast.success("Subscriber removed");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const subscribers = query.data?.subscribers ?? [];

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "));
      setCopied(true);
      toast.success("All emails copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <AdminLayout
      title="Subscribers"
      actions={
        subscribers.length > 0 ? (
          <Button variant="outline" onClick={() => void copyAll()}>
            {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
            Copy all emails
          </Button>
        ) : null
      }
    >
      <div className="mb-4 rounded-xl border border-border/70 bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total subscribers</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {query.isPending ? "—" : (query.data?.total ?? 0)}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {query.isPending ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : query.isError ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Couldn't load subscribers. Is the API running?
          </div>
        ) : subscribers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Mail className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No subscribers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign-ups from the newsletter and footer forms will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Subscribed</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3 font-medium">{sub.email}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {format(new Date(sub.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(sub)}
                        title="Remove"
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Remove subscriber?"
        description={
          <>
            This removes <strong>{deleteTarget?.email}</strong> from your subscriber list.
          </>
        }
        confirmLabel="Remove"
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
      />
    </AdminLayout>
  );
}
