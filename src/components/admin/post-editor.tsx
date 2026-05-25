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
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { MediaDropZone } from "@/components/admin/media-drop-zone";
import {
  createPost,
  getAdminPosts,
  getAllTags,
  updatePost,
  uploadMedia,
  type PostInput,
} from "@/lib/admin-api";
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
  const postsQuery = useQuery({ queryKey: ["admin", "posts"], queryFn: getAdminPosts });

  const [postId, setPostId] = useState<number | undefined>(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags.map((t) => t.name) ?? []);
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>(initial?.relatedSlugs ?? []);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    () => initial?.content.map((b) => ({ ...b, key: freshKey() })) ?? [],
  );
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [saving, setSaving] = useState<null | "DRAFT" | "PUBLISHED">(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverDragging, setCoverDragging] = useState(false);
  const [blockUploading, setBlockUploading] = useState<string | null>(null);
  const [blockProgress, setBlockProgress] = useState(0);

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
  const removeTag = (name: string) => setTags((prev) => prev.filter((t) => t !== name));
  const startEditTag = (name: string) => {
    setEditingTag(name);
    setEditingValue(name);
  };
  const commitEditTag = () => {
    if (editingTag === null) return;
    const next = editingValue.trim();
    setTags((prev) => {
      if (!next) return prev.filter((t) => t !== editingTag); // cleared = remove
      if (prev.includes(next) && next !== editingTag) return prev.filter((t) => t !== editingTag); // merge dupes
      return prev.map((t) => (t === editingTag ? next : t));
    });
    setEditingTag(null);
    setEditingValue("");
  };

  const suggestions = useMemo(
    () => (tagsQuery.data?.tags ?? []).map((t) => t.name).filter((n) => !tags.includes(n)),
    [tagsQuery.data, tags],
  );

  // ---- related posts ----
  const relatedCandidates = useMemo(
    () => (postsQuery.data?.posts ?? []).filter((p) => p.id !== postId),
    [postsQuery.data, postId],
  );
  const toggleRelated = (slug: string) =>
    setRelatedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  // Currently selected (pinned, always visible so they can be removed).
  const selectedRelated = useMemo(
    () => relatedCandidates.filter((p) => relatedSlugs.includes(p.slug)),
    [relatedCandidates, relatedSlugs],
  );
  // Search results: matches (capped) so this scales to any post count. Selected
  // ones stay in the list (shown checked) so several can be ticked at once.
  const relatedResults = useMemo(() => {
    const q = relatedSearch.trim().toLowerCase();
    if (!q) return [];
    return relatedCandidates.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 20);
  }, [relatedCandidates, relatedSearch]);

  // ---- cover upload ----
  const onPickCover = async (file: File) => {
    setError("");
    setCoverProgress(0);
    setUploading(true);
    try {
      const res = await uploadMedia(file, setCoverProgress);
      setCoverImage(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---- image / video block upload ----
  const onPickBlockMedia = async (blockKey: string, file: File) => {
    setError("");
    setBlockProgress(0);
    setBlockUploading(blockKey);
    try {
      const res = await uploadMedia(file, setBlockProgress);
      updateBlock(blockKey, { url: res.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBlockUploading(null);
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
      relatedSlugs,
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
            {saving === "DRAFT" ? <Spinner size="xs" className="mr-1.5" /> : null}
            Save draft
          </Button>
          <Button
            onClick={() => void save("PUBLISHED")}
            disabled={saving !== null}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            {saving === "PUBLISHED" ? (
              <Spinner size="xs" className="mr-1.5" />
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
                onMediaUpload={(file) => void onPickBlockMedia(block.key, file)}
                isMediaUploading={blockUploading === block.key}
                mediaProgress={blockUploading === block.key ? blockProgress : 0}
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
            {coverImage ? (
              <div className="relative mb-2 overflow-hidden rounded-lg border border-border/60">
                <img src={coverImage} alt="Cover" className="h-36 w-full object-cover" />
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    title="Replace image"
                    className="grid h-7 w-7 place-items-center rounded-md bg-background/80 text-foreground hover:bg-background disabled:opacity-60"
                  >
                    {uploading ? <Spinner size="xs" /> : <Upload className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    title="Remove image"
                    className="grid h-7 w-7 place-items-center rounded-md bg-background/80 text-foreground hover:bg-background"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setCoverDragging(true);
                }}
                onDragLeave={() => setCoverDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCoverDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void onPickCover(file);
                }}
                disabled={uploading}
                className={`mb-2 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition-colors disabled:cursor-default ${
                  coverDragging
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                {uploading ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center gap-2 text-foreground">
                      <Spinner size="xs" />
                      <span className="font-medium">
                        {coverProgress < 100 ? `Uploading… ${coverProgress}%` : "Processing…"}
                      </span>
                    </div>
                    <Progress value={coverProgress} className="h-1.5" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="font-medium text-foreground">Click or drag to upload</span>
                    <span className="text-xs">PNG, JPG or WebP</span>
                  </>
                )}
              </button>
            )}
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="…or paste an image URL"
              className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </SidebarSection>

          <SidebarSection label="Tags">
            {tags.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) =>
                  editingTag === tag ? (
                    <input
                      key={tag}
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={commitEditTag}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitEditTag();
                        }
                        if (e.key === "Escape") {
                          setEditingTag(null);
                          setEditingValue("");
                        }
                      }}
                      className="w-24 rounded-full border border-primary bg-background px-2 py-0.5 text-xs focus:outline-none"
                    />
                  ) : (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      <button
                        type="button"
                        onClick={() => startEditTag(tag)}
                        title="Click to rename"
                        className="hover:underline"
                      >
                        {tag}
                      </button>
                      <button type="button" onClick={() => removeTag(tag)} title="Remove tag">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ),
                )}
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
                    type="button"
                    onClick={() => toggleTag(name)}
                    className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Click a tag to rename it, or × to remove.
            </p>
          </SidebarSection>

          <SidebarSection label="Related posts">
            {relatedCandidates.length === 0 ? (
              <p className="text-xs text-muted-foreground">No other posts to link yet.</p>
            ) : (
              <>
                {selectedRelated.length > 0 ? (
                  <div className="mb-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Selected ({selectedRelated.length})
                    </p>
                    {selectedRelated.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-2 rounded-md bg-primary/5 px-2 py-1 text-sm"
                      >
                        <span className="line-clamp-2 leading-snug">{p.title}</span>
                        <button
                          type="button"
                          onClick={() => toggleRelated(p.slug)}
                          title="Remove"
                          className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <input
                  value={relatedSearch}
                  onChange={(e) => setRelatedSearch(e.target.value)}
                  placeholder="Search posts to add…"
                  className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
                />

                {relatedSearch.trim() ? (
                  relatedResults.length > 0 ? (
                    <div className="mt-1 max-h-44 space-y-0.5 overflow-y-auto">
                      {relatedResults.map((p) => (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-secondary/60"
                        >
                          <input
                            type="checkbox"
                            checked={relatedSlugs.includes(p.slug)}
                            onChange={() => toggleRelated(p.slug)}
                            className="mt-0.5"
                          />
                          <span className="line-clamp-2 leading-snug">{p.title}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">No matching posts.</p>
                  )
                ) : null}
              </>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Search and tick multiple posts to add. Leave empty to auto-pick by tag.
            </p>
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
  onMediaUpload,
  isMediaUploading,
  mediaProgress,
}: {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onMediaUpload?: (file: File) => void;
  isMediaUploading?: boolean;
  mediaProgress?: number;
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
      <BlockFields
        block={block}
        onChange={onChange}
        onMediaUpload={onMediaUpload}
        isMediaUploading={isMediaUploading}
        mediaProgress={mediaProgress}
      />
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border/70 bg-background p-2.5 text-sm focus:border-primary focus:outline-none";

function BlockFields({
  block,
  onChange,
  onMediaUpload,
  isMediaUploading,
  mediaProgress,
}: {
  block: EditorBlock;
  onChange: (patch: Record<string, unknown>) => void;
  onMediaUpload?: (file: File) => void;
  isMediaUploading?: boolean;
  mediaProgress?: number;
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
          {block.url ? (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <img src={block.url} alt={block.alt ?? ""} className="h-40 w-full object-cover" />
            </div>
          ) : null}
          {onMediaUpload ? (
            <MediaDropZone
              accept="image/*"
              label={block.url ? "Click or drag to replace" : "Click or drag to upload image"}
              hint="PNG, JPG, GIF or WebP"
              uploading={isMediaUploading}
              progress={mediaProgress}
              onPick={onMediaUpload}
            />
          ) : null}
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="…or paste an image URL"
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
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={block.provider}
              onChange={(e) => onChange({ provider: e.target.value })}
              className="rounded-lg border border-border/70 bg-background px-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="file">Upload / File</option>
            </select>
            <input
              value={block.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder={
                block.provider === "file" ? "Video URL (or use upload button)" : "Video URL"
              }
              className={inputClass}
            />
          </div>
          {block.provider === "file" ? (
            <>
              {block.url ? (
                <video
                  src={block.url}
                  controls
                  className="w-full rounded-lg border border-border/60"
                />
              ) : null}
              {onMediaUpload ? (
                <MediaDropZone
                  accept="video/*"
                  label={block.url ? "Click or drag to replace" : "Click or drag to upload video"}
                  hint="MP4, WebM or MOV"
                  uploading={isMediaUploading}
                  progress={mediaProgress}
                  onPick={onMediaUpload}
                />
              ) : null}
            </>
          ) : null}
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
