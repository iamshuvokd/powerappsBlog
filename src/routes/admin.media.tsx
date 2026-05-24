import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Check, Copy, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import { deleteMedia, listMedia, uploadMedia, type MediaAsset } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media - PowerApps.blog Admin" }] }),
  component: MediaPage,
});

function MediaPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "media"], queryFn: listMedia });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "media"] });

  const remove = useMutation({ mutationFn: deleteMedia, onSuccess: () => void invalidate() });

  const onUpload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      await uploadMedia(file);
      void invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const media = query.data?.media ?? [];

  return (
    <AdminLayout
      title="Media library"
      actions={
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Upload
          </Button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {query.isPending ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-border/70 bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Couldn't load media.
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 px-5 py-16 text-center">
          <p className="text-sm font-medium">No media yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploads require Cloudinary credentials in <code>.env</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((asset) => (
            <MediaCard key={asset.id} asset={asset} onDelete={() => remove.mutate(asset.id)} />
          ))}
        </div>
      )}
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
            onClick={() => {
              if (window.confirm("Delete this asset?")) onDelete();
            }}
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
