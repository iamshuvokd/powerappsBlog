import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

const thicknessMap = {
  xs: "2px",
  sm: "2.5px",
  md: "3px",
  lg: "4px",
} as const;

type SpinnerSize = keyof typeof sizeMap;

/**
 * Branded conic-gradient ring spinner. The gradient arc spins while a radial
 * mask keeps the centre transparent, so it reads as a glowing rotating ring
 * in the brand's primary colour rather than a generic grey loader.
 */
export function Spinner({ size = "md", className }: { size?: SpinnerSize; className?: string }) {
  const ring = thicknessMap[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin rounded-full", sizeMap[size], className)}
      style={{
        background:
          "conic-gradient(from 90deg at 50% 50%, transparent 0deg, color-mix(in oklab, var(--primary) 30%, transparent) 120deg, var(--primary) 320deg, transparent 360deg)",
        WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}), #000 calc(100% - ${ring}))`,
        mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}), #000 calc(100% - ${ring}))`,
      }}
    />
  );
}

/**
 * Centered loading state for sections/pages: the ring spinner plus an
 * optional pulsing label. Use inside cards, tables or route pending states.
 */
export function PageSpinner({
  label = "Loading",
  size = "md",
  className,
}: {
  label?: string;
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div className={cn("grid place-items-center gap-3 py-16 text-center", className)}>
      <Spinner size={size} />
      {label ? (
        <p className="animate-pulse text-sm font-medium text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}
