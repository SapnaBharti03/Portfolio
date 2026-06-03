import axios from "axios";
import { normalizeProfile } from "@/lib/profile";

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
    let value = (resource === "blog" ? data.blog_posts : getResponseValue(resource, data)) as T;
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
