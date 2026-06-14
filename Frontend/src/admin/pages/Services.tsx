import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { useCrudReorder } from "@/admin/hooks/useCrudReorder";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Service {
  id: number | string;
  title: string;
  description: string;
  icon: string;
  starting_price: string;
  display_order?: number;
}

const empty: Omit<Service, "id"> = {
  title: "",
  description: "",
  icon: "Sparkles",
  starting_price: "",
};

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function ServicesAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const onReorder = useCrudReorder("services", items, setItems, session?.access_token);

  const fetchServices = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/services`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch services");
      }
      const data = await res.json();
      setItems(data.services ?? []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load services";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon,
      starting_price: s.starting_price != null ? String(s.starting_price) : "",
    });
    setOpen(true);
  };

  const onSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/services/${editing.id}`
        : `${BASE_URL}/api/services`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          icon: form.icon,
          starting_price: form.starting_price,
          display_order: editing?.display_order ?? 0,
        }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchServices({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Service"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save service";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (service: Service) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/services/${service.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Service"));
      await fetchServices({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete service";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Services" description="What you offer to clients." onAdd={startCreate} addLabel="New service" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "title", header: "Title" },
          { key: "starting_price", header: "Starting price" },
          { key: "icon", header: "Icon" },
        ]}
        onEdit={startEdit}
        onDelete={(s) => setConfirm(s)}
        onReorder={onReorder}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit service" : "New service"}
        onSubmit={onSave}
        submitting={saving}
      >
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
        confirming={deleting}
        onConfirm={() => confirm && deleteService(confirm)}
      />
    </div>
  );
}

