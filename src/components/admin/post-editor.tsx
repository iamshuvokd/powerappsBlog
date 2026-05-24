import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Heading,
  Image as ImageIcon,
  List as ListIcon,
  Loader2,
  Plus,
  Quote,
  Send,
  Text,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import { createPost, getAllTags, updatePost, uploadMedia, type PostInput } from "@/lib/admin-api";
import type { ApiBlock, ApiPost } from "@/lib/api";

type BlockType = ApiBlock["type"];
type EditorBlock = ApiBlock & { key: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

let keyCounter = 0;
function freshKey(): string {
  keyCounter += 1;
  return `b${Date.now()}_${keyCounter}`;
}

function newBlock(type: BlockType): EditorBlock {
  const key = freshKey();
  switch (type) {
    case "heading":
      return { key, type, level: 2, text: "" };
    case "code":
      return { key, type, language: "powerfx", code: "" };
    case "quote":
      return { key, type, text: "" };
    case "list":
      return { key, type, ordered: false, items: [""] };
    case "image":
      return { key, type, url: "", alt: "" };
    case "video":
      return { key, type, provider: "youtube", url: "" };
    case "paragraph":
    default:
      return { key, type: "paragraph", text: "" };
  }
}

const blockTypes: { type: BlockType; label: string; icon: typeof Text }[] = [
  { type: "paragraph", label: "Text", icon: Text },
  { type: "heading", label: "Heading", icon: Heading },
  { type: "code", label: "Code", icon: Code2 },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video", icon: Video },
  { type: "list", label: "List", icon: ListIcon },
  { type: "quote", label: "Quote", icon: Quote },
];

export function PostEditor({ initial }: { initial?: ApiPost }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: getAllTags });

  const [postId, setPostId] = useState<number | undefined>(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags.map((t) => t.name) ?? []);
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    () => initial?.content.map((b) => ({ ...b, key: freshKey() })) ?? [],
  );
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState<null | "DRAFT" | "PUBLISHED">(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  // ---- block ops ----
  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, newBlock(type)]);
  const removeBlock = (key: string) => setBlocks((prev) => prev.filter((b) => b.key !== key));
  const updateBlock = (key: string, patch: Record<string, unknown>) =>
    setBlocks((prev) => prev.map((b) => (b.key === key ? ({ ...b, ...patch } as EditorBlock) : b)));
  const moveBlock = (key: string, dir: -1 | 1) =>
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.key === key);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  // ---- tags ----
  const toggleTag = (name: string) =>
    setTags((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));
  const addNewTag = () => {
    const name = newTag.trim();
    if (name && !tags.includes(name)) setTags((prev) => [...prev, name]);
    setNewTag("");
  };

  const suggestions = useMemo(
    () => (tagsQuery.data?.tags ?? []).map((t) => t.name).filter((n) => !tags.includes(n)),
    [tagsQuery.data, tags],
  );

  // ---- cover upload ----
  const onPickCover = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const res = await uploadMedia(file);
      setCoverImage(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---- save ----
  const cleanBlocks = (): ApiBlock[] =>
    blocks.map(({ key, ...rest }) => {
      void key;
      if (rest.type === "list") {
        return { ...rest, items: rest.items.map((i) => i).filter((i) => i.trim().length > 0) };
      }
      return rest;
    });

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required.";
    if (!excerpt.trim()) return "Excerpt is required.";
    for (const b of blocks) {
      if ((b.type === "image" || b.type === "video") && !b.url.trim()) {
        return `An ${b.type} block is missing a URL.`;
      }
    }
    return null;
  };

  const save = async (status: "DRAFT" | "PUBLISHED") => {
    setMessage("");
    setError("");
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(status);
    const payload: PostInput = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: cleanBlocks(),
      coverImage: coverImage.trim() ? coverImage.trim() : null,
      status,
      tags,
    };
    try {
      let saved: ApiPost;
      if (postId) {
        saved = (await updatePost(postId, payload)).post;
      } else {
        saved = (await createPost(payload)).post;
        setPostId(saved.id);
      }
      setSlug(saved.slug);
      setSlugEdited(true);
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      setMessage(status === "PUBLISHED" ? "Published." : "Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "https://www.powerapps.blog";

  return (
    <AdminLayout
      title={postId ? "Edit post" : "New post"}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void save("DRAFT")} disabled={saving !== null}>
            {saving === "DRAFT" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Save draft
          </Button>
          <Button
            onClick={() => void save("PUBLISHED")}
            disabled={saving !== null}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            {saving === "PUBLISHED" ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            Publish
          </Button>
        </div>
      }
    >
      {message ? (
        <div className="mb-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Editor canvas */}
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title…"
            className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">/blog/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="post-slug"
              className="min-w-0 flex-1 rounded-md border border-border/70 bg-background px-2 py-1 text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => (
              <BlockCard
                key={block.key}
                block={block}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                onChange={(patch) => updateBlock(block.key, patch)}
                onRemove={() => removeBlock(block.key)}
                onMove={(dir) => moveBlock(block.key, dir)}
              />
            ))}

            {blocks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                Add your first content block below.
              </p>
            ) : null}

            <AddBlockMenu onAdd={addBlock} />
          </div>
        </div>

        {/* Settings sidebar */}
        <aside className="space-y-5">
          <SidebarSection label="Excerpt">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Short summary shown on cards and search…"
              className="w-full resize-y rounded-lg border border-border/70 bg-background p-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </SidebarSection>

          <SidebarSection label="Cover image">
            {coverImage ? (
              <div className="relative mb-2 overflow-hidden rounded-lg border border-border/60">
                <img src={coverImage} alt="Cover" className="h-32 w-full object-cover" />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md bg-background/80 text-foreground hover:bg-background"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…/image.jpg"
              className="mb-2 w-full rounded-lg border border-border/70 bg-background px-2.5 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onPickCover(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-4 w-4" />
              )}
              Upload image
            </Button>
          </SidebarSection>

          <SidebarSection label="Tags">
            {tags.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    {tag}
                    <button onClick={() => toggleTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex gap-1.5">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewTag();
                  }
                }}
                placeholder="Add a tag…"
                className="min-w-0 flex-1 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <Button variant="outline" size="sm" onClick={addNewTag}>
                Add
              </Button>
            </div>
            {suggestions.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => toggleTag(name)}
                    className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            ) : null}
          </SidebarSection>

          <SidebarSection label="Search preview">
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <p className="truncate text-xs text-emerald-600 dark:text-emerald-400">
                {siteUrl.replace(/^https?:\/\//, "")}/blog/{slug || "post-slug"}
              </p>
              <p className="mt-0.5 line-clamp-1 text-sm font-medium text-primary">
                {title || "Post title"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {excerpt || "Your excerpt will appear here."}
              </p>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </AdminLayout>
  );
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function AddBlockMenu({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-dashed border-border/70 p-2">
      {open ? (
        <div className="flex flex-wrap gap-1.5">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => {
                onAdd(bt.type);
                setOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs hover:border-primary/40 hover:text-primary"
            >
              <bt.icon className="h-3.5 w-3.5" /> {bt.label}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 py-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Add block
        </button>
      )}
    </div>
  );
}

function BlockCard({
  block,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {block.type}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <BlockFields block={block} onChange={onChange} />
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border/70 bg-background p-2.5 text-sm focus:border-primary focus:outline-none";

function BlockFields({
  block,
  onChange,
}: {
  block: EditorBlock;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  switch (block.type) {
    case "paragraph":
    case "quote":
      return (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder={block.type === "quote" ? "Quote / tip text…" : "Paragraph text…"}
          className={`${inputClass} resize-y`}
        />
      );
    case "heading":
      return (
        <div className="flex gap-2">
          <select
            value={block.level}
            onChange={(e) => onChange({ level: Number(e.target.value) })}
            className="rounded-lg border border-border/70 bg-background px-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Heading text…"
            className={inputClass}
          />
        </div>
      );
    case "code":
      return (
        <div className="space-y-2">
          <input
            value={block.language}
            onChange={(e) => onChange({ language: e.target.value })}
            placeholder="language (e.g. powerfx, json)"
            className={inputClass}
          />
          <textarea
            value={block.code}
            onChange={(e) => onChange({ code: e.target.value })}
            rows={5}
            placeholder="Code…"
            className={`${inputClass} font-mono`}
            spellCheck={false}
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Image URL"
            className={inputClass}
          />
          <input
            value={block.alt ?? ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Alt text"
            className={inputClass}
          />
        </div>
      );
    case "video":
      return (
        <div className="flex gap-2">
          <select
            value={block.provider}
            onChange={(e) => onChange({ provider: e.target.value })}
            className="rounded-lg border border-border/70 bg-background px-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="file">File</option>
          </select>
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Video URL"
            className={inputClass}
          />
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(e) => onChange({ ordered: e.target.checked })}
            />
            Ordered list
          </label>
          <textarea
            value={block.items.join("\n")}
            onChange={(e) => onChange({ items: e.target.value.split("\n") })}
            rows={4}
            placeholder="One item per line…"
            className={`${inputClass} resize-y`}
          />
        </div>
      );
    default:
      return null;
  }
}
