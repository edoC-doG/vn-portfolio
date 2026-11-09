// Fills the build-time placeholders in app.js. Shared by prototype/fly/build.mjs (the single-page preview) and
// web/scripts/sync.mjs (the Next.js site), so the scene code has one source.
//   /*TERRAIN_TEX*/  terrain texture manifest from tools/textures/process.mjs (null: the shader falls back to noise)
//   /*MODELS*/       models present in both tiers (a Meshy slot such as 'nha-hoi-an-1' lights up once its file exists)
//   /*CREDITS*/      CC BY credits for the Sketchfab models in use, matched through the library lists
//   /*ASSET_BASE*/   null for base64 .txt files next to the page, or a path such as '/' for plain files
//   /*VN_MAP*/       the true-shape outline for the overview map, from tools/map/build_map.mjs
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

export function buildData() {
  const terrainTex = path.join(root, 'assets/textures/terrain.json');
  const terrain = fs.existsSync(terrainTex) ? fs.readFileSync(terrainTex, 'utf8').trim() : 'null';
  const models = (t) => new Set(fs.readdirSync(path.join(root, 'assets/models', t)).filter((f) => f.endsWith('.glb')).map((f) => f.slice(0, -4)));
  const mid = models('mid'), low = models('low');
  const modelList = [...mid].filter((m) => low.has(m)).sort();
  const lib = path.join(root, 'tools/library');
  const props = JSON.parse(fs.readFileSync(path.join(lib, 'props.json'), 'utf8')), sf = JSON.parse(fs.readFileSync(path.join(lib, 'sketchfab.json'), 'utf8'));
  const credits = Object.entries(props).filter(([slug]) => mid.has(slug)).map(([, p]) => sf.find((m) => p.src.includes(m.uid.slice(0, 8))))
    .filter(Boolean).map((m) => ({ name: m.name, author: m.author, url: m.url }));
  const vnMap = fs.readFileSync(path.join(root, 'assets/map/vietnam.json'), 'utf8').trim();
  return { terrain, modelList, credits, vnMap };
}

export function injectApp(app, { assetBase = null } = {}) {
  const d = buildData();
  const out = app
    .replace('/*TERRAIN_TEX*/ null', () => d.terrain)
    .replace('/*MODELS*/ null', () => JSON.stringify(d.modelList))
    .replace('/*CREDITS*/ null', () => JSON.stringify(d.credits))
    .replace('/*ASSET_BASE*/ null', () => JSON.stringify(assetBase))
    .replace('/*VN_MAP*/ null', () => d.vnMap);
  return { code: out, ...d };
}

export const ROOT = root;
