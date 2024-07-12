import { getBlogFileContent, getBlogFiles } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: "Le paramètre slug est manquant." },
      { status: 400 }
      //400 Bad Request
    );
  }

  try {
    const files = await getBlogFiles();
    const file = files.find((f) => f.slug === slug);
    //la fontion find retourne le premier fichier qui correspond à slug

    if (!file) {
      return NextResponse.json(
        { error: "Le fichier n'existe pas." },
        { status: 404 }
        //404 Not Found
      );
    }

    const content = await getBlogFileContent(file.path);
    return NextResponse.json({ content, metadata: file });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du fichier." },
      { status: 500 }
      //500 Internal Server Error
    );
  }
}
