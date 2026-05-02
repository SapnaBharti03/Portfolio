import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { SocialIcons } from "@/components/portfolio/SocialIcons";
import { useResource } from "@/hooks/useResource";
import { postContact } from "@/lib/api";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message is too short").max(2000),
});

interface Profile { email: string; phone: string; location: string }
interface Social { id: number; platform: string; url: string; icon: string }

export function Contact() {
  const { data: profile } = useResource<Profile>("profile");
  const { data: socials } = useResource<Social[]>("social-links");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await postContact(result.data as { name: string; email: string; subject: string; message: string });
      toast.success(fun.contactSent());
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error(fun.error());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Contact" title="Let's build something" description="Have a project in mind? Drop me a message." />

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-7 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow shrink-0"><Mail className="h-4 w-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div>
                <a href={`mailto:${profile?.email}`} className="text-sm hover:text-primary transition-colors">{profile?.email ?? "—"}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow shrink-0"><Phone className="h-4 w-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Phone</div>
                <a href={`tel:${profile?.phone}`} className="text-sm hover:text-primary transition-colors">{profile?.phone ?? "—"}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow shrink-0"><MapPin className="h-4 w-4" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Location</div>
                <div className="text-sm">{profile?.location ?? "—"}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4 text-success" />
                I typically reply within 24 hours.
              </div>
              {socials && <SocialIcons items={socials} size="sm" />}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={submit}
            className="glass rounded-3xl p-7 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                <Input
                  className="mt-1.5 bg-secondary/40 border-border h-11"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                <Input
                  type="email"
                  className="mt-1.5 bg-secondary/40 border-border h-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Subject</label>
              <Input
                className="mt-1.5 bg-secondary/40 border-border h-11"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="What's this about?"
              />
              {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
              <Textarea
                rows={6}
                className="mt-1.5 bg-secondary/40 border-border resize-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me about your project…"
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}