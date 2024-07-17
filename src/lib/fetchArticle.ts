import { z } from "zod";

const ArticleSchema = z.object({
  content: z.string(),
  metadata: z.object({
    name: z.string(),
    path: z.string(),
    slug: z.string(),
  }),
});

export async function fetchArticle(slug: string) {
  const response = await fetch(`/api/article?slug=${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  const data = await response.json();
  const parsed = ArticleSchema.parse(data);

  // Importation dynamique de serialize
  const { serialize } = await import("next-mdx-remote/serialize");
  const mdxSource = await serialize(parsed.content);

  return { ...parsed, mdxSource };
}
