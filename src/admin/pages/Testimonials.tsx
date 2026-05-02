import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCollection } from "@/admin/store";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { toast } from "sonner";

interface Testimonial {
  id: number;
  client_name: string;
  company: string;
  position: string;
  review_text: string;
  star_rating: number;
  client_photo: string;
}

const empty: Omit<Testimonial, "id"> = {
  client_name: "",
  company: "",
  position: "",
  review_text: "",
  star_rating: 5,
  client_photo: "",
};

export default function TestimonialsAdmin() {
  const { items, create, update, remove } = useCollection<Testimonial>("testimonials");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Testimonial | null>(null);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x: Testimonial) => {
    setEditing(x);
    const { id, ...rest } = x;
    void id;
    setForm(rest);
    setOpen(true);
  };
  const onSave = () => {
    if (!form.client_name.trim() || !form.review_text.trim()) return toast.error("Name and review required");
    if (form.star_rating < 1 || form.star_rating > 5) return toast.error("Rating 1–5");
    if (editing) { update(editing.id, form); toast.success("Updated"); }
    else { create(form); toast.success("Created"); }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Testimonials" description="Client reviews." onAdd={startCreate} addLabel="New testimonial" />
      <CrudTable
        rows={items}
        columns={[
          {
            key: "client_photo",
            header: "",
            render: (r) =>
              r.client_photo ? <img src={r.client_photo} alt="" className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-secondary" />,
          },
          { key: "client_name", header: "Client" },
          { key: "company", header: "Company" },
          { key: "star_rating", header: "Rating", render: (r) => "★".repeat(r.star_rating) },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Edit testimonial" : "New testimonial"} onSubmit={onSave}>
        <Field label="Photo">
          <ImageUpload value={form.client_photo} onChange={(v) => setForm({ ...form, client_photo: v })} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client name">
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </Field>
          <Field label="Position">
            <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <Field label="Company">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Star rating (1-5)">
            <Input type="number" min={1} max={5} value={form.star_rating} onChange={(e) => setForm({ ...form, star_rating: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Review text">
          <Textarea rows={4} value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete review by "${confirm?.client_name}"?`}
        onConfirm={() => {
          if (confirm) { remove(confirm.id); toast.success("Deleted"); }
          setConfirm(null);
        }}
      />
    </div>
  );
}