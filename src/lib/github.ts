import { Octokit } from "@octokit/rest";
import { z } from "zod";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

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

    if (response.status === 304) {
      return false; // Pas de changement
    }

    const newEtag = response.headers.get("ETag");
    if (newEtag && newEtag !== lastEtag) {
      lastEtag = newEtag;
      return true; // Il y a eu des changements
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification des mises à jour:", error);
    return false;
  }
}

export async function getBlogFiles(): Promise<BlogFile[]> {
  try {
    const { data: folders } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: REPO_PATH,
    });

    console.log("Dossiers trouvés:", folders);

    if (Array.isArray(folders)) {
      const allFiles = await Promise.all(
        folders
          .filter((item) => item.type === "dir")
          .map(async (folder) => {
            const { data: files } = await octokit.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${REPO_PATH}/${folder.name}`,
            });

            console.log(`Fichiers dans ${folder.name}:`, files);

            if (Array.isArray(files)) {
              return files
                .filter((item) => item.type === "file")
                .map((item) => {
                  const match = item.name.match(
                    /^\d{4}-\d{2}-\d{2}_(.+)\.(md|mdx)$/
                  );
                  // le match permet de extraire le slug du fichier
                  return {
                    name: item.name,
                    path: `${folder.name}/${item.name}`,
                    slug: match
                      ? match[1]
                      : item.name.replace(/\.(md|mdx)$/, ""),
                    // le slug est le nom du fichier sans l'extension
                  };
                })
                .filter((file) => FileNameSchema.safeParse(file.name).success);
              // le filter permet de ne garder que les fichiers valides
            }

            return [];
          })
      );

      const flattenedFiles = allFiles.flat();
      console.log("Tous les fichiers markdown trouvés:", flattenedFiles);

      return flattenedFiles;
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return [];
  }
}

export async function getBlogFileContent(path: string): Promise<string> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${REPO_PATH}/${path}`,
    });

    if ("content" in data) {
      // Le contenu est encodé en base64, nous devons le décoder
      return Buffer.from(data.content, "base64").toString("utf-8");
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
