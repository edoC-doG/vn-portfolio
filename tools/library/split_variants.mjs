// Splits a library model that holds several variants side by side (Poly Haven grass, ferns, shrubs) into one .glb per
// variant, each at the origin, with blended alpha turned into a cutout (instanced foliage cannot be depth-sorted).
// Usage (from tools/): node library/split_variants.mjs <in .gltf/.glb under assets/library> <out dir under assets/library> <node> [node...]
import path from 'path';
import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

const lib = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/library');
const [src, outDir, ...names] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
fs.mkdirSync(path.join(lib, outDir), { recursive: true });
for (const name of names) {
  const doc = await io.read(path.join(lib, src));
  const root = doc.getRoot(), scene = root.listScenes()[0];
  const keep = root.listNodes().find((n) => n.getName() === name);
  if (!keep) { console.log('no node', name); continue; }
  for (const n of scene.listChildren()) if (n !== keep) scene.removeChild(n);
  keep.setTranslation([0, 0, 0]);
  for (const m of root.listMaterials()) if (m.getAlphaMode() === 'BLEND') { m.setAlphaMode('MASK'); m.setAlphaCutoff(0.5); }
  await doc.transform(prune());
  const out = path.join(lib, outDir, `${name}.glb`);
  await io.write(out, doc);
  console.log('wrote', path.relative(lib, out), Math.round(fs.statSync(out).size / 1024), 'KB');
}
