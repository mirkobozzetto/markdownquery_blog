import { logDev } from "./logDevs";

export async function fetchArticle(slug: string) {
  logDev(`Appel à fetchArticle pour ${slug}`);
  const response = await fetch(`/api/article?slug=${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  const data = await response.json();
  logDev(`Données récupérées pour ${slug}:`, data);
  return data;
}
