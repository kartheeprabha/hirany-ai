"use client";

import { useState, useRef, useCallback } from "react";
import { SareeImage } from "@/types/SareeImage";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

interface Props {
  onImagesSelected: (images: SareeImage[]) => void;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({ onImagesSelected }: Props) {
  const [previews, setPreviews] = useState<SareeImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | File[]) => {
    const validFiles: SareeImage[] = [];
    let errorMessage = null;

    Array.from(files).forEach((file) => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        errorMessage = `Invalid file type: ${file.name}. Only JPG, PNG, WEBP allowed.`;
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errorMessage = `File too large: ${file.name}. Max 5MB allowed.`;
        return;
      }

      const id = crypto.randomUUID();
      validFiles.push({
        id,
        original: file,
        previewUrl: URL.createObjectURL(file),
        status: "uploaded",
      });
    });

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
    return validFiles;
  };

  const handleFiles = (files: FileList | File[]) => {
    const newImages = validateFiles(files);
    if (newImages.length > 0) {
      setPreviews((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setPreviews((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  return (
    <div className="w-full space-y-4">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full p-5 rounded-xl border-2 border-dashed hover:bg-gray-100 transition"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📷</span>
          <span className="text-lg font-medium">Upload Saree Images</span>
          <span className="text-sm text-gray-500">Click or drag images here</span>
          <span className="text-xs text-gray-400">Supports JPG, PNG, WEBP (Max 5MB each)</span>
        </div>
      </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

      {error && (
        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border">
              <img src={img.previewUrl} alt="Preview" className="h-32 w-full object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <button
          onClick={() => onImagesSelected(previews)}
          className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition font-medium"
        >
          Process {previews.length} Images
        </button>
      )}
    </div>
  );
}
