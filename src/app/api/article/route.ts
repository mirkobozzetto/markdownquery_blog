import { getBlogFileContent, getBlogFiles } from "@/lib/github";
import { logDev } from "@/lib/logDevs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  logDev(`Appel à l'API pour l'article : ${slug}`);

  if (!slug) {
    return NextResponse.json(
      { error: "Le paramètre slug est manquant." },
      { status: 400 }
    );
  }

  try {
    const files = await getBlogFiles();
    const file = files.find((f) => f.slug === slug);

    if (!file) {
      return NextResponse.json(
        { error: "Le fichier n'existe pas." },
        { status: 404 }
      );
    }

    const content = await getBlogFileContent(file.path);
    const responseData = { content, metadata: file };
    logDev(`Données renvoyées par l'API pour ${slug}:`, responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    logDev(`Erreur lors de la récupération de l'article : ${slug}`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du fichier." },
      { status: 500 }
    );
  }
}
