export async function addLogoToImage(
  imageFile: File
): Promise<string> {
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

      const logoWidth = image.width * 0.18;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const margin = image.width * 0.03;

      ctx.drawImage(
        logo,
        image.width - logoWidth - margin,
        margin,
        logoWidth,
        logoHeight
      );

      resolve(canvas.toDataURL("image/png"));
    };

    // Attach handlers BEFORE setting src, so cached images don't fire early
    image.onload = () => {
      imageLoaded = true;
      tryDraw();
    };
    image.onerror = () => reject("Failed to load the uploaded image");

    logo.onload = () => {
      logoLoaded = true;
      tryDraw();
    };
    logo.onerror = () => reject("Failed to load /logo.png — check the file exists in public/");

    image.src = URL.createObjectURL(imageFile);
    logo.src = "/logo.png";
  });
}