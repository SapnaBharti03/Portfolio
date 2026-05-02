import { Github, Linkedin, Twitter, Instagram, Globe } from "lucide-react";

const map: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
};

interface Social { id: number; platform: string; url: string; icon: string }

export function SocialIcons({ items, size = "default" }: { items: Social[]; size?: "default" | "sm" }) {
  const dims = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="flex items-center gap-3">
      {items.map((s) => {
        const Icon = map[s.icon] ?? Globe;
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            aria-label={s.platform}
            className={`${dims} grid place-items-center rounded-full glass text-muted-foreground hover:text-primary hover:border-primary/60 transition-all hover:-translate-y-0.5`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}