// Builds the single-page prototype into dist/:
//   dist/index.html   page with the script inlined (what gets published)
//   dist/_local.html  same page wrapped in a full document, for local testing
//   dist/models/{low,mid}/*.txt  base64 copies of assets/models (the hosting used for previews cannot serve .glb)
//   dist/textures/*.txt          base64 copies of assets/textures
import fs from 'fs';
import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(here, 'dist');
const page = fs.readFileSync(path.join(here, 'page.html'), 'utf8');
const app = fs.readFileSync(path.join(here, 'app.js'), 'utf8');
// terrain textures prepared by tools/textures/process.mjs (null when there are none yet: the shader falls back to noise)
const terrainTex = path.join(here, '../../assets/textures/terrain.json');
const app2 = app.replace('/*TERRAIN_TEX*/ null', () => (fs.existsSync(terrainTex) ? fs.readFileSync(terrainTex, 'utf8').trim() : 'null'));
const out = page.replace('/*APP*/', () => app2);
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), out);
fs.writeFileSync(path.join(dist, '_local.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${out}</body></html>`);
for (const tier of ['low', 'mid']) {
  const src = path.join(here, '../../assets/models', tier), dst = path.join(dist, 'models', tier);
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.glb'))) fs.writeFileSync(path.join(dst, f.replace('.glb', '.txt')), fs.readFileSync(path.join(src, f)).toString('base64'));
}
{
  const src = path.join(here, '../../assets/textures'), dst = path.join(dist, 'textures');
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/.test(f))) fs.writeFileSync(path.join(dst, f.replace(/\.\w+$/, '.txt')), fs.readFileSync(path.join(src, f)).toString('base64'));
}
console.log('built', (out.length / 1024).toFixed(1), 'KB page + models');
