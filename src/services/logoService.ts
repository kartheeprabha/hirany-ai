export async function addLogoToImage(
  file: File,
  logoPath: string = "/logo.png"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const logo = new Image();

    image.src = URL.createObjectURL(file);
    logo.src = logoPath;

    image.onload = () => {
      logo.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Canvas not supported");
          return;
        }

        canvas.width = image.width;
        canvas.height = image.height;

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Logo size (15% of image width)
        const logoWidth = image.width * 0.15;
        const logoHeight =
          (logo.height / logo.width) * logoWidth;

        // Top-right position
        const x = image.width - logoWidth - 20;
        const y = 20;

        ctx.drawImage(
          logo,
          x,
          y,
          logoWidth,
          logoHeight
        );

        resolve(canvas.toDataURL("image/png"));
      };
    };
  });
}