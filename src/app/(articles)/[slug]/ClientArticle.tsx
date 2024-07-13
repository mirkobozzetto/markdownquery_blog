"use client";

import CustomMDXComponents from "@/components/MDXComponents";
import { useQuery } from "@tanstack/react-query";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
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
  const parsed = ArticleSchema.parse(data);
  const mdxSource = await serialize(parsed.content);
  return { ...parsed, mdxSource };
};

export default function ClientArticle({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticle(slug),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error)
    return <div>Une erreur est survenue: {(error as Error).message}</div>;

  if (!data) return null;
  return (
    <article className="prose lg:prose-xl mx-auto">
      <h1 className="mb-4 font-bold text-5xl">
        {data.metadata.name
          .replace(/^\d{4}-\d{2}-\d{2}_/, "")
          .replace(/\.(md|mdx)$/, "")}
      </h1>
      <MDXRemote
        {...data.mdxSource}
        // @ts-ignore
        components={CustomMDXComponents}
      />
    </article>
  );
}
