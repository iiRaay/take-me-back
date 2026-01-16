import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const PHOTOS_FOLDER = join(process.cwd(), "public", "photos");
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
];

export async function GET() {
  try {
    if (!existsSync(PHOTOS_FOLDER)) return NextResponse.json({ photos: [] });

    const files = await readdir(PHOTOS_FOLDER);
    const photos: { filename: string; path: string; url: string }[] = [];

    for (const file of files) {
      const ext = file.toLowerCase().substring(file.lastIndexOf("."));
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;

      const filePath = join(PHOTOS_FOLDER, file);
      const stats = await stat(filePath);
      if (!stats.isFile()) continue;

      photos.push({ filename: file, path: filePath, url: `/photos/${file}` });
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error reading photos:", error);
    return NextResponse.json(
      { error: "Failed to read photos folder" },
      { status: 500 }
    );
  }
}
