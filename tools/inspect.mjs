import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const files = process.argv.slice(2);
const out = [];
for (const f of files) {
  const doc = await io.read(f);
  const root = doc.getRoot();
  let tris = 0, verts = 0, prims = 0;
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
    prims++;
    const pos = p.getAttribute('POSITION'); verts += pos.getCount();
    const idx = p.getIndices(); tris += (idx ? idx.getCount() : pos.getCount()) / 3;
  }
  const tex = root.listTextures().map(t => { const s = t.getSize(); return `${s?.[0]}x${s?.[1]} ${t.getMimeType()} ${(t.getImage().byteLength/1e6).toFixed(1)}MB`; });
  const mats = root.listMaterials().map(m => [m.getBaseColorTexture()?'base':'', m.getNormalTexture()?'normal':'', m.getMetallicRoughnessTexture()?'mr':'', m.getEmissiveTexture()?'emis':''].filter(Boolean).join('+'));
  const scene = root.listScenes()[0];
  const b = getBounds(scene);
  const size = b.max.map((v,i)=>+(v-b.min[i]).toFixed(3));
  const center = b.max.map((v,i)=>+((v+b.min[i])/2).toFixed(3));
  out.push({ file: path.basename(f), MB: +(fs.statSync(f).size/1e6).toFixed(1), tris, verts, prims, mats, tex, size, minY: +b.min[1].toFixed(3), center });
}
console.log(JSON.stringify(out, null, 1));
