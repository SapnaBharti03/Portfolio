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

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  starting_price: string;
}

const empty: Omit<Service, "id"> = { title: "", description: "", icon: "Sparkles", starting_price: "" };

export default function ServicesAdmin() {
  const { items, create, update, remove } = useCollection<Service>("services");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Service | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, icon: s.icon, starting_price: s.starting_price });
    setOpen(true);
  };
  const onSave = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (editing) { update(editing.id, form); toast.success(fun.updated("Service")); }
    else { create(form); toast.success(fun.created("Service")); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Services" description="What you offer to clients." onAdd={startCreate} addLabel="New service" />
      <CrudTable
        rows={items}
        columns={[
          { key: "title", header: "Title" },
          { key: "starting_price", header: "Starting price" },
          { key: "icon", header: "Icon" },
        ]}
        onEdit={startEdit}
        onDelete={(s) => setConfirm(s)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit service" : "New service"} onSubmit={onSave}>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Icon (lucide name)" hint="e.g. Code2, Server, Cloud, Gauge, Lightbulb, Rocket">
          <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </Field>
        <Field label="Starting price">
          <Input value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.title}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success(fun.deleted("Service")); }
          setConfirm(null);
        }}
      />
    </div>
  );
}