import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload, type ImageUploadHandle } from "@/admin/components/ImageUpload";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { projectCategoryOptions, type ProjectCategory } from "@/lib/projectCategories";
import { useCrudReorder } from "@/admin/hooks/useCrudReorder";

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category: string;
  tech_stack: string[];
  cover_image_url: string;  // matches DB column name
  images: string[];
  live_url: string;
  github_url: string;
  is_featured: boolean;
  challenges: string;
  results: string;
}

const empty: Omit<Project, "id"> = {
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  category: "Web Application",
  tech_stack: [],
  cover_image_url: "",
  images: [],
  live_url: "",
  github_url: "",
  is_featured: false,
  challenges: "",
  results: "",
};

function parseCommaList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function ProjectsAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(empty);
  const [techStackText, setTechStackText] = useState("");
  const [confirm, setConfirm] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ref to trigger image upload on save
  const imgRef = useRef<ImageUploadHandle>(null);
  const onReorder = useCrudReorder("projects", items, setItems, session?.access_token);

  const fetchProjects = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/projects`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setItems(data.projects || []);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to fetch projects");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setTechStackText("");
    setOpen(true);
  };

  const startEdit = (p: Project) => {
    setEditing(p);
    const { id, ...rest } = p;
    void id;
    setForm(rest);
    setTechStackText((rest.tech_stack ?? []).join(", "));
    setOpen(true);
  };

  const onSave = async () => {
    if (!form.title.trim() || !form.short_description.trim()) {
      toast.error("Title and short description are required");
      return;
    }
    if (!session?.access_token) {
      toast.error("Not authenticated");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload image first if a new file was selected
      const uploadedUrl = await imgRef.current?.triggerUpload();
      const cover_image_url = uploadedUrl ?? form.cover_image_url;

      const payload = {
        ...form,
        tech_stack: parseCommaList(techStackText),
        cover_image_url,
        images: cover_image_url ? [cover_image_url] : form.images,
        slug: form.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
      };

      // 2. Save to DB
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/projects/${editing.id}`
        : `${BASE_URL}/api/projects`;

      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `${editing ? "Update" : "Create"} failed (${res.status})`);
      }
      await fetchProjects({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Project"));
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects."
        onAdd={startCreate}
        addLabel="New project"
      />

      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          {
            key: "cover_image_url",
            header: "",
            render: (r) =>
              r.cover_image_url ? (
                <img src={r.cover_image_url} alt="" className="h-10 w-14 rounded object-cover" />
              ) : (
                <div className="h-10 w-14 rounded bg-secondary" />
              ),
          },
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          {
            key: "is_featured",
            header: "Featured",
            render: (r) =>
              r.is_featured ? (
                <Badge>Featured</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]}
        onEdit={startEdit}
        onDelete={(p) => setConfirm(p)}
        onReorder={onReorder}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit project" : "New project"}
        onSubmit={onSave}
        submitting={saving}
      >
        <Field label="Cover image">
          <ImageUpload
            ref={imgRef}
            folder="projects"
            value={form.cover_image_url}
            onChange={(v) => setForm({ ...form, cover_image_url: v })}
          />
        </Field>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Category">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
          >
            {projectCategoryOptions(form.category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
            value={techStackText}
            onChange={(e) => setTechStackText(e.target.value)}
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
          <Textarea
            rows={2}
            value={form.challenges}
            onChange={(e) => setForm({ ...form, challenges: e.target.value })}
          />
        </Field>
        <Field label="Results">
          <Textarea
            rows={2}
            value={form.results}
            onChange={(e) => setForm({ ...form, results: e.target.value })}
          />
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
        confirming={deleting}
        onConfirm={async () => {
          if (!confirm || !session?.access_token) return;
          setDeleting(true);
          try {
            const res = await fetch(`${BASE_URL}/api/projects/${confirm.id}`, {
              method: "DELETE",
              headers: authHeaders(session.access_token),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error ?? "Delete failed");
            }
            await fetchProjects({ silent: true });
            toast.success(fun.deleted("Project"));
          } catch (err: any) {
            toast.error(err.message ?? "Failed to delete project");
          } finally {
            setDeleting(false);
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}