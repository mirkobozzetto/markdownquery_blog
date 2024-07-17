import { getBlogFiles } from "@/lib/github";
import dynamic from "next/dynamic";

const BlogUpdater = dynamic(
  () => import("@/components/BlogUpdater").then((mod) => mod.BlogUpdater),
  { ssr: false }
);

const ArticlePrefetcher = dynamic(
  () =>
    import("@/components/ArticlePrefetcher").then(
      (mod) => mod.ArticlePrefetcher
    ),
  { ssr: false }
);

const DynamicArticleList = dynamic(
  () => import("@/components/blog/ArticleList"),
  {
    loading: () => <p>Chargement des articles...</p>,
  }
);

export default async function Home() {
  const files = await getBlogFiles();

  return (
    <>
      <BlogUpdater />
      <ArticlePrefetcher files={files} />
      <main>
        <h1 className="mb-8 font-bold text-5xl">Github-Powered Blog</h1>
        <DynamicArticleList files={files} />
      </main>
    </>
  );
}

export const revalidate = 900000;
