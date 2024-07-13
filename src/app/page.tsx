import { getBlogFiles } from "@/lib/github";
import Link from "next/link";

export default async function Home() {
  const files = await getBlogFiles();

  return (
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
  );
}

export const revalidate = 86400;
