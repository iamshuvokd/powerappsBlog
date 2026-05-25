import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { MediaDropZone } from "@/components/admin/media-drop-zone";
import { deleteMedia, listMedia, uploadMedia, type MediaAsset } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media - PowerApps.blog Admin" }] }),
  component: MediaPage,
});

function MediaPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "media"], queryFn: listMedia });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "media"] });

  const remove = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      void invalidate();
      toast.success("Asset deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const onUpload = async (file: File) => {
    setError("");
    setProgress(0);
    setUploading(true);
    try {
      await uploadMedia(file, setProgress);
      void invalidate();
      toast.success("Upload complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const media = query.data?.media ?? [];

  return (
    <AdminLayout title="Media library">
      <MediaDropZone
        accept="image/*,video/*"
        label="Click or drag to upload media"
        hint="Images and videos — stored on Cloudinary"
        uploading={uploading}
        progress={progress}
        onPick={(file) => void onUpload(file)}
        className="mb-5"
      />

      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {query.isPending ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-border/70 bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Couldn't load media.
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 px-5 py-16 text-center">
          <p className="text-sm font-medium">No media yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop a file above to upload. Uploads require Cloudinary credentials in <code>.env</code>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((asset) => (
            <MediaCard key={asset.id} asset={asset} onDelete={() => setDeleteTarget(asset)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete asset?"
        description="This permanently removes the file from Cloudinary and the media library. This action cannot be undone."
        confirmLabel="Delete asset"
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
      />
    </AdminLayout>
  );
}

function MediaCard({ asset, onDelete }: { asset: MediaAsset; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="aspect-video bg-secondary/50">
        {asset.type === "VIDEO" ? (
          <video src={asset.url} className="h-full w-full object-cover" muted />
        ) : (
          <img src={asset.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex items-center justify-between gap-1 p-2">
        <span className="truncate text-xs text-muted-foreground">{asset.type}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={copy}
            title="Copy URL"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
