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

const BASE_URL = import.meta.env.VITE_API_URL;

interface Education {
  id: number | string;
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

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizeEducation(row: Record<string, unknown>): Education {
  return {
    id: row.id as number | string,
    degree: String(row.degree ?? ""),
    field_of_study: String(row.field_of_study ?? ""),
    institution: String(row.institution ?? ""),
    start_year: Number(row.start_year ?? 0),
    end_year: Number(row.end_year ?? 0),
    description: String(row.description ?? ""),
  };
}

export default function EducationAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Education[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEducation = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/education`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch education");
      }
      const data = await res.json();
      const rows = (data.education ?? []).map((row: Record<string, unknown>) =>
        normalizeEducation(row),
      );
      setItems(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load education";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Education) => {
    setEditing(x);
    setForm({
      degree: x.degree,
      field_of_study: x.field_of_study,
      institution: x.institution,
      start_year: x.start_year,
      end_year: x.end_year,
      description: x.description,
    });
    setOpen(true);
  };

  const payload = () => ({
    degree: form.degree,
    field_of_study: form.field_of_study,
    institution: form.institution,
    start_year: form.start_year,
    end_year: form.end_year,
    description: form.description,
  });

  const onSave = async () => {
    if (!form.degree.trim() || !form.institution.trim()) {
      return toast.error("Degree and institution required");
    }
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/education/${editing.id}`
        : `${BASE_URL}/api/education`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchEducation({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Education"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save education";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteEducation = async (entry: Education) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/education/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Education"));
      await fetchEducation({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete education";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Education" description="Schools and degrees." onAdd={startCreate} addLabel="New entry" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "degree", header: "Degree" },
          { key: "institution", header: "Institution" },
          { key: "period", header: "Years", render: (r) => `${r.start_year} – ${r.end_year}` },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit education" : "New education"}
        onSubmit={onSave}
        submitting={saving}
      >
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
              <Input
                type="number"
                value={form.start_year}
                onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })}
              />
            </Field>
            <Field label="End year">
              <Input
                type="number"
                value={form.end_year}
                onChange={(e) => setForm({ ...form, end_year: Number(e.target.value) })}
              />
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
        confirming={deleting}
        onConfirm={() => confirm && deleteEducation(confirm)}
      />
    </div>
  );
}
