import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { toast } from "sonner";

interface Project {
  id: number;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  tech_stack: string[];
  cover_image: string;
  images: string[];
  live_url: string;
  github_url: string;
  is_featured: boolean;
  challenges: string;
  results: string;
}

const empty: Omit<Project, "id"> = {
  title: "",
  short_description: "",
  full_description: "",
  category: "Web App",
  tech_stack: [],
  cover_image: "",
  images: [],
  live_url: "",
  github_url: "",
  is_featured: false,
  challenges: "",
  results: "",
};

export default function ProjectsAdmin() {
  const { items, create, update, remove } = useCollection<Project>("projects");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(empty);
  const [confirm, setConfirm] = useState<Project | null>(null);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (p: Project) => {
    setEditing(p);
    const { id, ...rest } = p;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.title.trim() || !form.short_description.trim()) {
      toast.error("Title and short description are required");
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success("Project updated");
    } else {
      create(form);
      toast.success("Project created");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Projects" description="Manage your portfolio projects." onAdd={startCreate} addLabel="New project" />

      <CrudTable
        rows={items}
        columns={[
          {
            key: "cover_image",
            header: "",
            render: (r) =>
              r.cover_image ? (
                <img src={r.cover_image} alt="" className="h-10 w-14 rounded object-cover" />
              ) : (
                <div className="h-10 w-14 rounded bg-secondary" />
              ),
          },
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          {
            key: "is_featured",
            header: "Featured",
            render: (r) => (r.is_featured ? <Badge>Featured</Badge> : <span className="text-muted-foreground">—</span>),
          },
        ]}
        onEdit={startEdit}
        onDelete={(p) => setConfirm(p)}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit project" : "New project"}
        onSubmit={onSave}
      >
        <Field label="Cover image">
          <ImageUpload value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v, images: [v] })} />
        </Field>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Category">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </Field>
        <Field label="Short description">
          <Textarea
            rows={2}
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
        </Field>
        <Field label="Full description">
          <Textarea
            rows={4}
            value={form.full_description}
            onChange={(e) => setForm({ ...form, full_description: e.target.value })}
          />
        </Field>
        <Field label="Tech stack (comma separated)">
          <Input
            value={form.tech_stack.join(", ")}
            onChange={(e) =>
              setForm({ ...form, tech_stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Live URL">
            <Input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
          </Field>
          <Field label="GitHub URL">
            <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
          </Field>
        </div>
        <Field label="Challenges">
          <Textarea rows={2} value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} />
        </Field>
        <Field label="Results">
          <Textarea rows={2} value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} />
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Featured</p>
            <p className="text-xs text-muted-foreground">Show in featured projects.</p>
          </div>
          <Switch
            checked={form.is_featured}
            onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
          />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.title}"?`}
        onConfirm={() => {
          if (confirm) {
            remove(confirm.id);
            toast.success("Project deleted");
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}