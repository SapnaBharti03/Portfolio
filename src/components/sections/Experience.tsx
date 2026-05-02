import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface Exp {
  id: number; company_name: string; role: string; employment_type: string;
  start_date: string; end_date: string; is_current: boolean;
  description: string; achievements: string[];
}

export function Experience() {
  const { data, loading } = useResource<Exp[]>("experience");

  return (
    <section id="experience" className="py-28 relative">
      <div className="container max-w-4xl">
        <SectionHeading eyebrow="Experience" title="Where I've worked" description="A timeline of roles and the impact along the way." />

        {loading ? (
          <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
        ) : (
          <div className="relative pl-6 sm:pl-10">
            <div className="absolute left-2 sm:left-4 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-10">
              {data?.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="relative"
                >
                  <div className="absolute -left-[22px] sm:-left-[34px] top-1 h-9 w-9 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
                    <Briefcase className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display font-semibold text-xl">{e.role}</h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {e.start_date} — {e.is_current ? "Present" : e.end_date}
                      </span>
                    </div>
                    <div className="text-primary text-sm mt-1">
                      {e.company_name} <span className="text-muted-foreground">· {e.employment_type}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{e.description}</p>
                    {e.achievements?.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {e.achievements.map((a, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-primary mt-0.5">▸</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}