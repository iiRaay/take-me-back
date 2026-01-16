import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { parse } from "exifr";

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    if (!filename)
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );

    const filePath = join(process.cwd(), "public", "photos", filename);
    const buffer = await readFile(filePath);

    const exifData = await parse(buffer as any, {
      gps: true,
      translateKeys: false,
      translateValues: false,
      reviveValues: true,
    });

    // Reliable date extraction
    const dateTime =
      exifData?.DateTimeOriginal ||
      exifData?.CreateDate ||
      exifData?.["36867"] ||
      exifData?.["306"];

    return NextResponse.json({
      hasLocation: !!(exifData?.latitude && exifData?.longitude),
      latitude: exifData?.latitude,
      longitude: exifData?.longitude,
      metadata: { ...exifData, dateTime },
    });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return NextResponse.json(
      { error: "Failed to extract metadata" },
      { status: 500 }
    );
  }
}
