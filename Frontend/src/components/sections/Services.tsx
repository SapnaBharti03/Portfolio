import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { useResource } from "@/hooks/useResource";

interface Service { id: number | string; title: string; description: string; icon: string; starting_price?: string }

export function Services() {
  const { data, loading } = useResource<Service[]>("services");

  if (loading || !(data?.length)) return null;

  return (
    <section id="services" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Services" title="What I can do for you" description="Hand-crafted solutions for teams that care about quality." />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((s, idx) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.Sparkles;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="group glass rounded-2xl p-7 hover:border-primary/50 transition-all relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display font-semibold text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  {s.starting_price && (
                    <div className="mt-5 pt-4 border-t border-border text-sm">
                      <span className="text-muted-foreground">Starting at </span>
                      <span className="font-semibold text-foreground">{s.starting_price}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}