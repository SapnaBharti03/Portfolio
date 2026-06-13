import { useEffect } from "react";
import { useResource } from "@/hooks/useResource";
import { SITE } from "@/config";

interface BrandProfile {
  name: string;
  title: string;
}

export function useSiteBranding() {
  const { data: profile, loading } = useResource<BrandProfile>("profile");
  const name = profile?.name?.trim() || SITE.fallbackName;
  const title = profile?.title?.trim() || SITE.fallbackTitle;
  const initial = name.charAt(0).toUpperCase() || "P";

  useEffect(() => {
    document.title = `${name} — ${title}`;
    document.querySelector('meta[name="author"]')?.setAttribute("content", name);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${name} — ${title}`);
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      profile?.title ? `${name} — ${title}. Portfolio, projects, and contact.` : SITE.description,
    );
    document.querySelector('meta[property="og:description"]')?.setAttribute(
      "content",
      profile?.title ? `${name} — ${title}.` : SITE.description,
    );
  }, [name, title, profile?.title]);

  return { profile, loading, name, title, initial };
}
