import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/data";

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const dur = 1400;
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setV(Math.round(to * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-14 border-y border-border/60 bg-surface/40">
      <div className="max-w-7xl mx-auto container-px grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center lg:text-left">
            <p className="text-3xl lg:text-4xl font-semibold tracking-tight gradient-text">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
