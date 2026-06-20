import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypingText } from "@/components/portfolio/TypingText";
import { SocialIcons } from "@/components/portfolio/SocialIcons";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";
import { SITE } from "@/config";

interface Profile {
  name: string; title: string; roles: string[]; tagline: string; photo: string; cv_url: string;
}
interface Social { id: number; platform: string; url: string; icon: string }

export function Hero() {
  const { data: profile, loading } = useResource<Profile>("profile");
  const { data: socials } = useResource<Social[]>("social-links");

  const displayName = profile?.name?.trim() || SITE.fallbackName;
  const displayTagline = profile?.tagline?.trim() || SITE.description;
  const showPhoto = Boolean(profile?.photo);

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const handleDownloadCv = () => {
    toast(fun.cvDownload());

    if (profile?.cv_url) {
      window.open(profile.cv_url, "_blank", "noopener,noreferrer");
      return;
    }

    const resumeText = [
      displayName,
      profile?.title?.trim() || "UI/UX Designer",
      "",
      "About",
      displayTagline,
      "",
      "Roles",
      ...(profile?.roles?.length ? profile.roles : ["UI/UX Designer", "Full Stack Developer"]),
      "",
      `Photo: ${profile?.photo ? "Available" : "Not set"}`,
    ].join("\n");

    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${(displayName || "Sapna Bharti").replace(/\s+/g, "_")}_CV.txt`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

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
            Hi, I'm <span className="text-gradient">{displayName}</span>
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
            {displayTagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={() => { toast(fun.viewWork()); scrollTo("#projects"); }}>
              View My Work <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="xl" onClick={() => { toast(fun.hireMe()); scrollTo("#contact"); }}>
              Hire Me
            </Button>
            <Button variant="ghost" size="xl" onClick={handleDownloadCv}>
              <Download className="h-4 w-4" /> Download CV
            </Button>
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
              {loading && !showPhoto ? (
                <Skeleton className="w-full h-full" />
              ) : showPhoto ? (
                <img
                  src={profile!.photo}
                  alt={displayName}
                  width={768}
                  height={896}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Floating stat chip — toggle via SITE.showFreelanceBadge */}
            <div className={`absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-card hidden sm:block ${SITE.showFreelanceBadge ? "" : "!hidden"}`}>
              <div className="text-xs text-muted-foreground">Currently</div>
              <div className="text-sm font-medium">Open to freelance ✦</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}