import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, prune, dedup, textureCompress, cloneDocument, quantize, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';

const [,, input, slug, outDir] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

const countTris = (doc) => {
  let t = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const idx = p.getIndices(); t += (idx ? idx.getCount() : p.getAttribute('POSITION').getCount()) / 3;
  }
  return t;
};


function simplifyDoc(d, targetTris, err, permissive) {
  for (const m of d.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const idxAcc = p.getIndices();
    const posAcc = p.getAttribute('POSITION');
    const n = posAcc.getCount();
    const idx = Uint32Array.from(idxAcc.getArray());
    const pos = posAcc.getArray() instanceof Float32Array ? posAcc.getArray() : Float32Array.from(posAcc.getArray());
    const uv = p.getAttribute('TEXCOORD_0'), nor = p.getAttribute('NORMAL');
    const attrs = new Float32Array(n * 5);
    const tmp2 = [0, 0], tmp3 = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      if (uv) { uv.getElement(i, tmp2); attrs[i*5] = tmp2[0]; attrs[i*5+1] = tmp2[1]; }
      if (nor) { nor.getElement(i, tmp3); attrs[i*5+2] = tmp3[0]; attrs[i*5+3] = tmp3[1]; attrs[i*5+4] = tmp3[2]; }
    }
    const target = Math.max(3, Math.floor(targetTris) * 3);
    let [res] = MeshoptSimplifier.simplifyWithAttributes(idx, pos, 3, attrs, 5, [1, 1, 0.25, 0.25, 0.25], null, target, err, permissive ? ['Permissive', 'Prune'] : ['Prune']);
    if (!permissive && res.length > target * 1.6) {
      [res] = MeshoptSimplifier.simplifyWithAttributes(res, pos, 3, attrs, 5, [1, 1, 0.25, 0.25, 0.25], null, Math.floor(target * 1.6 / 3) * 3, err * 2, ['Permissive', 'Prune']);
    }
    if (permissive && res.length > target * 1.3) {
      [res] = MeshoptSimplifier.simplifySloppy(res, pos, 3, null, target, 1.0);
    }
    idxAcc.setArray(res);
    compactPrimitive(p);
  }
}

const t0 = Date.now();
const doc = await io.read(input);
const root = doc.getRoot();

// Keep only base color; stylized scene uses flat PBR values.
for (const mat of root.listMaterials()) {
  mat.setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
  mat.setEmissiveFactor([0, 0, 0]);
  mat.setMetallicFactor(slug === 'cong-chieng' ? 0.55 : 0.0);
  mat.setRoughnessFactor(slug === 'cong-chieng' ? 0.45 : 0.85);
}
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
  for (const sem of p.listSemantics()) if (!['POSITION', 'NORMAL', 'TEXCOORD_0'].includes(sem)) p.setAttribute(sem, null);
}
await doc.transform(prune(), dedup());

// Normalize: largest dimension = 1, centered on X/Z, resting on y = 0.
const scene = root.listScenes()[0];
const b = getBounds(scene);
const size = b.max.map((v, i) => v - b.min[i]);
const s = 1 / Math.max(...size);
const wrapper = doc.createNode('root_' + slug)
  .setScale([s, s, s])
  .setTranslation([-(b.min[0] + size[0] / 2) * s, -b.min[1] * s, -(b.min[2] + size[2] / 2) * s]);
for (const child of scene.listChildren()) { scene.removeChild(child); wrapper.addChild(child); }
scene.addChild(wrapper);

const srcTris = countTris(doc);
await doc.transform(weld());

const tiers = [
  { name: 'high', tris: 50000, tex: 2048, ntex: 1024, normal: true, error: 0.02 },
  { name: 'mid', tris: 15000, tex: 1024, normal: false, error: 0.05 },
  { name: 'low', tris: +(process.env.LOWTRIS || 3000), tex: 512, normal: false, error: 0.1 },
];
const result = { slug, srcTris, size: size.map(v => +(v * s).toFixed(3)), tiers: {} };
let work = doc;
for (const tier of tiers) {
  const cur = countTris(work);
  if (cur > tier.tris * 1.05) {
    simplifyDoc(work, tier.tris, tier.error, tier.name === 'low');
  }
  const outDoc = cloneDocument(work);
  if (!tier.normal) for (const mat of outDoc.getRoot().listMaterials()) mat.setNormalTexture(null);
  const steps = [textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /baseColor/, resize: [tier.tex, tier.tex], quality: 85 })];
  if (tier.normal) steps.push(textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /normal/, resize: [tier.ntex, tier.ntex], quality: 92 }));
  await outDoc.transform(...steps, prune(), dedup(), quantize());
  fs.mkdirSync(`${outDir}/${tier.name}`, { recursive: true });
  const file = `${outDir}/${tier.name}/${slug}.glb`;
  await io.write(file, outDoc);
  result.tiers[tier.name] = { tris: countTris(outDoc), bytes: fs.statSync(file).size, tex: tier.tex, normal: !!tier.normal };
}
result.seconds = Math.round((Date.now() - t0) / 1000);
console.log(JSON.stringify(result));
