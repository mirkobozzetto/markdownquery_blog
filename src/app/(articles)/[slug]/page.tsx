import { getBlogFiles } from "@/lib/github";
import ClientArticle from "./ClientArticle";

export async function generateStaticParams() {
  const files = await getBlogFiles();
  return files.map((file) => ({ slug: file.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ClientArticle slug={params.slug} />;
}

export const revalidate = 3600;
