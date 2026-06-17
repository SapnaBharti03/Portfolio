/** Shared profile shape for public site and admin (API-normalized). */
export interface Profile {
  id?: string;
  name: string;
  title: string;
  roles: string[];
  tagline: string;
  bio: string[];
  photo: string;
  cv_url: string;
  years_of_experience: number;
  projects_completed: number;
  happy_clients: number;
  technologies_count: number;
  email: string;
  phone: string;
  location: string;
  /* job-focused info cards */
  experience_summary: string;
  stack: string[];
  availability: string;
  skill_tags: string[];
}

export const emptyProfile = (): Profile => ({
  name: "",
  title: "",
  roles: [],
  tagline: "",
  bio: [],
  photo: "",
  cv_url: "",
  years_of_experience: 0,
  projects_completed: 0,
  happy_clients: 0,
  technologies_count: 0,
  email: "",
  phone: "",
  location: "",
  experience_summary: "",
  stack: [],
  availability: "",
  skill_tags: [],
});

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* plain text */
  }
  return value.split("\n").map((s) => s.trim()).filter(Boolean);
}

/** Map API row (photo_url, JSON fields) to frontend Profile. */
export function normalizeProfile(raw: Record<string, unknown>): Profile {
  return {
    id: raw.id != null ? String(raw.id) : undefined,
    name: String(raw.name ?? ""),
    title: String(raw.title ?? ""),
    roles: parseStringArray(raw.roles),
    tagline: String(raw.tagline ?? ""),
    bio: parseStringArray(raw.bio),
    photo: String(raw.photo ?? raw.photo_url ?? ""),
    cv_url: String(raw.cv_url ?? ""),
    years_of_experience: Number(raw.years_of_experience ?? 0),
    projects_completed: Number(raw.projects_completed ?? 0),
    happy_clients: Number(raw.happy_clients ?? 0),
    technologies_count: Number(raw.technologies_count ?? 0),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    location: String(raw.location ?? ""),
    experience_summary: String(raw.experience_summary ?? ""),
    stack: parseStringArray(raw.stack),
    availability: String(raw.availability ?? ""),
    skill_tags: parseStringArray(raw.skill_tags),
  };
}

/** Body for POST/PUT /api/profile */
export function profileToApiPayload(form: Profile) {
  return {
    name: form.name.trim(),
    title: form.title.trim(),
    roles: form.roles,
    tagline: form.tagline.trim(),
    bio: form.bio,
    photo_url: form.photo,
    cv_url: form.cv_url.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: form.location.trim(),
    years_of_experience: form.years_of_experience,
    projects_completed: form.projects_completed,
    happy_clients: form.happy_clients,
    technologies_count: form.technologies_count,
    experience_summary: form.experience_summary.trim(),
    stack: form.stack,
    availability: form.availability.trim(),
    skill_tags: form.skill_tags,
  };
}
