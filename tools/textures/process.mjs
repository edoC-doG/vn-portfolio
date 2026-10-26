// Terrain textures: picks the downloaded Poly Haven / ambientCG sets named in terrain.json and writes
//   assets/textures/terrain-<layer>.jpg      colour, 512 px
//   assets/textures/terrain-<layer>-n.jpg    normal (OpenGL convention), 512 px
//   assets/textures/terrain.json             which layers exist and their average linear colour (the shader divides by it,
//                                            so a texture adds detail without changing the tint of each region)
// Usage (from tools/): node textures/process.mjs [incoming dir, default ../assets/incoming]
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const incoming = path.resolve(process.argv[2] || path.join(here, '../../assets/incoming'));
const out = path.join(here, '../../assets/textures');
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'terrain.json'), 'utf8'));
const SIZE = 512;

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pick = (files, re, not) => files.find((f) => re.test(path.basename(f)) && !(not && not.test(path.basename(f))));
const IMG = /\.(jpe?g|png|webp|tiff?|exr)$/i;

const manifest = {};
for (const [layer, names] of Object.entries(cfg)) {
  if (layer.startsWith('_')) continue;
  const dir = names.map((n) => path.join(incoming, n)).find((d) => fs.existsSync(d));
  if (!dir) { console.log(layer.padEnd(7), 'missing: put one of', names.join(', '), 'in', incoming); continue; }
  const files = walk(dir).filter((f) => IMG.test(f));
  const color = pick(files, /(diff|diffuse|color|albedo|basecolor)/i, /(normal|nor_)/i);
  let normal = pick(files, /(nor_gl|normalgl|normal_gl)/i), flipY = false;
  if (!normal) { normal = pick(files, /(nor_dx|normaldx|normal_dx)/i); flipY = !!normal; } // DirectX normals: green channel flipped
  if (!normal) normal = pick(files, /(normal|_nor)/i);
  if (!color) { console.log(layer.padEnd(7), 'no colour map in', dir); continue; }
  const cOut = path.join(out, `terrain-${layer}.jpg`);
  await sharp(color).resize(SIZE, SIZE).removeAlpha().jpeg({ quality: 86, mozjpeg: true }).toFile(cOut);
  // average colour in linear space, which is what the shader sees after sRGB decoding
  const { data, info } = await sharp(cOut).raw().toBuffer({ resolveWithObject: true });
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const sum = [0, 0, 0]; for (let i = 0; i < data.length; i += info.channels) for (let c = 0; c < 3; c++) sum[c] += lin(data[i + c]);
  const mean = sum.map((v) => +(v / (data.length / info.channels)).toFixed(4));
  manifest[layer] = { mean, normal: false, source: path.basename(dir) };
  if (normal) {
    let img = sharp(normal).resize(SIZE, SIZE).removeAlpha();
    if (flipY) { const { data, info } = await img.raw().toBuffer({ resolveWithObject: true }); for (let i = 1; i < data.length; i += info.channels) data[i] = 255 - data[i]; img = sharp(data, { raw: info }); }
    await img.jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(out, `terrain-${layer}-n.jpg`));
    manifest[layer].normal = true;
  }
  console.log(layer.padEnd(7), path.basename(dir), '| colour', path.basename(color), '| normal', normal ? path.basename(normal) + (flipY ? ' (flipped from DirectX)' : '') : 'none', '| mean', mean.join(' '));
}
fs.writeFileSync(path.join(out, 'terrain.json'), JSON.stringify(manifest, null, 2) + '\n');
