import { motion } from "framer-motion";
import { GraduationCap, Award, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { useResource } from "@/hooks/useResource";

interface Edu { id: number; degree: string; field_of_study: string; institution: string; start_year: number; end_year: number; description?: string }
interface Cert { id: number; name: string; issuing_organization: string; issue_date: string; credential_url?: string }

export function EducationCerts() {
  const { data: edu } = useResource<Edu[]>("education");
  const { data: certs } = useResource<Cert[]>("certifications");

  return (
    <section id="education" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Education" title="Education & certifications" />

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-5 text-primary"><GraduationCap className="h-5 w-5" /><h3 className="font-display font-semibold">Education</h3></div>
            <div className="space-y-4">
              {edu?.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex justify-between gap-3">
                    <h4 className="font-semibold">{e.degree}</h4>
                    <span className="text-xs text-muted-foreground font-mono">{e.start_year}–{e.end_year}</span>
                  </div>
                  <div className="text-sm text-primary mt-1">{e.institution}</div>
                  {e.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{e.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-5 text-primary"><Award className="h-5 w-5" /><h3 className="font-display font-semibold">Certifications</h3></div>
            <div className="space-y-4">
              {certs?.map((c, idx) => (
                <motion.a
                  href={c.credential_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-primary/50 transition-colors group"
                >
                  <div>
                    <h4 className="font-semibold">{c.name}</h4>
                    <div className="text-sm text-muted-foreground mt-1">{c.issuing_organization} · {c.issue_date}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}