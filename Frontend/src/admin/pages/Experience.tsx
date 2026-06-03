import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

const BASE_URL = import.meta.env.VITE_API_URL;

interface Experience {
  id: number | string;
  company_name: string;
  role: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  achievements: string[];
  display_order?: number;
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

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function parseAchievements(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : value ? [value] : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function normalizeExperience(row: Record<string, unknown>): Experience {
  return {
    id: row.id as number | string,
    company_name: String(row.company_name ?? ""),
    role: String(row.role ?? ""),
    employment_type: String(row.employment_type ?? ""),
    start_date: row.start_date != null ? toMonthInputValue(String(row.start_date)) : "",
    end_date: row.end_date != null ? toMonthInputValue(String(row.end_date)) : "",
    is_current: Boolean(row.is_current),
    description: String(row.description ?? ""),
    achievements: parseAchievements(row.achievements),
    display_order: row.display_order != null ? Number(row.display_order) : 0,
  };
}

export default function ExperienceAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchExperience = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/experience`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch experience");
      }
      const data = await res.json();
      const rows = (data.experience ?? []).map((row: Record<string, unknown>) =>
        normalizeExperience(row),
      );
      setItems(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load experience";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Experience) => {
    setEditing(x);
    setForm({
      company_name: x.company_name,
      role: x.role,
      employment_type: x.employment_type,
      start_date: x.start_date,
      end_date: x.end_date,
      is_current: x.is_current,
      description: x.description,
      achievements: [...x.achievements],
    });
    setOpen(true);
  };

  const payload = () => ({
    company_name: form.company_name,
    role: form.role,
    employment_type: form.employment_type,
    start_date: monthInputToApiDate(form.start_date),
    end_date: form.is_current ? null : monthInputToApiDate(form.end_date),
    is_current: form.is_current,
    description: form.description,
    achievements: form.achievements,
    display_order: editing?.display_order ?? 0,
  });

  const onSave = async () => {
    if (!form.company_name.trim() || !form.role.trim()) {
      return toast.error("Company and role required");
    }
    if (!form.start_date.trim()) {
      return toast.error("Start date is required");
    }
    if (!monthInputToApiDate(form.start_date)) {
      return toast.error("Invalid start date");
    }
    if (!form.is_current && form.end_date.trim() && !monthInputToApiDate(form.end_date)) {
      return toast.error("Invalid end date");
    }
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/experience/${editing.id}`
        : `${BASE_URL}/api/experience`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchExperience({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Experience"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save experience";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (entry: Experience) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/experience/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Experience"));
      await fetchExperience({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete experience";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Experience" description="Work history and achievements." onAdd={startCreate} addLabel="New entry" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "role", header: "Role" },
          { key: "company_name", header: "Company" },
          {
            key: "period",
            header: "Period",
            render: (r) =>
              `${formatMonthYear(r.start_date)} – ${r.is_current ? "Present" : formatMonthYear(r.end_date) || "—"}`,
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
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit experience" : "New experience"}
        onSubmit={onSave}
        submitting={saving}
      >
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
            <MonthPicker
              value={form.start_date}
              onChange={(start_date) => setForm({ ...form, start_date })}
              placeholder="Select start date"
            />
          </Field>
          <Field label="End date">
            <MonthPicker
              value={form.end_date}
              onChange={(end_date) => setForm({ ...form, end_date })}
              disabled={form.is_current}
              placeholder="Select end date"
            />
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
          <Switch
            checked={form.is_current}
            onCheckedChange={(v) => setForm({ ...form, is_current: v, end_date: v ? "" : form.end_date })}
          />
        </div>
      </FormDialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete "${confirm?.role} @ ${confirm?.company_name}"?`}
        confirming={deleting}
        onConfirm={() => confirm && deleteExperience(confirm)}
      />
    </div>
  );
}
