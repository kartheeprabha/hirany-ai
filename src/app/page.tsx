"use client";

import { useState } from "react";
import ImageUploader from "@/components/upload/ImageUploader";
import ImagePreview from "@/components/preview/ImagePreview";
import { SareeImage } from "@/types/SareeImage";
import { addLogoToImage, addLogoToImageSrc, compositeOnBackdrop } from "@/services/imageProcessor";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("Failed to read file");
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [images, setImages] = useState<SareeImage[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleGenerate = async () => {
    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      updatedImages[i].status = "processing";
      setImages([...updatedImages]);

      try {
        const processed = await addLogoToImage(updatedImages[i].original);
        updatedImages[i].processedUrl = processed;
        updatedImages[i].status = "completed";
        setImages([...updatedImages]);
      } catch (error) {
        console.error("Logo processing failed:", error);
        updatedImages[i].status = "failed";
        setImages([...updatedImages]);
      }
    }
  };

  const handleUpdateImage = (id: string, updates: Partial<SareeImage>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const generateCaptionFor = async (image: SareeImage) => {
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabric: image.fabric,
          colour: image.colour,
          price: image.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate caption");
      }

      handleUpdateImage(image.id, { caption: data.caption });
    } catch (error) {
      console.error("Caption generation failed:", error);
      handleUpdateImage(image.id, {
        caption: "⚠️ Failed to generate caption. Try again.",
      });
    }
  };

  const handleGenerateCaption = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    handleUpdateImage(id, { caption: "Generating..." });
    await generateCaptionFor(image);
  };

  const handleGenerateAllCaptions = async () => {
    setIsGeneratingAll(true);

    const eligible = images.filter(
      (img) => img.fabric && img.colour && img.price && !img.caption
    );

    for (const image of eligible) {
      handleUpdateImage(image.id, { caption: "Generating..." });
      await generateCaptionFor(image);
    }

    setIsGeneratingAll(false);
  };

  const handleGenerateBackground = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    handleUpdateImage(id, { status: "processing" });

    try {
      const dataUrl = await fileToDataUrl(image.original);

      const res = await fetch("/api/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate background");
      }

      const withLogo = await addLogoToImageSrc(data.imageDataUrl);

      handleUpdateImage(id, {
        backgroundUrl: withLogo,
        status: "completed",
      });
    } catch (error) {
      console.error("Background generation failed:", error);
      handleUpdateImage(id, { status: "failed" });
    }
  };

  const handleCompositeBackdrop = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    handleUpdateImage(id, { status: "processing" });

    try {
      const composited = await compositeOnBackdrop(image.original);
      handleUpdateImage(id, {
        backgroundUrl: composited,
        status: "completed",
      });
    } catch (error) {
      console.error("Backdrop compositing failed:", error);
      handleUpdateImage(id, { status: "failed" });
    }
  };

  const readyForCaptionCount = images.filter(
    (img) => img.fabric && img.colour && img.price && !img.caption
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center">HiranyAI</h1>
        <p className="text-center text-gray-500 mt-2">
          AI Assistant for Hiranyavastraa
        </p>

        <div className="mt-10 space-y-5">
          <ImageUploader onImagesSelected={setImages} />
          <button className="w-full p-5 rounded-xl border text-lg">
            🎥 Upload Saree Videos
          </button>
        </div>

        <ImagePreview
          images={images}
          onUpdateImage={handleUpdateImage}
          onGenerateCaption={handleGenerateCaption}
          onGenerateBackground={handleGenerateBackground}
          onCompositeBackdrop={handleCompositeBackdrop}
        />

        <button
          onClick={handleGenerate}
          className="w-full mt-10 bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition"
        >
          Generate Content
        </button>

        {images.length > 0 && (
          <button
            onClick={handleGenerateAllCaptions}
            disabled={isGeneratingAll || readyForCaptionCount === 0}
            className="w-full mt-3 bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGeneratingAll
              ? "Generating captions..."
              : `✨ Generate All Captions (${readyForCaptionCount})`}
          </button>
        )}
      </div>
    </main>
  );
}