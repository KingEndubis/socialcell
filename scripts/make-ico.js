/*
  Build-time icon generator
  - Prefer your original branding asset if present
  - Converts SVG/PNG into a multi-size Windows ICO at build/icon.ico
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function rasterizeToPngBuffers(inputBuffer, sizes) {
  const out = [];
  for (const size of sizes) {
    const buf = await sharp(inputBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    out.push(buf);
  }
  return out;
}

async function anyToIco(srcPath, outPath) {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const input = fs.readFileSync(srcPath);
  const pngBuffers = await rasterizeToPngBuffers(input, sizes);
  const icoBuf = await toIco(pngBuffers);
  fs.writeFileSync(outPath, icoBuf);
  console.log(`ICO written: ${outPath}`);
}

(function main() {
  const buildDir = path.resolve(__dirname, '..', 'build');
  const candidates = [
    path.join(buildDir, 'brand.svg'),
    path.join(buildDir, 'brand.png'),
    path.join(buildDir, 'icon.svg'),
    path.join(buildDir, 'icon.png'),
  ];
  const srcPath = candidates.find(p => fs.existsSync(p));
  if (!srcPath) {
    console.error('No icon source found. Place brand.svg/brand.png or icon.svg/icon.png in build/.');
    process.exit(1);
  }
  const outPath = path.join(buildDir, 'icon.ico');
  console.log('Icon source:', srcPath);
  anyToIco(srcPath, outPath).catch(err => {
    console.error('Icon generation failed:', err);
    process.exit(1);
  });
})();