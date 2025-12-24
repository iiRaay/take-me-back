import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { parse } from "exifr";

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), "public", "photos", filename);
    
    // Read the file
    const buffer = await readFile(filePath);

    // Extract EXIF data including GPS coordinates and dates
    const exifData = await parse(buffer as any, {
      gps: true,
      translateKeys: false,
      translateValues: false,
      reviveValues: true,
    });

    // Always extract dateTime regardless of GPS
    const dateTime = exifData?.DateTimeOriginal || exifData?.DateTime || exifData?.CreateDate;

    if (!exifData || !exifData.latitude || !exifData.longitude) {
      return NextResponse.json({
        hasLocation: false,
        metadata: {
          ...(exifData || {}),
          dateTime: dateTime,
        },
      });
    }

    return NextResponse.json({
      hasLocation: true,
      latitude: exifData.latitude,
      longitude: exifData.longitude,
      metadata: {
        ...exifData,
        dateTime: dateTime,
      },
    });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return NextResponse.json(
      { error: "Failed to extract metadata" },
      { status: 500 }
    );
  }
}
