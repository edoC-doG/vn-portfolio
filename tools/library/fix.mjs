// Converts library models that use the retired KHR_materials_pbrSpecularGlossiness extension (three.js no longer reads it,
// so they render white) to metal/rough, in place. Usage (from tools/): node library/fix.mjs [dir under assets/library]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs'; import path from 'path';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const base = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/library', process.argv[2] || 'sketchfab');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let n = 0;
for (const f of walk(base).filter((f) => f.endsWith('.glb'))) {
  const doc = await io.read(f);
  if (!doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === 'KHR_materials_pbrSpecularGlossiness')) continue;
  await doc.transform(metalRough());
  await io.write(f, doc); n++;
  console.log('converted', path.relative(base, f));
}
console.log(n, 'files converted');
