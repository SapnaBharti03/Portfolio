import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Post {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  published_at: string;
  tags: string[];
  content: string;
  status: "Draft" | "Published";
}

const empty: Omit<Post, "id"> = {
  slug: "",
  title: "",
  excerpt: "",
  cover_image_url: "",
  published_at: new Date().toISOString().slice(0, 10),
  tags: [],
  content: "",
  status: "Draft",
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatDate(value: unknown): string {
  if (value == null || value === "") return new Date().toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function normalizePost(row: Record<string, unknown>): Post {
  const status = String(row.status ?? "Draft");
  return {
    id: row.id as number | string,
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    cover_image_url: String(row.cover_image_url ?? ""),
    published_at: formatDate(row.published_at),
    tags: parseTags(row.tags),
    content: String(row.content ?? ""),
    status: status === "Published" ? "Published" : "Draft",
  };
}

export default function BlogAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blog-posts`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch blog posts");
      }
      const data = await res.json();
      const rows = (data.blog_posts ?? []).map((row: Record<string, unknown>) => normalizePost(row));
      setItems(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load blog posts";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Post) => {
    setEditing(x);
    setForm({
      slug: x.slug,
      title: x.title,
      excerpt: x.excerpt,
      cover_image_url: x.cover_image_url,
      published_at: x.published_at,
      tags: x.tags,
      content: x.content,
      status: x.status,
    });
    setOpen(true);
  };

  const payload = () => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    excerpt: form.excerpt,
    cover_image_url: form.cover_image_url,
    published_at: form.published_at,
    tags: form.tags,
    content: form.content,
    status: form.status,
  });

  const onSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/blog-posts/${editing.id}`
        : `${BASE_URL}/api/blog-posts`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchPosts({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Post"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save post";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (entry: Post) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/blog-posts/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Post"));
      await fetchPosts({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete post";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Blog" description="Articles and posts." onAdd={startCreate} addLabel="New post" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "title", header: "Title" },
          { key: "published_at", header: "Date" },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.status === "Published" ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>,
          },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit post" : "New post"}
        onSubmit={onSave}
        submitting={saving}
      >
        <Field label="Cover image">
          <ImageUpload folder="blog" value={form.cover_image_url} onChange={(v) => setForm({ ...form, cover_image_url: v })} />
        </Field>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Slug" hint="Auto-generated from title if empty">
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Excerpt">
          <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Published date">
            <Input
              type="date"
              value={form.published_at}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Post["status"] })}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Tags (comma separated)">
          <Input
            value={form.tags.join(", ")}
            onChange={(e) =>
              setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>
        <Field label="Content (Markdown)">
          <Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.title}"?`}
        confirming={deleting}
        onConfirm={() => confirm && deletePost(confirm)}
      />
    </div>
  );
}
