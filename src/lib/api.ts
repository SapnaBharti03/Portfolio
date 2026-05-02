import axios from "axios";
import { API_BASE_URL, TOKEN_KEY, USE_MOCK_API } from "@/config";
import { loadResource, saveResource, ResourceKey } from "@/admin/store";

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
    const valid: ResourceKey[] = [
      "profile",
      "social-links",
      "skills",
      "projects",
      "services",
      "experience",
      "education",
      "certifications",
      "testimonials",
      "blog",
      "messages",
    ];
    if (!valid.includes(resource as ResourceKey)) {
      throw new Error(`Unknown mock resource: ${resource}`);
    }
    return loadResource<T>(resource as ResourceKey);
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
    type Msg = {
      id: number;
      name: string;
      email: string;
      subject: string;
      message: string;
      created_at: string;
      read: boolean;
    };
    const list = loadResource<Msg[]>("messages");
    const id = list.reduce((m, it) => Math.max(m, it.id), 0) + 1;
    const next: Msg[] = [
      { id, ...payload, created_at: new Date().toISOString(), read: false },
      ...list,
    ];
    saveResource("messages", next);
    return { ok: true };
  }
  const { data } = await apiClient.post("/contact", payload);
  return data;
}