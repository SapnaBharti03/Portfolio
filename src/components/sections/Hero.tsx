import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypingText } from "@/components/portfolio/TypingText";
import { SocialIcons } from "@/components/portfolio/SocialIcons";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface Profile {
  name: string; title: string; roles: string[]; tagline: string; photo: string; cv_url: string;
}
interface Social { id: number; platform: string; url: string; icon: string }

export function Hero() {
  const { data: profile, loading } = useResource<Profile>("profile");
  const { data: socials } = useResource<Social[]>("social-links");

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-glow/20 blur-[120px] animate-glow-pulse pointer-events-none" />

      <div className="container relative grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium tracking-widest uppercase">
            <span className="h-2 w-2 rounded-full bg-success animate-glow-pulse" />
            Available for new projects
          </span>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold mt-6 tracking-tight leading-[1.05]">
            Hi, I'm <span className="text-gradient">{loading ? "…" : profile?.name}</span>
            <br />
            <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl font-normal">
              {profile?.roles?.length ? (
                <TypingText words={profile.roles} />
              ) : (
                "Full Stack Developer"
              )}
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            {loading ? "Loading…" : profile?.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={() => scrollTo("#projects")}>
              View My Work <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="xl" onClick={() => scrollTo("#contact")}>
              Hire Me
            </Button>
            {profile?.cv_url && (
              <Button variant="ghost" size="xl" asChild>
                <a href={profile.cv_url}><Download className="h-4 w-4" /> Download CV</a>
              </Button>
            )}
          </div>

          <div className="mt-10 flex items-center gap-6">
            {socials && <SocialIcons items={socials} />}
            <div className="h-px flex-1 bg-border" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-2xl opacity-40 animate-glow-pulse" />
            <div className="relative w-72 h-96 sm:w-80 sm:h-[440px] rounded-3xl overflow-hidden glass shadow-elegant animate-float">
              {loading || !profile ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  width={768}
                  height={896}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Floating stat chip */}
            <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-card hidden sm:block">
              <div className="text-xs text-muted-foreground">Currently</div>
              <div className="text-sm font-medium">Open to freelance ✦</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}