import { QueryClient } from "@tanstack/react-query";

export function persistQueryClientCache(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache().getAll();
  const serializedCache = JSON.stringify(
    cache.map((query) => ({
      queryKey: query.queryKey,
      data: query.state.data,
    }))
  );
  localStorage.setItem("queryCache", serializedCache);
}

export function hydrateQueryClientCache(queryClient: QueryClient) {
  const cachedData = localStorage.getItem("queryCache");
  if (cachedData) {
    const parsedCache = JSON.parse(cachedData);
    parsedCache.forEach((item: { queryKey: any; data: any }) => {
      queryClient.setQueryData(item.queryKey, item.data);
    });
  }
}
