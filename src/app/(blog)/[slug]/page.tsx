import { getBlogFiles } from "@/lib/github";
import ClientArticle from "./ClientArticle";

export async function generateStaticParams() {
  const files = await getBlogFiles();
  return files.map((file) => ({ slug: file.slug }));
}
/**
 * generateStaticParams permet de générer des paramètres statiques pour chaque article
 * cela permet de générer des URLs dynamiques pour chaque article
 * a chaque fois que le fichier est modifié dans GitHub
 */

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ClientArticle slug={params.slug} />;
}

export const revalidate = 3600;
