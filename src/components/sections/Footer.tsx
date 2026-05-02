import { SocialIcons } from "@/components/portfolio/SocialIcons";
import { useResource } from "@/hooks/useResource";
import { SITE } from "@/config";

interface Profile { name: string; tagline: string }
interface Social { id: number; platform: string; url: string; icon: string }

const links = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const { data: profile } = useResource<Profile>("profile");
  const { data: socials } = useResource<Social[]>("social-links");

  return (
    <footer className="relative border-t border-border mt-20">
      <div className="container py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground">{SITE.brand[0]}</span>
            <span className="font-display font-semibold text-lg">{profile?.name ?? SITE.brand}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">{profile?.tagline}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Navigate</h4>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-primary transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Connect</h4>
          {socials && <SocialIcons items={socials} size="sm" />}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {profile?.name ?? SITE.brand}. All rights reserved.</span>
          <span>Crafted with care · React + Tailwind + Framer Motion</span>
        </div>
      </div>
    </footer>
  );
}