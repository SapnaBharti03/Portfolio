import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/admin/components/Field";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { useSingleton } from "@/admin/store";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { z } from "zod";

interface ProfileData {
  name: string;
  title: string;
  roles: string[];
  tagline: string;
  bio: string[];
  photo: string;
  cv_url: string;
  years_of_experience: number;
  projects_completed: number;
  happy_clients: number;
  technologies_count: number;
  email: string;
  phone: string;
  location: string;
}

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
});

export default function ProfilePage() {
  const { data, save } = useSingleton<ProfileData>("profile");
  const [form, setForm] = useState<ProfileData>(data);

  useEffect(() => setForm(data), [data]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    save(form);
    toast.success(fun.updated("Profile"));
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your hero, about, and contact info.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-border bg-surface/40 p-6">
        <Field label="Photo">
          <ImageUpload value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
        </div>
        <Field label="Roles (comma separated)">
          <Input
            value={form.roles.join(", ")}
            onChange={(e) => setForm({ ...form, roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
        </Field>
        <Field label="Tagline">
          <Textarea rows={2} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </Field>
        <Field label="Bio (one paragraph per line)">
          <Textarea
            rows={5}
            value={form.bio.join("\n")}
            onChange={(e) => setForm({ ...form, bio: e.target.value.split("\n").filter(Boolean) })}
          />
        </Field>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Years exp.">
            <Input
              type="number"
              value={form.years_of_experience}
              onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })}
            />
          </Field>
          <Field label="Projects">
            <Input
              type="number"
              value={form.projects_completed}
              onChange={(e) => setForm({ ...form, projects_completed: Number(e.target.value) })}
            />
          </Field>
          <Field label="Clients">
            <Input
              type="number"
              value={form.happy_clients}
              onChange={(e) => setForm({ ...form, happy_clients: Number(e.target.value) })}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
        </div>
        <Field label="CV URL">
          <Input value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" variant="hero">Save changes</Button>
        </div>
      </form>
    </div>
  );
}