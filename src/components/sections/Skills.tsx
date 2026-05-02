import { motion } from "framer-motion";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface Skill { id: number; name: string; category: string; proficiency: number }
const order = ["Frontend", "Backend", "Database", "DevOps", "Tools"];

export function Skills() {
  const { data, loading } = useResource<Skill[]>("skills");

  const grouped = (data ?? []).reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Skills" title="The toolbox" description="Technologies I reach for to ship great products." />

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {order
              .filter((cat) => grouped[cat]?.length)
              .map((cat, idx) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-6 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-display font-semibold text-lg mb-5">{cat}</h3>
                  <div className="space-y-4">
                    {grouped[cat].map((s) => (
                      <div key={s.id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground tabular-nums">{s.proficiency}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${s.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full bg-gradient-primary rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}