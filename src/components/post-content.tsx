import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ApiBlock } from "@/lib/api";

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

export function headingId(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

// Build a table of contents from heading blocks. Ids are de-duplicated.
export function buildToc(blocks: ApiBlock[]): TocItem[] {
  const seen = new Map<string, number>();
  const items: TocItem[] = [];
  for (const block of blocks) {
    if (block.type !== "heading") continue;
    let id = headingId(block.text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, label: block.text, level: block.level });
  }
  return items;
}

export function PostContent({ blocks }: { blocks: ApiBlock[] }) {
  const seen = new Map<string, number>();
  const nextHeadingId = (text: string) => {
    const id = headingId(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    return count > 0 ? `${id}-${count}` : id;
  };

  return (
    <div className="max-w-2xl text-[15.5px] leading-[1.78] text-foreground/90 space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const id = nextHeadingId(block.text);
            return block.level === 3 ? (
              <h3 key={index} id={id} className="scroll-mt-24 text-xl font-semibold tracking-tight">
                {block.text}
              </h3>
            ) : (
              <h2
                key={index}
                id={id}
                className="scroll-mt-24 text-2xl font-semibold tracking-tight"
              >
                {block.text}
              </h2>
            );
          }
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "list":
            return block.ordered ? (
              <ol key={index} className="list-decimal space-y-1.5 pl-6">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="list-disc space-y-1.5 pl-6">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="rounded-r-lg border-l-2 border-primary/60 bg-secondary/40 px-4 py-3 text-muted-foreground italic"
              >
                {block.text}
              </blockquote>
            );
          case "code":
            return <CodeBlock key={index} language={block.language} code={block.code} />;
          case "image":
            return (
              <figure key={index} className="space-y-2">
                <img
                  src={block.url}
                  alt={block.alt ?? ""}
                  loading="lazy"
                  className="w-full rounded-xl border border-border/60"
                />
                {block.alt ? (
                  <figcaption className="text-center text-xs text-muted-foreground">
                    {block.alt}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "video":
            return <VideoBlock key={index} provider={block.provider} url={block.url} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable (e.g. insecure context) — ignore
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-white/50">{language || "text"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#e6edf3]">{code}</code>
      </pre>
    </div>
  );
}

function VideoBlock({ provider, url }: { provider: "youtube" | "vimeo" | "file"; url: string }) {
  if (provider === "file") {
    return (
      <video controls preload="metadata" className="w-full rounded-xl border border-border/60">
        <source src={url} />
      </video>
    );
  }

  const embed = provider === "youtube" ? youTubeEmbed(url) : vimeoEmbed(url);
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
        {url}
      </a>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border/60">
      <iframe
        src={embed}
        title="Embedded video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

function youTubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function vimeoEmbed(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}
