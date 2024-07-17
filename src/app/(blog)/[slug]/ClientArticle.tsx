"use client";

import CustomMDXComponents from "@/components/MDXComponents";
import { fetchArticle } from "@/lib/fetchArticle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const MDXRemote = dynamic(
  () => import("next-mdx-remote").then((mod) => mod.MDXRemote),
  { ssr: false }
);

export default function ClientArticle({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData(["article", slug]);

  console.log("Données en cache pour", slug, ":", cachedData ? "Oui" : "Non");

  const { data, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticle(slug),
    staleTime: 1000 * 60 * 60 * 1, // 1 heure
    gcTime: 1000 * 60 * 60 * 24, // 24 heures
    initialData: cachedData as any, // Utiliser les données en cache si disponibles
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
      <MDXRemote {...data.mdxSource} components={CustomMDXComponents} />
    </article>
  );
}
