# Timeline App

A Next.js application that displays photos on an interactive 3D globe map based on their GPS metadata.

## Features

- **3D Globe Map**: Interactive globe view using react-globe.gl
- **Photo Library**: Browse and view all uploaded photos
- **GPS Pins**: Automatic pin placement on the globe based on photo EXIF location data
- **Metadata Extraction**: Reads GPS coordinates, date/time, and other metadata from photos

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding Photos

1. Place your photos in the `public/photos` folder
2. The app automatically reads all images and extracts GPS metadata
3. Photos with location data will appear as pins on the globe map

### Supported Formats
- JPG/JPEG
- PNG
- GIF
- WEBP
- HEIC/HEIF

### Requirements
Photos should contain GPS metadata (EXIF data) to appear on the map. Most smartphones and modern cameras automatically include this data when location services are enabled.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
