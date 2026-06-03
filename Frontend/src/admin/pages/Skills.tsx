import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { skillCategoryOptions, type SkillCategory } from "@/lib/skillCategories";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
}

const empty: Omit<Skill, "id"> = { name: "", category: "Frontend" as SkillCategory, proficiency: 80 };

export default function SkillsAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchSkills = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/skills`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch skills");
      }
      const data = await res.json();
      setItems(data.skills ?? []);
    } catch (error: any) {
      toast.error(error.message ?? "Could not load skills");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [session?.access_token]);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, category: s.category, proficiency: s.proficiency }); setOpen(true); };

  const onSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.proficiency < 0 || form.proficiency > 100) return toast.error("Proficiency must be 0–100");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${BASE_URL}/api/skills/${editing.id}` : `${BASE_URL}/api/skills`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          proficiency: form.proficiency,
          display_order: 0,
        }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchSkills({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Skill"));
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message ?? "Could not save skill");
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (skill: Skill) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/skills/${skill.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Skill"));
      await fetchSkills({ silent: true });
    } catch (error: any) {
      toast.error(error.message ?? "Could not delete skill");
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Skills" description="Tech stack and proficiency." onAdd={startCreate} addLabel="New skill" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "name", header: "Name" },
          { key: "category", header: "Category", render: (r) => <Badge variant="secondary">{r.category}</Badge> },
          { key: "proficiency", header: "Proficiency", render: (r) => `${r.proficiency}%` },
        ]}
        onEdit={startEdit}
        onDelete={(s) => setConfirm(s)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit skill" : "New skill"} onSubmit={onSave} submitting={saving}>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Category">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}
          >
            {skillCategoryOptions(form.category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Proficiency (0-100)">
          <Input
            type="number"
            min={0}
            max={100}
            value={form.proficiency}
            onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
          />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.name}"?`}
        confirming={deleting}
        onConfirm={() => confirm && deleteSkill(confirm)}
      />
    </div>
  );
}