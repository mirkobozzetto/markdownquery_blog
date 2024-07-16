"use client";

import { BlogFile } from "@/lib/github";
import { Link } from "theme-ui";

export default function ArticleList({ files }: { files: BlogFile[] }) {
  return (
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
  );
}
