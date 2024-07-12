"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const ArticleSchema = z.object({
  content: z.string(),
  metadata: z.object({
    name: z.string(),
    path: z.string(),
    slug: z.string(),
  }),
});

const fetchArticle = async (slug: string) => {
  const response = await fetch(`/api/article?slug=${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  const data = await response.json();
  return ArticleSchema.parse(data);
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticle(slug),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Une erreur est survenue: {error.message}</div>;

  if (!data) return null;

  return (
    <article>
      <h1>
        {data.metadata.name
          .replace(/^\d{4}-\d{2}-\d{2}_/, "")
          .replace(".md", "")}
      </h1>

      <pre>{data.content}</pre>
    </article>
  );
}
