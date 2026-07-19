export interface SareeImage {
  id: string;
  original: File;
  previewUrl: string;

  processedUrl?: string;
  backgroundUrl?: string;

  fabric?: string;
  colour?: string;
  price?: string;

  caption?: string;

  status: "uploaded" | "processing" | "completed" | "failed";
}