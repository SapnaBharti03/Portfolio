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
import { toast } from "sonner";

interface Experience {
  id: number;
  company_name: string;
  role: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  achievements: string[];
}

const empty: Omit<Experience, "id"> = {
  company_name: "",
  role: "",
  employment_type: "Full-time",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  achievements: [],
};

export default function ExperienceAdmin() {
  const { items, create, update, remove } = useCollection<Experience>("experience");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Experience | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Experience) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.company_name.trim() || !form.role.trim()) return toast.error("Company and role required");
    if (editing) { update(editing.id, form); toast.success("Experience updated"); }
    else { create(form); toast.success("Experience created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Experience" description="Work history and achievements." onAdd={startCreate} addLabel="New entry" />
      <CrudTable
        rows={items}
        columns={[
          { key: "role", header: "Role" },
          { key: "company_name", header: "Company" },
          {
            key: "period",
            header: "Period",
            render: (r) => `${r.start_date} – ${r.is_current ? "Present" : r.end_date}`,
          },
          {
            key: "is_current",
            header: "Current",
            render: (r) => (r.is_current ? <Badge>Current</Badge> : <span className="text-muted-foreground">—</span>),
          },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit experience" : "New experience"} onSubmit={onSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company name">
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </Field>
          <Field label="Employment type">
            <Input value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} />
          </Field>
          <Field label="Start date">
            <Input value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Mar 2022" />
          </Field>
          <Field label="End date">
            <Input value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} placeholder="Present" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Achievements (one per line)">
          <Textarea
            rows={4}
            value={form.achievements.join("\n")}
            onChange={(e) => setForm({ ...form, achievements: e.target.value.split("\n").filter(Boolean) })}
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Current role</p>
            <p className="text-xs text-muted-foreground">Mark as currently working here.</p>
          </div>
          <Switch checked={form.is_current} onCheckedChange={(v) => setForm({ ...form, is_current: v })} />
        </div>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.role} @ ${confirm?.company_name}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success("Experience deleted"); }
          setConfirm(null);
        }}
      />
    </div>
  );
}