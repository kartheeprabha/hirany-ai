"use client";

import { useRef } from "react";

interface Props {
  onImagesSelected: (files: File[]) => void;
}

export default function ImageUploader({ onImagesSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    onImagesSelected(Array.from(event.target.files));
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