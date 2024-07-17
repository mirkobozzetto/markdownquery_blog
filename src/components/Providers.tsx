"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/**
 * Composant pour fournir le client de QueryClient à tous les composants enfants
 * Le client de QueryClient est utilisé pour stocker les résultats de la requête
 * et de les réutiliser dans d'autres composants
 */

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /**
             * https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
             * staleTime: le temps de vie de la requête avant qu'elle soit régénérée
             * gcTime: le temps de vie de la requête avant qu'elle soit supprimée du cache
             */
            staleTime: 1000 * 60 * 60 * 1,
            gcTime: 1000 * 60 * 60 * 24,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
