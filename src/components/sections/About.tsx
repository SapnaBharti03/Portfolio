import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Counter } from "@/components/portfolio/Counter";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface Profile {
  name: string; bio: string[]; photo: string; cv_url: string;
  years_of_experience: number; projects_completed: number; happy_clients: number; technologies_count: number;
}

export function About() {
  const { data: profile, loading } = useResource<Profile>("profile");

  const stats = profile
    ? [
        { label: "Years Experience", value: profile.years_of_experience, suffix: "+" },
        { label: "Projects Completed", value: profile.projects_completed, suffix: "+" },
        { label: "Happy Clients", value: profile.happy_clients, suffix: "" },
        { label: "Technologies", value: profile.technologies_count, suffix: "+" },
      ]
    : [];

  return (
    <section id="about" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="About" title="A bit about me" description="Engineer, problem-solver, and product-minded collaborator." />

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative max-w-md mx-auto lg:mx-0"
          >
            <div className="absolute -inset-3 bg-gradient-primary rounded-3xl blur-xl opacity-30" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass shadow-elegant">
              {loading || !profile ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-10/12" />
              </div>
            ) : (
              <div className="space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
                {profile?.bio.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-5">
                  <div className="text-3xl md:text-4xl font-semibold text-gradient">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {profile?.cv_url && (
              <Button variant="hero" size="lg" className="mt-8" asChild>
                <a href={profile.cv_url}><Download className="h-4 w-4" /> Download CV</a>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}