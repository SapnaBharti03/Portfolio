import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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

interface Social {
  id: number | string;
  platform: string;
  url: string;
  icon: string;
}

const empty: Omit<Social, "id"> = { platform: "", url: "", icon: "" };

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizeSocial(row: Record<string, unknown>): Social {
  return {
    id: row.id as number | string,
    platform: String(row.platform ?? ""),
    url: String(row.url ?? ""),
    icon: String(row.icon ?? ""),
  };
}

export default function SocialAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Social[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Social | null>(null);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState<Social | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const onReorder = useCrudReorder("social-links", items, setItems, session?.access_token);

  const fetchSocialLinks = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${BASE_URL}/api/social-links`, { headers });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Failed to fetch social links");
      }
      const data = await res.json();
      const rows = (data.social_links ?? []).map((row: Record<string, unknown>) => normalizeSocial(row));
      setItems(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load social links";
      toast.error(message);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, [session?.access_token]);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (x: Social) => {
    setEditing(x);
    setForm({
      platform: x.platform,
      url: x.url,
      icon: x.icon,
    });
    setOpen(true);
  };

  const payload = () => ({
    platform: form.platform,
    url: form.url,
    icon: form.icon,
  });

  const onSave = async () => {
    if (!form.platform.trim() || !form.url.trim()) return toast.error("Platform and URL required");
    if (!session?.access_token) return toast.error("Not authenticated");

    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${BASE_URL}/api/social-links/${editing.id}`
        : `${BASE_URL}/api/social-links`;
      const res = await fetch(url, {
        method,
        headers: authHeaders(session.access_token),
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `${editing ? "Update" : "Create"} failed`);
      }
      await fetchSocialLinks({ silent: true });
      toast.success(fun[editing ? "updated" : "created"]("Link"));
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save link";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSocialLink = async (entry: Social) => {
    if (!session?.access_token) return toast.error("Not authenticated");
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/social-links/${entry.id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? "Delete failed");
      }
      toast.success(fun.deleted("Link"));
      await fetchSocialLinks({ silent: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not delete link";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader title="Social Links" description="Where people can find you." onAdd={startCreate} addLabel="New link" />
      <CrudTable
        loading={loading}
        rows={items}
        columns={[
          { key: "platform", header: "Platform" },
          { key: "url", header: "URL", render: (r) => <span className="text-muted-foreground truncate">{r.url}</span> },
          { key: "icon", header: "Icon" },
        ]}
        onEdit={startEdit}
        onDelete={(x) => setConfirm(x)}
        onReorder={onReorder}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit link" : "New link"}
        onSubmit={onSave}
        submitting={saving}
      >
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
        confirming={deleting}
        onConfirm={() => confirm && deleteSocialLink(confirm)}
      />
    </div>
  );
}
