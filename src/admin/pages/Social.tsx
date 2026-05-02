import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

interface Social {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

const empty: Omit<Social, "id"> = { platform: "", url: "", icon: "" };

export default function SocialAdmin() {
  const { items, create, update, remove } = useCollection<Social>("social-links");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Social | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Social | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Social) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.platform.trim() || !form.url.trim()) return toast.error("Platform and URL required");
    if (editing) { update(editing.id, form); toast.success(fun.updated("Link")); }
    else { create(form); toast.success(fun.created("Link")); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Social Links" description="Where people can find you." onAdd={startCreate} addLabel="New link" />
      <CrudTable
        rows={items}
        columns={[
          { key: "platform", header: "Platform" },
          { key: "url", header: "URL", render: (r) => <span className="text-muted-foreground truncate">{r.url}</span> },
          { key: "icon", header: "Icon" },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit link" : "New link"} onSubmit={onSave}>
        <Field label="Platform">
          <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
        </Field>
        <Field label="URL">
          <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </Field>
        <Field label="Icon" hint="github, linkedin, twitter, instagram, etc.">
          <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.platform}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success(fun.deleted("Link")); }
          setConfirm(null);
        }}
      />
    </div>
  );
}