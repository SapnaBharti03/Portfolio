import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

interface Education {
  id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number;
  end_year: number;
  description: string;
}

const empty: Omit<Education, "id"> = {
  degree: "",
  field_of_study: "",
  institution: "",
  start_year: new Date().getFullYear() - 4,
  end_year: new Date().getFullYear(),
  description: "",
};

export default function EducationAdmin() {
  const { items, create, update, remove } = useCollection<Education>("education");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Education | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Education) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.degree.trim() || !form.institution.trim()) return toast.error("Degree and institution required");
    if (editing) { update(editing.id, form); toast.success(fun.updated("Education")); }
    else { create(form); toast.success(fun.created("Education")); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Education" description="Schools and degrees." onAdd={startCreate} addLabel="New entry" />
      <CrudTable
        rows={items}
        columns={[
          { key: "degree", header: "Degree" },
          { key: "institution", header: "Institution" },
          { key: "period", header: "Years", render: (r) => `${r.start_year} – ${r.end_year}` },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit education" : "New education"} onSubmit={onSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Degree">
            <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </Field>
          <Field label="Field of study">
            <Input value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} />
          </Field>
          <Field label="Institution">
            <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start year">
              <Input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })} />
            </Field>
            <Field label="End year">
              <Input type="number" value={form.end_year} onChange={(e) => setForm({ ...form, end_year: Number(e.target.value) })} />
            </Field>
          </div>
        </div>
        <Field label="Description">
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.degree}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success(fun.deleted("Education")); }
          setConfirm(null);
        }}
      />
    </div>
  );
}