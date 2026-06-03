import { motion } from "framer-motion";
import { GraduationCap, Award, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { useResource } from "@/hooks/useResource";
import { formatMonthYear } from "@/lib/dates";

interface Edu {
  id: number | string;
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number;
  end_year: number;
  description?: string;
}
interface Cert {
  id: number | string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url?: string;
}

export function EducationCerts() {
  const { data: edu, loading: loadingEdu } = useResource<Edu[]>("education");
  const { data: certs, loading: loadingCerts } = useResource<Cert[]>("certifications");
  const loading = loadingEdu || loadingCerts;
  const hasEdu = (edu?.length ?? 0) > 0;
  const hasCerts = (certs?.length ?? 0) > 0;

  if (loading || (!hasEdu && !hasCerts)) return null;

  return (
    <section id="education" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Education" title="Education & certifications" />

        <div className={`grid gap-8 ${hasEdu && hasCerts ? "lg:grid-cols-2" : "max-w-2xl mx-auto"}`}>
          {hasEdu && (
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
          )}

          {hasCerts && (
          <div>
            <div className="flex items-center gap-2 mb-5 text-primary"><Award className="h-5 w-5" /><h3 className="font-display font-semibold">Certifications</h3></div>
            <div className="space-y-4">
              {certs?.map((c, idx) => {
                const hasLink = Boolean(c.credential_url?.trim());
                const card = (
                  <>
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        {c.issuing_organization} · {formatMonthYear(c.issue_date)}
                      </div>
                    </div>
                    {hasLink && (
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </>
                );
                const motionProps = {
                  key: c.id,
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: idx * 0.05 },
                  className: `glass rounded-2xl p-6 flex items-center justify-between gap-4 transition-colors ${
                    hasLink ? "hover:border-primary/50 group" : ""
                  }`,
                };

                return hasLink ? (
                  <motion.a
                    {...motionProps}
                    href={c.credential_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {card}
                  </motion.a>
                ) : (
                  <motion.div {...motionProps}>{card}</motion.div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}