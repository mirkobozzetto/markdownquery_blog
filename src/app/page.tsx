import { getBlogFiles } from "@/lib/github";
import dynamic from "next/dynamic";
import Link from "next/link";

const BlogUpdater = dynamic(
  () => import("@/components/BlogUpdater").then((mod) => mod.BlogUpdater),
  { ssr: false }
);

export default async function Home() {
  const files = await getBlogFiles();

  return (
    <>
      <BlogUpdater />
      <main>
        <h1>Mon Blog</h1>
        <ul>
          {files.map((file) => (
            <li key={file.slug}>
              <Link href={`/${file.slug}`}>
                {file.name
                  .replace(/^\d{4}-\d{2}-\d{2}_/, "")
                  .replace(/\.(md|mdx)$/, "")}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export const revalidate = 900000;
