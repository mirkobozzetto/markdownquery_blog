import { Octokit } from "@octokit/rest";
import NodeCache from "node-cache";
import { z } from "zod";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const cache = new NodeCache({ stdTTL: 365 * 24 * 60 * 60 }); // Cache pour 1 an

const REPO_OWNER = "mirkobozzetto";
const REPO_NAME = "Obsidian";
const REPO_PATH = "Blog";

const FileNameSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}_.*\.(md|mdx)$/);

interface BlogFile {
  name: string;
  path: string;
  slug: string;
}

let lastEtag: string | null = null;

export async function checkForUpdates(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${REPO_PATH}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "If-None-Match": lastEtag || "",
        },
      }
    );

    if (response.status === 304) return false; // Pas de changement

    const newEtag = response.headers.get("ETag");
    if (newEtag && newEtag !== lastEtag) {
      lastEtag = newEtag;
      invalidateBlogFilesCache(); // Invalider le cache si des changements sont détectés
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification des mises à jour:", error);
    return false;
  }
}

export async function getBlogFiles(): Promise<BlogFile[]> {
  const cacheKey = "blogFiles";
  const cachedFiles = cache.get<BlogFile[]>(cacheKey);

  if (cachedFiles) return cachedFiles;

  try {
    const { data: folders } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: REPO_PATH,
    });

    if (!Array.isArray(folders)) return [];

    const allFiles = await Promise.all(
      folders
        .filter((item) => item.type === "dir")
        .map(async (folder) => {
          const { data: files } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${REPO_PATH}/${folder.name}`,
          });

          if (!Array.isArray(files)) return [];

          return files
            .filter((item) => item.type === "file")
            .map((item) => {
              const match = item.name.match(
                /^\d{4}-\d{2}-\d{2}_(.+)\.(md|mdx)$/
              );
              return {
                name: item.name,
                path: `${folder.name}/${item.name}`,
                slug: match ? match[1] : item.name.replace(/\.(md|mdx)$/, ""),
              };
            })
            .filter((file) => FileNameSchema.safeParse(file.name).success);
        })
    );

    const flattenedFiles = allFiles.flat();
    cache.set(cacheKey, flattenedFiles);
    return flattenedFiles;
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return [];
  }
}

export async function getBlogFileContent(path: string): Promise<string> {
  const cacheKey = `fileContent:${path}`;
  const cachedContent = cache.get<string>(cacheKey);

  if (cachedContent) return cachedContent;

  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${REPO_PATH}/${path}`,
    });

    if ("content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      cache.set(cacheKey, content);
      return content;
    } else {
      throw new Error("Contenu invalide");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du contenu du fichier:",
      error
    );
    throw error;
  }
}

export function invalidateBlogFilesCache() {
  cache.del("blogFiles");
}

export function invalidateFileContentCache(path: string) {
  cache.del(`fileContent:${path}`);
}
