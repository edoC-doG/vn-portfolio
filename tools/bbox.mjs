import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of fs.readdirSync('../models_v2/low')) {
  const doc = await io.read('../models_v2/low/' + f);
  const b = getBounds(doc.getRoot().listScenes()[0]);
  const d = b.max.map((v, i) => (v - b.min[i]).toFixed(2));
  console.log(f.padEnd(26), 'size x,y,z =', d.join(' '), ' minY', b.min[1].toFixed(2));
}
