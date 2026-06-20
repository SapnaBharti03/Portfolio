import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "@/admin/components/Field";
import { ImageUpload, type ImageUploadHandle } from "@/admin/components/ImageUpload";
import { ProfileFormSkeleton } from "@/admin/components/AdminSkeletons";
import { LoadingButton } from "@/admin/components/LoadingButton";
import { useAuth } from "@/contexts/AuthContext";
import { emptyProfile, normalizeProfile, profileToApiPayload, type Profile } from "@/lib/profile";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { z } from "zod";
import { Upload, User, BarChart3, Mail, AlignLeft, Briefcase } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  title: z.string().trim().min(1, "Title is required").max(120),
  email: z.string().trim().email("Valid email is required").max(255),
});

function parseCommaList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 lg:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { session } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<Profile>(() => emptyProfile());
  const [rolesText, setRolesText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvFileName, setCvFileName] = useState("");

  const imgRef = useRef<ImageUploadHandle>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const uploadCv = async (file: File) => {
    if (!session?.access_token) {
      toast.error("Not authenticated");
      return;
    }

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/api/upload?folder=documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body as { error?: string }).error ?? "CV upload failed");

      const url = String((body as { url?: string }).url ?? "");
      if (!url) throw new Error("Upload did not return a file URL");

      setForm((current) => ({ ...current, cv_url: url }));
      setCvFileName(file.name);
      toast.success("CV uploaded");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "CV upload failed");
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const fetchProfile = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`${BASE_URL}/api/profile`);
      if (res.status === 404) {
        setProfileId(null);
        setForm(emptyProfile());
        setRolesText("");
        return;
      }
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error((errorBody as { error?: string }).error ?? "Failed to load profile");
      }
      const data = await res.json();
      const row = (data as { profile?: Record<string, unknown> }).profile;
      if (!row) {
        setProfileId(null);
        setForm(emptyProfile());
        setRolesText("");
        return;
      }
      const normalized = normalizeProfile(row);
      setProfileId(normalized.id ?? null);
      setForm(normalized);
      setRolesText(normalized.roles.join(", "));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not load profile");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!session?.access_token) {
      toast.error("Not authenticated");
      return;
    }

    setSaving(true);
    try {
      const uploadedUrl = await imgRef.current?.triggerUpload();
      const photo = uploadedUrl ?? form.photo;
      const roles = parseCommaList(rolesText);

      const isCreate = !profileId;
      const url = isCreate
        ? `${BASE_URL}/api/profile`
        : `${BASE_URL}/api/profile/${profileId}`;

      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: authHeaders(session.access_token),
        body: JSON.stringify(profileToApiPayload({ ...form, photo, roles })),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? (isCreate ? "Create failed" : "Update failed"));
      }
      const row = (body as { profile?: Record<string, unknown> }).profile;
      if (row) {
        const normalized = normalizeProfile(row);
        setProfileId(normalized.id ?? profileId);
        setForm(normalized);
        setRolesText(normalized.roles.join(", "));
      } else {
        await fetchProfile({ silent: true });
      }
      toast.success(fun[isCreate ? "created" : "updated"]("Profile"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const isCreate = !profileId;

  return (
    <div className="w-full min-h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          {loading
            ? "Loading your profile…"
            : isCreate
              ? "Create your portfolio profile. You can only have one profile; after that, use Save to update."
              : "Update your hero, about, and contact info."}
        </p>
      </div>

      {loading ? (
        <ProfileFormSkeleton />
      ) : (
        <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface/40 overflow-hidden">
          <fieldset disabled={saving} className="divide-y divide-border">
            <Section
              title="Identity"
              description="Photo, name, and headline shown in the hero."
              icon={User}
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <div className="shrink-0 lg:w-44 xl:w-52">
                  <Field label="Photo">
                    <ImageUpload
                      ref={imgRef}
                      folder="profile"
                      value={form.photo}
                      onChange={(v) => setForm({ ...form, photo: v })}
                    />
                  </Field>
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Name">
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </Field>
                    <Field label="Title">
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </Field>
                    <Field label="Tagline" className="sm:col-span-2 lg:col-span-1">
                      <Textarea rows={2} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Roles (comma separated)">
                    <Input
                      value={rolesText}
                      onChange={(e) => setRolesText(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section
              title="About"
              description="Bio paragraphs shown on the about section."
              icon={AlignLeft}
            >
              <Field label="Bio (one paragraph per line)">
                <Textarea
                  rows={5}
                  value={form.bio.join("\n")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bio: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </Field>
            </Section>

            <Section
              title="Job Info"
              description="Cards shown on the about section."
              icon={Briefcase}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Availability">
                  <Input
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    placeholder="e.g. Full-time & freelance"
                  />
                </Field>
                <Field label="Currently learning">
                  <Input
                    value={form.currently_learning}
                    onChange={(e) => setForm({ ...form, currently_learning: e.target.value })}
                    placeholder="e.g. Celery & Redis"
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Stats"
              description="Counters displayed in the hero section."
              icon={BarChart3}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Years exp.">
                  <Input
                    type="number"
                    value={form.years_of_experience}
                    onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Technologies">
                  <Input
                    type="number"
                    value={form.technologies_count}
                    onChange={(e) => setForm({ ...form, technologies_count: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Contact"
              description="How visitors can reach you."
              icon={Mail}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Email">
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label="Location">
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </Field>
                <Field label="CV URL">
                  <div className="space-y-2">
                    <Input value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={cvUploading}
                      >
                        <Upload className="h-4 w-4" />
                        {cvUploading ? "Uploading…" : "Upload CV"}
                      </Button>
                      {cvFileName && <span className="text-xs text-muted-foreground">{cvFileName}</span>}
                    </div>
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadCv(file);
                      }}
                    />
                  </div>
                </Field>
              </div>
            </Section>
          </fieldset>

          <div className="flex justify-end border-t border-border bg-surface/30 px-6 lg:px-8 py-4">
            <LoadingButton type="submit" variant="hero" loading={saving} loadingText="Saving…">
              {isCreate ? "Create profile" : "Save changes"}
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}