export const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Framework & Libraries",
  "Database",
  "DevOps",
  "Tools",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export function skillCategoryOptions(current?: string): string[] {
  if (current && !(SKILL_CATEGORIES as readonly string[]).includes(current)) {
    return [current, ...SKILL_CATEGORIES];
  }
  return [...SKILL_CATEGORIES];
}
