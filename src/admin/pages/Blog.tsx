import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { toast } from "sonner";

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  tags: string[];
  content: string;
  status: "Draft" | "Published";
}

const empty: Omit<Post, "id"> = {
  slug: "",
  title: "",
  excerpt: "",
  cover_image: "",
  published_at: new Date().toISOString().slice(0, 10),
  tags: [],
  content: "",
  status: "Draft",
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function BlogAdmin() {
  const { items, create, update, remove } = useCollection<Post>("blog");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Post | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Post) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const next = { ...form, slug: form.slug || slugify(form.title) };
    if (editing) { update(editing.id, next); toast.success("Post updated"); }
    else { create(next); toast.success("Post created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Blog" description="Articles and posts." onAdd={startCreate} addLabel="New post" />
      <CrudTable
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
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit post" : "New post"} onSubmit={onSave}>
        <Field label="Cover image">
          <ImageUpload value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} />
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
            <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
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
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
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
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success("Post deleted"); }
          setConfirm(null);
        }}
      />
    </div>
  );
}