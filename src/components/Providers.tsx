"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  // QueryClient va permettre de stocker les résultats de la requête
  // et de les réutiliser dans d'autres composants
  //useState va créer une variable globale qui stocke le client
  //et qui est utilisé pour stocker les résultats de la requête

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    //QueryClientProvider va fournir le client au composant enfant
    //et va stocker les résultats de la requête
  );
}
