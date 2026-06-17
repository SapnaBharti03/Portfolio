import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

interface Profile {
  name: string;
  bio: string[];
  photo: string;
  cv_url: string;
  location: string;
  experience_summary: string;
  stack: string[];
  availability: string;
  skill_tags: string[];
}

const scrollTo = (id: string) =>
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

export function About() {
  const { data: raw, loading } = useResource<Profile>("profile");

  const profile: Profile = raw ?? {
    name: "Developer",
    bio: [
      "I build full-stack products that people love to use. From zero to deploy, I care about every layer — clean APIs, solid databases, and interfaces that feel effortless.",
      "Right now I'm focused on modern React ecosystems and scalable backends. I thrive in teams that move fast, ship often, and sweat the details.",
    ],
    photo: "",
    cv_url: "",
    location: "Remote / Worldwide",
    experience_summary: "5+ years, full-stack",
    stack: ["React", "Node.js", "PostgreSQL"],
    availability: "Immediate",
    skill_tags: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "AWS",
    ],
  };

  const cards = [
    {
      label: "Experience",
      value: profile.experience_summary || `${profile.years_of_experience ?? 0}+ years, full-stack`,
    },
    {
      label: "Stack",
      value:
        profile.stack?.length
          ? profile.stack.join(" · ")
          : "React · Node.js · PostgreSQL",
    },
    {
      label: "Location",
      value: profile.location || "Remote / Worldwide",
    },
    {
      label: "Availability",
      value: profile.availability || "Immediate",
    },
  ];

  const tags = profile.skill_tags?.length
    ? profile.skill_tags
    : ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker"];

  return (
    <section id="about" className="py-28 relative">
      <div className="container">
        <SectionHeading
          eyebrow="About"
          title="A bit about me"
          description="Engineer, problem-solver, and product-minded collaborator."
        />

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative max-w-md mx-auto lg:mx-0"
          >
            <div className="absolute -inset-3 bg-gradient-primary rounded-3xl blur-xl opacity-30" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass shadow-elegant">
              {loading && !profile.photo ? (
                <Skeleton className="w-full h-full" />
              ) : profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
          </motion.div>

          {/* Bio + Info Cards + Tags + CTAs */}
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
                {profile.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                    {card.label}
                  </div>
                  <div className="text-lg md:text-xl font-semibold text-foreground leading-snug">
                    {card.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Skill tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-border bg-surface/60 text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              {profile.cv_url && (
                <Button variant="hero" size="lg" asChild>
                  <a
                    href={profile.cv_url}
                    onClick={() => toast(fun.cvDownload())}
                  >
                    <Download className="h-4 w-4" /> Download CV
                  </a>
                </Button>
              )}
              <Button
                variant="glass"
                size="lg"
                onClick={() => {
                  toast(fun.getInTouch());
                  scrollTo("#contact");
                }}
              >
                <Mail className="h-4 w-4" /> Get in touch
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
