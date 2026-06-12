import matter from "gray-matter";

export type ParsedSkill = {
  name: string;
  slug: string;
  description: string | null;
  content: string;
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function parseSkillFile(source: string): ParsedSkill {
  const { data, content } = matter(source);
  const name = (data?.name ?? "").toString().trim();
  if (!name) throw new Error("Skill file missing `name` in frontmatter");
  const description = data?.description ? String(data.description).trim() : null;
  return {
    name,
    slug: slugify(name),
    description,
    content: content.trim(),
  };
}
