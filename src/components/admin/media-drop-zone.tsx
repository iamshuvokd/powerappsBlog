import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Self-contained click-or-drag upload zone. Owns its own file input and drag
 * state; the parent runs the upload and feeds back `uploading` + `progress`.
 *
 * While progress < 100 it shows the transfer percentage; at 100 the bytes have
 * reached the API but Cloudinary is still processing, so it shows "Processing…".
 */
export function MediaDropZone({
  accept,
  label,
  hint,
  uploading = false,
  progress = 0,
  onPick,
  className,
}: {
  accept: string;
  label: string;
  hint?: string;
  uploading?: boolean;
  progress?: number;
  onPick: (file: File) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (uploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) onPick(file);
        }}
        disabled={uploading}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
          dragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary/40",
          uploading && "cursor-default",
        )}
      >
        {uploading ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Spinner size="xs" />
              <span className="font-medium">
                {progress < 100 ? `Uploading… ${progress}%` : "Processing…"}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : (
          <>
            <UploadCloud className="h-6 w-6" />
            <span className="font-medium text-foreground">{label}</span>
            {hint ? <span className="text-xs">{hint}</span> : null}
          </>
        )}
      </button>
    </div>
  );
}
