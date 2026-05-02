import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
}

const empty: Omit<Skill, "id"> = { name: "", category: "Frontend", proficiency: 80 };

export default function SkillsAdmin() {
  const { items, create, update, remove } = useCollection<Skill>("skills");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Skill | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, category: s.category, proficiency: s.proficiency }); setOpen(true); };
  const onSave = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.proficiency < 0 || form.proficiency > 100) return toast.error("Proficiency must be 0–100");
    if (editing) { update(editing.id, form); toast.success("Skill updated"); }
    else { create(form); toast.success("Skill created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Skills" description="Tech stack and proficiency." onAdd={startCreate} addLabel="New skill" />
      <CrudTable
        rows={items}
        columns={[
          { key: "name", header: "Name" },
          { key: "category", header: "Category", render: (r) => <Badge variant="secondary">{r.category}</Badge> },
          { key: "proficiency", header: "Proficiency", render: (r) => `${r.proficiency}%` },
        ]}
        onEdit={startEdit}
        onDelete={(s) => setConfirm(s)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit skill" : "New skill"} onSubmit={onSave}>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Category">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success("Skill deleted"); }
          setConfirm(null);
        }}
      />
    </div>
  );
}