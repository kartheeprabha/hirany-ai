const sharp = require("sharp");
const path = require("path");

const sizes = [192, 512];
const logoPath = path.join(__dirname, "..", "public", "logo.png");

async function generateIcon(size) {
  const outputPath = path.join(__dirname, "..", "public", `icon-${size}.png`);
  const logoSize = Math.round(size * 0.7);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(logoPath)
          .resize(logoSize, logoSize, { fit: "inside" })
          .toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath}`);
}

async function main() {
  for (const size of sizes) {
    await generateIcon(size);
  }
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});