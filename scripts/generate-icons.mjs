import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

function generateIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  if (maskable) {
    // Maskable icons need full bleed background (safe zone is inner 80%)
    ctx.fillStyle = "#0f766e";
    ctx.fillRect(0, 0, size, size);
  } else {
    // Round cornered background
    const r = size * 0.18;
    ctx.fillStyle = "#0f766e";
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Shield shape
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;

  ctx.save();
  ctx.translate(cx, cy - 10 * scale);

  // Shield outline
  const sw = 160 * scale; // half-width
  const sh = 200 * scale; // height
  const st = -100 * scale; // top

  ctx.beginPath();
  ctx.moveTo(0, st - 20 * scale); // top center peak
  ctx.lineTo(-sw, st + 10 * scale); // top left
  ctx.lineTo(-sw, st + sh * 0.55); // left side
  ctx.quadraticCurveTo(-sw, st + sh * 0.85, 0, st + sh + 20 * scale); // bottom curve left
  ctx.quadraticCurveTo(sw, st + sh * 0.85, sw, st + sh * 0.55); // bottom curve right
  ctx.lineTo(sw, st + 10 * scale); // right side
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fill();

  // Checkmark inside shield
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 18 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-50 * scale, 10 * scale);
  ctx.lineTo(-10 * scale, 50 * scale);
  ctx.lineTo(55 * scale, -35 * scale);
  ctx.stroke();

  ctx.restore();

  return canvas.toBuffer("image/png");
}

// Generate all icon sizes
const icons = [
  { size: 192, maskable: false, name: "icon-192x192.png" },
  { size: 512, maskable: false, name: "icon-512x512.png" },
  { size: 192, maskable: true, name: "icon-maskable-192x192.png" },
  { size: 512, maskable: true, name: "icon-maskable-512x512.png" },
  { size: 180, maskable: false, name: "apple-touch-icon.png" },
  { size: 32, maskable: false, name: "favicon-32x32.png" },
  { size: 16, maskable: false, name: "favicon-16x16.png" },
];

for (const icon of icons) {
  const buffer = generateIcon(icon.size, icon.maskable);
  writeFileSync(`public/icons/${icon.name}`, buffer);
  console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
}

console.log("All icons generated!");
