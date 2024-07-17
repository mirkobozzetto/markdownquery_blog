"use client";

import { fetchArticle } from "@/lib/fetchArticle";
import { BlogFile } from "@/lib/github";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function ArticlePrefetcher({ files }: { files: BlogFile[] }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchArticles = async () => {
      const articlesToPreload = files.slice(0, 5); // Précharge les 5 premiers articles
      console.log(
        "Préchargement des articles :",
        articlesToPreload.map((f) => f.slug)
      );
      for (const file of articlesToPreload) {
        await queryClient.prefetchQuery({
          queryKey: ["article", file.slug],
          queryFn: () => fetchArticle(file.slug),
        });
      }
      console.log("Préchargement terminé");
    };

    prefetchArticles();
  }, [files, queryClient]);

  return null;
}
