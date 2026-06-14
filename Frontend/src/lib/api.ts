import axios from "axios";
import { normalizeProfile, type Profile } from "@/lib/profile";

const apiBase = () => {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  if (!base) throw new Error("VITE_API_URL is not configured");
  return base;
};

const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const getResponseValue = (resource: string, data: Record<string, unknown>) => {
  const key = resource.replace(/-/g, "_");
  return data[resource] ?? data[key] ?? data;
};

export type HomeData = {
  profile: Profile | null;
  projects: unknown[];
  skills: unknown[];
  services: unknown[];
  experience: unknown[];
  education: unknown[];
  certifications: unknown[];
  testimonials: unknown[];
  blog: unknown[];
  "social-links": unknown[];
};

export const HOME_RESOURCE_KEYS: Record<string, keyof HomeData> = {
  profile: "profile",
  projects: "projects",
  skills: "skills",
  services: "services",
  experience: "experience",
  education: "education",
  certifications: "certifications",
  testimonials: "testimonials",
  blog: "blog",
  "social-links": "social-links",
};

export function normalizeResourceValue<T>(resource: string, raw: unknown): T {
  if (resource === "profile") {
    if (!raw || typeof raw !== "object") return null as T;
    return normalizeProfile(raw as Record<string, unknown>) as T;
  }

  let value = raw as T;

  if (resource === "testimonials" && Array.isArray(value)) {
    return value.map((row) => {
      const item = row as Record<string, unknown>;
      return {
        ...item,
        client_photo: item.client_photo ?? item.client_photo_url,
      };
    }) as T;
  }

  if (resource === "blog" && Array.isArray(value)) {
    return value
      .filter((row) => {
        const item = row as Record<string, unknown>;
        const status = String(item.status ?? "Published").toLowerCase();
        return status !== "draft";
      })
      .map((row) => {
        const item = row as Record<string, unknown>;
        return {
          ...item,
          cover_image: item.cover_image ?? item.cover_image_url,
          published_at: item.published_at != null ? String(item.published_at).slice(0, 10) : "",
          tags: parseJsonArray(item.tags),
        };
      }) as T;
  }

  if (resource === "projects" && Array.isArray(value)) {
    return value.map((row) => {
      const item = row as Record<string, unknown>;
      return {
        ...item,
        cover_image: item.cover_image ?? item.cover_image_url,
        tech_stack: parseJsonArray(item.tech_stack),
        images: parseJsonArray(item.images),
      };
    }) as T;
  }

  return value;
}

export async function fetchHomeData(): Promise<HomeData> {
  const { data } = await axios.get(`${apiBase()}/api/home`);
  const body = data as Record<string, unknown>;
  return {
    profile: body.profile
      ? normalizeProfile(body.profile as Record<string, unknown>)
      : null,
    projects: normalizeResourceValue("projects", body.projects ?? []),
    skills: normalizeResourceValue("skills", body.skills ?? []),
    services: normalizeResourceValue("services", body.services ?? []),
    experience: normalizeResourceValue("experience", body.experience ?? []),
    education: normalizeResourceValue("education", body.education ?? []),
    certifications: normalizeResourceValue("certifications", body.certifications ?? []),
    testimonials: normalizeResourceValue("testimonials", body.testimonials ?? []),
    blog: normalizeResourceValue("blog", body.blog_posts ?? []),
    "social-links": normalizeResourceValue("social-links", body.social_links ?? []),
  };
}

export async function fetchResource<T>(resource: string): Promise<T> {
  const base = apiBase();
  const apiPath = resource === "blog" ? "blog-posts" : resource;
  try {
    const { data } = await axios.get(`${base}/api/${apiPath}`);
    if (resource === "profile") {
      const row = (data as { profile?: Record<string, unknown> }).profile;
      if (!row) return null as T;
      return normalizeProfile(row) as T;
    }
    const value = (resource === "blog" ? data.blog_posts : getResponseValue(resource, data)) as unknown;
    return normalizeResourceValue<T>(resource, value);
  } catch (err) {
    if (resource === "profile" && axios.isAxiosError(err) && err.response?.status === 404) {
      return null as T;
    }
    throw err;
  }
}

export async function postContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { data } = await axios.post(`${apiBase()}/api/contact`, payload);
  return data;
}
