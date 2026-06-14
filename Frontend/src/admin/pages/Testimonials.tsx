import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { ImageUpload, type ImageUploadHandle } from "@/admin/components/ImageUpload";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { useCrudReorder } from "@/admin/hooks/useCrudReorder";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Testimonial {
  id: number | string;
  client_name: string;
  company: string;
  position: string;
  review_text: string;
  star_rating: number;
  client_photo_url: string;
}

const empty: Omit<Testimonial, "id"> = {
  client_name: "",
  company: "",
  position: "",
  review_text: "",
  star_rating: 5,
  client_photo_url: "",
};

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizeTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as number | string,
    client_name: String(row.client_name ?? ""),
    company: String(row.company ?? ""),
    position: String(row.position ?? ""),
    review_text: String(row.review_text ?? ""),
    star_rating: Number(row.star_rating ?? 5),
    client_photo_url: String(row.client_photo_url ?? ""),
  };
}

export default function TestimonialsAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const onReorder = useCrudReorder("testimonials", items, setItems, session?.access_token);

  // ref to trigger image upload on save
  const imgRef = useRef<ImageUploadHandle>(null);

  const fetchTestimonials = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/testimonials`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch testimonials");
      }
      const data = await res.json();
      setItems((data.testimonials ?? []).map((row: Record<string, unknown>) => normalizeTestimonial(row)));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not load testimonials");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Testimonial) => {
    setEditing(x);
    setForm({
      client_name: x.client_name,
      company: x.company,
      position: x.position,
      review_text: x.review_text,
      star_rating: x.star_rating,
      client_photo_url: x.client_photo_url,
    });
    setOpen(true);
  };

  const onSave = async () => {
    if (!form.client_name.trim() || !form.review_text.trim()) return toast.error("Name and review required");
    if (form.star_rating < 1 || form.star_rating > 5) return toast.error("Rating 1–5");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      // 1. Upload image first if a new file was selected
      const uploadedUrl = await imgRef.current?.triggerUpload();
      const client_photo_url = uploadedUrl ?? form.client_photo_url;

      // 2. Save to DB
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/testimonials/${editing.id}`
        : `${BASE_URL}/api/testimonials`;

      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify({ ...form, client_photo_url }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchTestimonials({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Testimonial"));
      setOpen(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonial = async (entry: Testimonial) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/testimonials/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Testimonial"));
      await fetchTestimonials({ silent: true });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not delete testimonial");
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client reviews."
        onAdd={startCreate}
        addLabel="New testimonial"
      />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          {
            key: "client_photo_url",
            header: "",
            render: (r) =>
              r.client_photo_url ? (
                <img src={r.client_photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-secondary" />
              ),
          },
          { key: "client_name", header: "Client" },
          { key: "company", header: "Company" },
          { key: "star_rating", header: "Rating", render: (r) => "★".repeat(r.star_rating) },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
        onReorder={onReorder}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit testimonial" : "New testimonial"}
        onSubmit={onSave}
        submitting={saving}
      >
        <Field label="Photo">
          <ImageUpload
            ref={imgRef}
            folder="testimonials"
            value={form.client_photo_url}
            onChange={(v) => setForm({ ...form, client_photo_url: v })}
          />
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
            <Input
              type="number"
              min={1}
              max={5}
              value={form.star_rating}
              onChange={(e) => setForm({ ...form, star_rating: Number(e.target.value) })}
            />
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
        confirming={deleting}
        onConfirm={() => confirm && deleteTestimonial(confirm)}
      />
    </div>
  );
}