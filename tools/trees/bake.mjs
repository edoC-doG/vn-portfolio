// Bakes the forest trees. Usage (from tools/): node trees/bake.mjs
// Writes assets/models/{mid,low}/tree-<kind>.glb and assets/textures/tree-impostors.png
import { chromium } from 'playwright';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
const tools = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const assets = path.join(tools, '../assets');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.route('http://bake.local/**', (r) => { const p = new URL(r.request().url()).pathname; r.fulfill({ path: path.join(tools, p), contentType: p.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto('http://bake.local/trees/bake.html');
await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
const out = await page.evaluate(() => window.bake());
await browser.close();

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const TEX = { mid: 256, low: 128 };
for (const [key, data] of Object.entries(out.glb)) {
  const [lvl, kind] = key.split('/');
  const doc = await io.readBinary(new Uint8Array(Buffer.from(data, 'base64')));
  for (const m of doc.getRoot().listMaterials()) m.setMetallicFactor(0).setRoughnessFactor(0.9);
  await doc.transform(dedup(), prune(), weld(), textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 82, resize: [TEX[lvl], TEX[lvl]] }));
  const file = path.join(assets, 'models', lvl, `tree-${kind}.glb`);
  fs.writeFileSync(file, await io.writeBinary(doc));
  console.log(key.padEnd(10), String(out.tris[key]).padStart(6), 'tris', (fs.statSync(file).size / 1024).toFixed(0).padStart(5), 'KB');
}
const atlas = path.join(assets, 'textures', 'tree-impostors.png');
await sharp(Buffer.from(out.atlas, 'base64')).png({ compressionLevel: 9, palette: false }).toFile(atlas);
console.log('impostors', (fs.statSync(atlas).size / 1024).toFixed(0), 'KB');
