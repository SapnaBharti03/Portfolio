export const PROJECT_CATEGORIES = [
  "Web Application",
  "E-commerce Website",
  "Mobile Application",
  "API Development",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export function projectCategoryOptions(current?: string): string[] {
  if (current && !(PROJECT_CATEGORIES as readonly string[]).includes(current)) {
    return [current, ...PROJECT_CATEGORIES];
  }
  return [...PROJECT_CATEGORIES];
}
