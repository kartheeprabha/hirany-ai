"use client";

import Image from "next/image";
import { SareeImage } from "@/types/SareeImage";

interface ImagePreviewProps {
  images: SareeImage[];
  onUpdateImage: (id: string, updates: Partial<SareeImage>) => void;
  onGenerateCaption: (id: string) => void;
  onGenerateBackground: (id: string) => void;
}

export default function ImagePreview({
  images,
  onUpdateImage,
  onGenerateCaption,
  onGenerateBackground,
}: ImagePreviewProps) {
  const handleDownload = (image: SareeImage) => {
    const link = document.createElement("a");
    link.href = image.backgroundUrl || image.processedUrl || image.previewUrl;
    link.download = `hiranyai-${image.original.name}`;
    link.click();
  };

  if (images.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="font-semibold text-lg">Selected Images (0)</h2>
        <p className="text-gray-500 mt-2">No images selected.</p>
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
            key={image.id}
            className="border rounded-xl overflow-hidden shadow-sm bg-white"
          >
            <div className="relative w-full h-64">
              <Image
                src={image.backgroundUrl || image.processedUrl || image.previewUrl}
                alt={image.original.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <button
              onClick={() => handleDownload(image)}
              disabled={!image.processedUrl && !image.backgroundUrl}
              className="w-full bg-green-600 text-white p-2 text-sm hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ⬇️ Download Image
            </button>

            <button
              onClick={() => onGenerateBackground(image.id)}
              disabled={image.status === "processing"}
              className="w-full bg-amber-600 text-white p-2 text-sm hover:bg-amber-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🎨 Generate Styled Background
            </button>

            <div className="p-4 space-y-3">
              <p className="font-medium truncate">{image.original.name}</p>

              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    image.status === "uploaded"
                      ? "bg-yellow-100 text-yellow-800"
                      : image.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : image.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {image.status.toUpperCase()}
                </span>
              </div>

              <input
                type="text"
                placeholder="Fabric (e.g. Cotton Saree)"
                value={image.fabric || ""}
                onChange={(e) =>
                  onUpdateImage(image.id, { fabric: e.target.value })
                }
                className="w-full border rounded-lg p-2 text-sm"
              />

              <input
                type="text"
                placeholder="Colour (e.g. Red & Bottle Green)"
                value={image.colour || ""}
                onChange={(e) =>
                  onUpdateImage(image.id, { colour: e.target.value })
                }
                className="w-full border rounded-lg p-2 text-sm"
              />

              <input
                type="text"
                placeholder="Price (e.g. 899)"
                value={image.price || ""}
                onChange={(e) =>
                  onUpdateImage(image.id, { price: e.target.value })
                }
                className="w-full border rounded-lg p-2 text-sm"
              />

              <button
                onClick={() => onGenerateCaption(image.id)}
                disabled={!image.fabric || !image.colour || !image.price}
                className="w-full bg-purple-600 text-white p-2 rounded-lg text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition"
              >
                ✨ Generate Caption
              </button>

              {image.caption && (
                <div className="mt-2">
                  <textarea
                    readOnly
                    value={image.caption}
                    rows={8}
                    className="w-full border rounded-lg p-2 text-xs font-mono"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(image.caption || "")
                    }
                    className="w-full mt-2 bg-gray-800 text-white p-2 rounded-lg text-sm hover:bg-gray-900 transition"
                  >
                    📋 Copy Caption
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}