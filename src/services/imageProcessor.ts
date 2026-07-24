import { removeBackground } from "@imgly/background-removal";

async function addLogoToSrc(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject("Canvas not supported");
      return;
    }

    const image = new Image();
    const logo = new Image();

    let imageLoaded = false;
    let logoLoaded = false;

    const tryDraw = () => {
      if (!imageLoaded || !logoLoaded) return;

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      const logoWidth = image.width * 0.25;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const margin = image.width * 0.03;

      ctx.globalAlpha = 1;
      ctx.drawImage(
        logo,
        image.width - logoWidth - margin,
        margin,
        logoWidth,
        logoHeight
      );

      resolve(canvas.toDataURL("image/png"));
    };

    image.onload = () => {
      imageLoaded = true;
      tryDraw();
    };

    image.onerror = () => reject("Failed to load the image");

    logo.onload = () => {
      logoLoaded = true;
      tryDraw();
    };

    logo.onerror = () =>
      reject("Failed to load /logo.png — check the file exists in public/");

    image.src = imageSrc;
    logo.src = "/logo.png";
  });
}

export async function addLogoToImage(imageFile: File): Promise<string> {
  return addLogoToSrc(URL.createObjectURL(imageFile));
}

export async function addLogoToImageSrc(imageSrc: string): Promise<string> {
  return addLogoToSrc(imageSrc);
}

export async function compositeOnBackdrop(
  imageFile: File,
  backdropSrc: string = "/backdrops/backdrop-1.png"
): Promise<string> {

  const cutoutBlob = await removeBackground(imageFile);

  console.log("removeBackground returned:", cutoutBlob);
  console.log("Is Blob:", cutoutBlob instanceof Blob);

  const cutoutUrl = URL.createObjectURL(cutoutBlob);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject("Canvas not supported");
      return;
    }

    const backdrop = new Image();
    const cutout = new Image();

    let backdropLoaded = false;
    let cutoutLoaded = false;

    const tryDraw = () => {
      if (!backdropLoaded || !cutoutLoaded) return;

      console.log("Drawing final image...");

      canvas.width = backdrop.width;
      canvas.height = backdrop.height;

      ctx.drawImage(backdrop, 0, 0, canvas.width, canvas.height);

      const maxWidth = canvas.width * 0.55;
      const maxHeight = canvas.height * 0.55;

      const scale = Math.min(
        maxWidth / cutout.width,
        maxHeight / cutout.height
      );

      const drawWidth = cutout.width * scale;
      const drawHeight = cutout.height * scale;

      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2 + canvas.height * 0.05;

      ctx.drawImage(cutout, x, y, drawWidth, drawHeight);

      resolve(canvas.toDataURL("image/png"));
    };

    console.log("Using backdrop:", backdropSrc);

    backdrop.onload = () => {
      console.log(
        "✅ Backdrop loaded:",
        backdrop.width,
        "x",
        backdrop.height
      );
      backdropLoaded = true;
      tryDraw();
    };

    backdrop.onerror = (e) => {
      console.error("❌ Backdrop failed:", backdrop.src, e);
      reject(`Failed to load backdrop image: ${backdrop.src}`);
    };

    cutout.onload = () => {
      console.log(
        "✅ Cutout loaded:",
        cutout.width,
        "x",
        cutout.height
      );
      cutoutLoaded = true;
      tryDraw();
    };

    cutout.onerror = (e) => {
      console.error("❌ Cutout failed:", cutout.src, e);
      reject("Failed to load cutout image");
    };

    backdrop.src = backdropSrc;
    cutout.src = cutoutUrl;
  });
}