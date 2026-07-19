"use client";

import Image from "next/image";

interface ImagePreviewProps {
  images: File[];
}

export default function ImagePreview({ images }: ImagePreviewProps) {
  if (images.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="font-semibold text-lg">
          Selected Images (0)
        </h2>

        <p className="text-gray-500 mt-2">
          No images selected.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-lg mb-4">
        Selected Images ({images.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image) => (
          <div
            key={image.name}
            className="border rounded-xl overflow-hidden shadow-sm bg-white"
          >
            <div className="relative w-full h-64">
              <Image
                src={URL.createObjectURL(image)}
                alt={image.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="p-4">
              <p className="font-medium truncate">
                {image.name}
              </p>

              <p className="text-sm text-gray-500">
                {(image.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}