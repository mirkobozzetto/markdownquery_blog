"use client";

import { fetchArticle } from "@/lib/fetchArticle";
import { logDev } from "@/lib/logDevs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

const MDXRemote = dynamic(
  () => import("next-mdx-remote").then((mod) => mod.MDXRemote),
  { ssr: false }
);

export default function ClientArticle({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["article", slug], [slug]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      logDev(`Récupération de l'article : ${slug}`);
      const articleData = await fetchArticle(slug);
      const { serialize } = await import("next-mdx-remote/serialize");
      const mdxSource = await serialize(articleData.content);
      return { ...articleData, mdxSource };
    },
    staleTime: Infinity,
    enabled: !queryClient.getQueryData(queryKey),
  });

  useEffect(() => {
    logDev(`ClientArticle monté pour ${slug}`);
    logDev(
      `Données en cache pour ${slug}: ${
        queryClient.getQueryData(queryKey) ? "Oui" : "Non"
      }`
    );
  }, [slug, queryClient, queryKey]);

  if (isLoading) return <div>Chargement...</div>;
  if (error)
    return <div>Une erreur est survenue: {(error as Error).message}</div>;
  if (!data || !data.mdxSource) return null;

  return (
    <article className="prose lg:prose-xl mx-auto">
      <h1 className="mb-4 font-bold text-5xl">
        {data.metadata.name
          .replace(/^\d{4}-\d{2}-\d{2}_/, "")
          .replace(/\.(md|mdx)$/, "")}
      </h1>
      <MDXRemote {...data.mdxSource} />
    </article>
  );
}
