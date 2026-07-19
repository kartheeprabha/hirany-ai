"use client";

import { useRef } from "react";

import { SareeImage } from "@/types/SareeImage";

interface Props {
  onImagesSelected: (images: SareeImage[]) => void;
}

export default function ImageUploader({ onImagesSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files) return;

  const selectedImages: SareeImage[] = Array.from(event.target.files).map(
    (file) => ({
      id: crypto.randomUUID(),
      original: file,
      previewUrl: URL.createObjectURL(file),
      status: "uploaded",
    })
  );

  onImagesSelected(selectedImages);
};
  return (
    <>
      <button
        onClick={handleClick}
        className="w-full p-5 rounded-xl border text-lg hover:bg-gray-100 transition"
      >
        📷 Upload Saree Images
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleChange}
      />
    </>
  );
}