import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";

interface Cert {
  id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url: string;
}

const empty: Omit<Cert, "id"> = { name: "", issuing_organization: "", issue_date: "", credential_url: "" };

export default function CertificationsAdmin() {
  const { items, create, update, remove } = useCollection<Cert>("certifications");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Cert | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Cert) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (editing) { update(editing.id, form); toast.success("Updated"); }
    else { create(form); toast.success("Created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Certifications" description="Industry certifications." onAdd={startCreate} addLabel="New cert" />
      <CrudTable
        rows={items}
        columns={[
          { key: "name", header: "Name" },
          { key: "issuing_organization", header: "Issuer" },
          { key: "issue_date", header: "Date" },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit certification" : "New certification"} onSubmit={onSave}>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Issuing organization">
          <Input value={form.issuing_organization} onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })} />
        </Field>
        <Field label="Issue date">
          <Input value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} placeholder="2023" />
        </Field>
        <Field label="Credential URL">
          <Input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.name}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success("Deleted"); }
          setConfirm(null);
        }}
      />
    </div>
  );
}