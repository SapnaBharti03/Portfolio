import { useEffect, useState, useCallback } from "react";
import * as mock from "@/data/mockData";

const STORAGE_PREFIX = "portfolio_admin_db_";

export type ResourceKey =
  | "profile"
  | "social-links"
  | "skills"
  | "projects"
  | "services"
  | "experience"
  | "education"
  | "certifications"
  | "testimonials"
  | "blog"
  | "messages";

const seedFor = (key: ResourceKey): unknown => {
  switch (key) {
    case "profile":
      return mock.profile;
    case "social-links":
      return mock.socialLinks;
    case "skills":
      return mock.skills;
    case "projects":
      return mock.projects;
    case "services":
      return mock.services;
    case "experience":
      return mock.experience;
    case "education":
      return mock.education;
    case "certifications":
      return mock.certifications;
    case "testimonials":
      return mock.testimonials;
    case "blog":
      return mock.blogPosts;
    case "messages":
      return [] as Array<{
        id: number;
        name: string;
        email: string;
        subject: string;
        message: string;
        created_at: string;
        read: boolean;
      }>;
  }
};

export function loadResource<T>(key: ResourceKey): T {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // fallthrough to seed
    }
  }
  const seed = seedFor(key);
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(seed));
  return seed as T;
}

export function saveResource<T>(key: ResourceKey, value: T) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("admin-store-change", { detail: { key } }));
}

export function useCollection<T extends { id: number | string }>(key: ResourceKey) {
  const [items, setItems] = useState<T[]>(() => loadResource<T[]>(key));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string };
      if (detail?.key === key) setItems(loadResource<T[]>(key));
    };
    window.addEventListener("admin-store-change", handler);
    return () => window.removeEventListener("admin-store-change", handler);
  }, [key]);

  const persist = (next: T[]) => {
    setItems(next);
    saveResource(key, next);
  };

  const create = useCallback(
    (item: Omit<T, "id">) => {
      const next = loadResource<T[]>(key);
      const id = (next.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0) + 1) as T["id"];
      const created = { ...(item as object), id } as T;
      persist([created, ...next]);
      return created;
    },
    [key],
  );

  const update = useCallback(
    (id: T["id"], patch: Partial<T>) => {
      const next = loadResource<T[]>(key).map((it) => (it.id === id ? { ...it, ...patch } : it));
      persist(next);
    },
    [key],
  );

  const remove = useCallback(
    (id: T["id"]) => {
      const next = loadResource<T[]>(key).filter((it) => it.id !== id);
      persist(next);
    },
    [key],
  );

  return { items, create, update, remove };
}

export function useSingleton<T>(key: ResourceKey) {
  const [data, setData] = useState<T>(() => loadResource<T>(key));
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string };
      if (detail?.key === key) setData(loadResource<T>(key));
    };
    window.addEventListener("admin-store-change", handler);
    return () => window.removeEventListener("admin-store-change", handler);
  }, [key]);

  const save = (next: T) => {
    setData(next);
    saveResource(key, next);
  };

  return { data, save };
}