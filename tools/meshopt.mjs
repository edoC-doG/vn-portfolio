import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs'; import path from 'path';
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const [inDir, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
let a = 0, b = 0;
for (const f of fs.readdirSync(inDir).filter(f => f.endsWith('.glb'))) {
  const doc = await io.read(path.join(inDir, f));
  await doc.transform(reorder({ encoder: MeshoptEncoder }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const out = path.join(outDir, f); await io.write(out, doc);
  const s0 = fs.statSync(path.join(inDir, f)).size, s1 = fs.statSync(out).size; a += s0; b += s1;
  console.log(f, (s0/1024).toFixed(0), '->', (s1/1024).toFixed(0), 'KB');
}
console.log('TOTAL', (a/1048576).toFixed(2), '->', (b/1048576).toFixed(2), 'MB');
