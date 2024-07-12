import { getBlogFiles } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const files = await getBlogFiles();
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers." },
      { status: 500 }
      //500 Internal Server Error
    );
  }
}
