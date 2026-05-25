import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Controlled confirmation modal. Replaces window.confirm with a branded,
 * accessible dialog. The confirm button stays open and shows a spinner while
 * `loading` is true, so async actions (delete, etc.) read clearly.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => (!loading ? onOpenChange(next) : undefined)}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3 text-left">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? undefined : "gradient-primary text-primary-foreground"}
          >
            {loading ? <Spinner size="xs" className="mr-1.5" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
