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

export interface BlogFile {
  name: string;
  path: string;
  slug: string;
}

/**
 * Variable globale pour stocker le dernier Etag renvoyé par la requête GitHub
 * un Etag est un identifiant unique pour une ressource, il est utilisé pour éviter de télécharger les mêmes fichiers
 * si le contenu n'a pas changé
 * https://medium.com/airasia-com-tech-blog/etag-101-tips-and-tricks-for-implementation-6072525b487b
 */

let lastEtag: string | null = null;

/**
 * Fonction pour vérifier si des mises à jour sont disponibles dans le dépôt GitHub
 * Si des mises à jour sont disponibles, la fonction récupère les fichiers mis à jour et les met à jour dans le cache
 */

export async function checkForUpdates(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${REPO_PATH}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "If-None-Match": lastEtag || "", // Si l'Etag est déjà connu, on utilise cet Etag pour éviter de télécharger les mêmes fichiers
        },
      }
    );

    if (response.status === 304) return false; // Pas de changement, on retourne false

    const newEtag = response.headers.get("ETag");

    if (newEtag && newEtag !== lastEtag) {
      lastEtag = newEtag;

      // Au lieu d'invalider tout le cache, mettons à jour seulement les nouveaux fichiers
      const currentFiles = cache.get<BlogFile[]>("blogFiles") || []; // Récupérons les fichiers actuels
      const updatedFiles = await getBlogFiles(true); // Passons un paramètre pour forcer la mise à jour

      if (updatedFiles.length > currentFiles.length) {
        // Si il y a des nouveaux fichiers, on met à jour le cache
        cache.set("blogFiles", updatedFiles);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification des mises à jour:", error);
    return false;
  }
}

/**
 * Fonction pour récupérer la liste des fichiers Markdown ou MarkdownX du dépôt GitHub
 */

export async function getBlogFiles(
  forceUpdate: boolean = false
): Promise<BlogFile[]> {
  const cacheKey = "blogFiles";
  const cachedFiles = cache.get<BlogFile[]>(cacheKey);

  if (cachedFiles && !forceUpdate) return cachedFiles;

  try {
    const { data: folders } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: REPO_PATH,
    });

    if (!Array.isArray(folders)) return [];

    /**
     * Pour chaque dossier, on récupère la liste des fichiers dans le dossier
     * puis on filtre les fichiers pour ne conserver que ceux qui sont des fichiers Markdown ou MarkdownX
     * et on les convertit en objets BlogFile
     */

    const allFiles = await Promise.all(
      folders
        .filter((item) => item.type === "dir")
        .map(async (folder) => {
          const { data: files } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${REPO_PATH}/${folder.name}`,
          });

          if (!Array.isArray(files)) return []; // Si le dossier est vide, on ne le traite pas

          return files
            .filter((item) => item.type === "file")
            .map((item) => {
              const match = item.name.match(
                /^\d{4}-\d{2}-\d{2}_(.+)\.(md|mdx)$/
              );
              return {
                name: item.name,
                path: `${folder.name}/${item.name}`, // Le chemin complet du fichier
                slug: match ? match[1] : item.name.replace(/\.(md|mdx)$/, ""), // Le nom du fichier sans le suffixe
              };
            })
            .filter((file) => FileNameSchema.safeParse(file.name).success);
        })
    );

    const flattenedFiles = allFiles.flat(); // Fusionner tous les fichiers dans un tableau

    if (forceUpdate) {
      // Si c'est une mise à jour forcée, fusionnons avec les fichiers existants
      const existingFiles = cache.get<BlogFile[]>(cacheKey) || [];
      const updatedFiles = [
        ...existingFiles, // Copier les fichiers existants
        ...flattenedFiles.filter(
          // Ajouter les fichiers nouveaux
          (newFile) =>
            !existingFiles.some(
              (existingFile) => existingFile.path === newFile.path
            )
        ),
      ];
      cache.set(cacheKey, updatedFiles);
      return updatedFiles;
    } else {
      cache.set(cacheKey, flattenedFiles);
      return flattenedFiles;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return [];
  }
}

/**
 * Fonction pour récupérer le contenu d'un fichier Markdown ou MarkdownX
 * Si le contenu est déjà dans le cache, on l'utilise, sinon on le récupère du dépôt GitHub
 */

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

/**
 * Fonction pour invalider le cache du contenu d'un fichier Markdown ou MarkdownX
 * cela est utile lorsque le contenu d'un fichier est modifié et que nous souhaitons récupérer le nouveau contenu
 */

export function invalidateFileContentCache(path: string) {
  cache.del(`fileContent:${path}`);
}
