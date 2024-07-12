import { Octokit } from "@octokit/rest";
import { z } from "zod";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = "mirkobozzetto";
const REPO_NAME = "Obsidian";
const REPO_PATH = "Blog";

const FileNameSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}_.*\.md$/);

export async function getBlogFiles(): Promise<string[]> {
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
                .map((item) => item.name)
                .filter((name) => FileNameSchema.safeParse(name).success);
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
