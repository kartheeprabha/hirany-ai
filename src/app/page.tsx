"use client";

import { useState } from "react";
import ImageUploader from "@/components/upload/ImageUploader";
import ImagePreview from "@/components/preview/ImagePreview";

export default function Home() {
  const [images, setImages] = useState<File[]>([]);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">

        <h1 className="text-4xl font-bold text-center">
          HiranyAI
        </h1>

        <p className="text-center text-gray-500 mt-2">
          AI Assistant for Hiranyavastraa
        </p>

        <div className="mt-10 space-y-5">
          <ImageUploader onImagesSelected={setImages} />

          <button className="w-full p-5 rounded-xl border text-lg">
            🎥 Upload Saree Videos
          </button>
        </div>

        <ImagePreview images={images} />

        <button className="w-full mt-10 bg-black text-white p-4 rounded-xl">
          Generate Content
        </button>

      </div>
    </main>
  );
}