import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { CrudTableSkeleton } from "@/admin/components/AdminSkeletons";
import { Mail, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Message {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function MessagesAdmin() {
  const { session } = useAuth();
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState<Message | null>(null);
  const [confirm, setConfirm] = useState<Message | null>(null);

  const fetchMessages = async (opts?: { silent?: boolean }) => {
    if (!session?.access_token) return;
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/messages`, {
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setItems(data.messages ?? []);
    } catch {
      setItems([]);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [session?.access_token]);

  const markRead = async (m: Message) => {
    if (!session?.access_token || m.read) return;
    try {
      await fetch(`${BASE_URL}/api/messages/${m.id}`, {
        method: "PUT",
        headers: authHeaders(session.access_token),
        body: JSON.stringify({ read: true }),
      });
      setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, read: true } : it)));
    } catch {
      toast.error(fun.error());
    }
  };

  const open = (m: Message) => {
    setViewing(m);
    markRead(m);
  };

  const remove = async (id: string | number) => {
    if (!session?.access_token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/messages/${id}`, {
        method: "DELETE",
        headers: authHeaders(session.access_token),
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success(fun.deleted("Message"));
    } catch {
      toast.error(fun.error());
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-sm text-muted-foreground mt-1">Contact form submissions.</p>
      </div>

      {loading ? (
        <CrudTableSkeleton rows={4} columns={3} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/40 px-6 py-16 text-center">
          <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No messages yet. Submissions from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border bg-surface/40 p-4 flex items-start gap-4 ${
                m.read ? "border-border" : "border-primary/40"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{m.name}</p>
                  <span className="text-xs text-muted-foreground">·</span>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  {!m.read && <Badge>New</Badge>}
                </div>
                <p className="text-sm font-medium truncate">{m.subject}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => open(m)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirm(m)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.subject}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="text-sm">
                <p>
                  <span className="text-muted-foreground">From:</span> {viewing.name} ({viewing.email})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(viewing.created_at).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm whitespace-pre-wrap">
                {viewing.message}
              </div>
              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <a href={`mailto:${viewing.email}?subject=Re: ${encodeURIComponent(viewing.subject)}`}>
                    Reply via email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={`Delete message from "${confirm?.name}"?`}
        confirming={deleting}
        onConfirm={async () => {
          if (confirm) await remove(confirm.id);
          setConfirm(null);
        }}
      />
    </div>
  );
}
