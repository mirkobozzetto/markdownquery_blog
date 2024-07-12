import { Octokit } from "@octokit/rest";
import { z } from "zod";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = "mirkobozzetto";
const REPO_NAME = "Obsidian";
const REPO_PATH = "Blog";

const FileNameSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}_.*\.md$/);

interface BlogFile {
  name: string;
  path: string;
  slug: string;
}

export async function getBlogFiles(): Promise<BlogFile[]> {
  try {
    // la liste des dossiers année-mois
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
                  const match = item.name.match(/^\d{4}-\d{2}-\d{2}_(.+)\.md$/);
                  // le match permet de extraire le slug du fichier
                  return {
                    name: item.name,
                    path: `${folder.name}/${item.name}`,
                    slug: match ? match[1] : item.name.replace(".md", ""),
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
