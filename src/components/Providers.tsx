"use client";

import {
  hydrateQueryClientCache,
  persistQueryClientCache,
} from "@/lib/cachePersistance";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: 1000 * 60 * 60 * 24, // 24 heures
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    hydrateQueryClientCache(queryClient);

    window.addEventListener("beforeunload", () => {
      persistQueryClientCache(queryClient);
    });

    return () => {
      window.removeEventListener("beforeunload", () => {
        persistQueryClientCache(queryClient);
      });
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
