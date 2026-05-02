import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface Project {
  id: number; title: string; short_description: string; full_description: string;
  category: string; tech_stack: string[]; cover_image: string; images: string[];
  live_url: string; github_url: string; is_featured: boolean;
  challenges?: string; results?: string;
}

export function Projects() {
  const { data, loading } = useResource<Project[]>("projects");
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    (data ?? []).forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [data]);

  const filtered = (data ?? []).filter((p) => filter === "All" || p.category === filter);

  return (
    <section id="projects" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Projects" title="Selected work" description="A handful of projects I'm proud of." />

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                filter === c
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => (
                <motion.button
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setActive(p)}
                  className="group text-left glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
                    {p.is_featured && (
                      <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-primary mb-2 tracking-widest uppercase">{p.category}</div>
                    <h3 className="font-display font-semibold text-xl">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech_stack.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-elegant"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl">
                <img src={active.cover_image} alt={active.title} className="w-full h-full object-cover" />
                <button
                  className="absolute top-3 right-3 h-9 w-9 rounded-full glass grid place-items-center hover:text-primary"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs text-primary mb-2 tracking-widest uppercase">{active.category}</div>
                <h3 className="font-display font-semibold text-3xl">{active.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{active.full_description}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {active.tech_stack.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">{t}</span>
                  ))}
                </div>

                {(active.challenges || active.results) && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    {active.challenges && (
                      <div className="rounded-xl border border-border p-4">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Challenges</div>
                        <p className="text-sm">{active.challenges}</p>
                      </div>
                    )}
                    {active.results && (
                      <div className="rounded-xl border border-border p-4">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Results</div>
                        <p className="text-sm">{active.results}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  {active.live_url && (
                    <Button variant="hero" asChild><a href={active.live_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Live</a></Button>
                  )}
                  {active.github_url && (
                    <Button variant="glass" asChild><a href={active.github_url} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /> GitHub</a></Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}