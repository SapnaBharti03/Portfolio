import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/admin/components/PageHeader";
import { CrudTable } from "@/admin/components/CrudTable";
import { FormDialog } from "@/admin/components/FormDialog";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Field } from "@/admin/components/Field";
import { MonthPicker } from "@/admin/components/MonthPicker";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { formatMonthYear, monthInputToApiDate, toMonthInputValue } from "@/lib/dates";
import { useCrudReorder } from "@/admin/hooks/useCrudReorder";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Cert {
  id: number | string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url: string;
}

const empty: Omit<Cert, "id"> = {
  name: "",
  issuing_organization: "",
  issue_date: "",
  credential_url: "",
};

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizeCert(row: Record<string, unknown>): Cert {
  return {
    id: row.id as number | string,
    name: String(row.name ?? ""),
    issuing_organization: String(row.issuing_organization ?? ""),
    issue_date: row.issue_date != null ? toMonthInputValue(String(row.issue_date)) : "",
    credential_url: String(row.credential_url ?? ""),
  };
}

export default function CertificationsAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Cert[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Cert | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const onReorder = useCrudReorder("certifications", items, setItems, session?.access_token);

  const fetchCertifications = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/certifications`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch certifications");
      }
      const data = await res.json();
      const rows = (data.certifications ?? []).map((row: Record<string, unknown>) =>
        normalizeCert(row),
      );
      setItems(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load certifications";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Cert) => {
    setEditing(x);
    setForm({
      name: x.name,
      issuing_organization: x.issuing_organization,
      issue_date: x.issue_date,
      credential_url: x.credential_url,
    });
    setOpen(true);
  };

  const payload = () => ({
    name: form.name,
    issuing_organization: form.issuing_organization,
    issue_date: monthInputToApiDate(form.issue_date),
    credential_url: form.credential_url,
  });

  const onSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.issue_date.trim()) return toast.error("Issue date is required");
    if (!monthInputToApiDate(form.issue_date)) return toast.error("Invalid issue date");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/certifications/${editing.id}`
        : `${BASE_URL}/api/certifications`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchCertifications({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Certification"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save certification";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCertification = async (entry: Cert) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/certifications/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Certification"));
      await fetchCertifications({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete certification";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Certifications" description="Industry certifications." onAdd={startCreate} addLabel="New cert" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "name", header: "Name" },
          { key: "issuing_organization", header: "Issuer" },
          {
            key: "issue_date",
            header: "Date",
            render: (r) => formatMonthYear(r.issue_date) || "—",
          },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
        onReorder={onReorder}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit certification" : "New certification"}
        onSubmit={onSave}
        submitting={saving}
      >
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Issuing organization">
          <Input
            value={form.issuing_organization}
            onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })}
          />
        </Field>
        <Field label="Issue date">
          <MonthPicker
            value={form.issue_date}
            onChange={(issue_date) => setForm({ ...form, issue_date })}
            placeholder="Select issue date"
          />
        </Field>
        <Field label="Credential URL">
          <Input
            value={form.credential_url}
            onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
          />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.name}"?`}
        confirming={deleting}
        onConfirm={() => confirm && deleteCertification(confirm)}
      />
    </div>
  );
}
