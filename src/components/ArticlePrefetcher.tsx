"use client";

import { fetchArticle } from "@/lib/fetchArticle";
import { BlogFile } from "@/lib/github";
import { logDev } from "@/lib/logDevs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function ArticlePrefetcher({ files }: { files: BlogFile[] }) {
  const queryClient = useQueryClient();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    const prefetchArticles = async () => {
      if (hasPrefetched.current) return;

      const articlesToPreload = files.slice(0, 5);
      logDev(
        "Vérification du cache pour les articles :",
        articlesToPreload.map((f) => f.slug)
      );

      for (const file of articlesToPreload) {
        const queryKey = ["article", file.slug];
        const cachedData = queryClient.getQueryData(queryKey);
        if (!cachedData) {
          logDev(`Préchargement de l'article : ${file.slug}`);
          await queryClient.prefetchQuery({
            queryKey: queryKey,
            queryFn: () => fetchArticle(file.slug),
          });
        } else {
          logDev(`Article déjà en cache : ${file.slug}`);
        }
      }

      logDev("Vérification du cache terminée");
      hasPrefetched.current = true;
    };

    prefetchArticles();
  }, [files, queryClient]);

  return null;
}
