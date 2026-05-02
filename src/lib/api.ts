import axios from "axios";
import { API_BASE_URL, TOKEN_KEY, USE_MOCK_API } from "@/config";
import * as mock from "@/data/mockData";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((cfg) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Public, mock-aware fetcher. When USE_MOCK_API is true, it returns local data
// after a small simulated network delay so loading skeletons behave naturally.
export async function fetchResource<T>(resource: string): Promise<T> {
  if (USE_MOCK_API) {
    await delay(400);
    const map: Record<string, unknown> = {
      profile: mock.profile,
      "social-links": mock.socialLinks,
      skills: mock.skills,
      projects: mock.projects,
      services: mock.services,
      experience: mock.experience,
      education: mock.education,
      certifications: mock.certifications,
      testimonials: mock.testimonials,
      blog: mock.blogPosts,
    };
    if (!(resource in map)) throw new Error(`Unknown mock resource: ${resource}`);
    return map[resource] as T;
  }
  const { data } = await apiClient.get(`/${resource}`);
  return data as T;
}

export async function postContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (USE_MOCK_API) {
    await delay(600);
    return { ok: true };
  }
  const { data } = await apiClient.post("/contact", payload);
  return data;
}