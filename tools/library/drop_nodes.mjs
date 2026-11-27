// Removes the named meshes from a library model (ground planes and display bases that come with some scans and props)
// and writes the rest to a new file next to it.
// Usage (from tools/): node library/drop_nodes.mjs <in .glb under assets/library> <out .glb under assets/library> <node name> [name...]
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

const lib = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/library');
const [src, out, ...names] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(path.join(lib, src));
let n = 0;
for (const node of doc.getRoot().listNodes()) if (names.includes(node.getName())) { node.dispose(); n++; }
await doc.transform(prune());
await io.write(path.join(lib, out), doc);
console.log(`dropped ${n} node(s) -> ${out}`);
