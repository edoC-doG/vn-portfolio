// Builds assets/map/vietnam.json, the outline the overview map is drawn from:
//   vn        Vietnam's land (mainland and islands) from Natural Earth 1:10m (public domain), simplified
//   nb        the neighbours in view (China with Hainan, Laos, Cambodia, Thailand, Myanmar), clipped to the frame
//   hoangSa,
//   truongSa  the Hoàng Sa and Trường Sa archipelagos, as points at their main islands and reefs
// Coordinates are [lon, lat] rounded to 0.001°. Usage (from the repo root): node tools/map/build_map.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const topo = require('../node_modules/world-atlas/countries-10m.json');
const BBOX = [99.5, 6.0, 117.0, 25.0]; // lon0, lat0, lon1, lat1

const area = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };

// Douglas-Peucker on a closed ring
function simplify(ring, tol) {
  const pts = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring.slice(0, -1) : ring.slice();
  if (pts.length < 8) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = 1;
  let far = 0, fd = -1; for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  keep[far] = 1;
  const stack = [[0, far], [far, pts.length]];
  while (stack.length) {
    const [a, b] = stack.pop(), A = pts[a], B = pts[b % pts.length];
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const P = pts[i], dx = B[0] - A[0], dy = B[1] - A[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / L)) : 0;
      const d = (P[0] - A[0] - t * dx) ** 2 + (P[1] - A[1] - t * dy) ** 2;
      if (d > md) { md = d; mi = i; }
    }
    if (mi >= 0 && md > tol * tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// Sutherland-Hodgman against the frame
function clip(ring) {
  const [x0, y0, x1, y1] = BBOX;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]]];
  let out = ring;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

const round = (r) => r.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
function rings(id, { tol, minArea, clipTo }) {
  const g = topo.objects.countries.geometries.find((x) => String(x.id) === id);
  const f = feature(topo, g), polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const out = [];
  for (const poly of polys) {
    let r = poly[0]; // outer ring; the holes are lakes too small to matter at this scale
    if (clipTo) { r = clip(r); if (r.length < 3) continue; }
    if (area(r) < minArea) continue;
    const s = simplify(r, area(r) > 1 ? tol : tol * 0.6);
    if (s.length >= 3) out.push(round(s));
  }
  return out;
}

const vn = rings('704', { tol: 0.008, minArea: 0.0007 });
const nb = ['156', '418', '116', '764', '104'].flatMap((id) => rings(id, { tol: 0.03, minArea: 0.01, clipTo: true }));

// main islands and reefs of the two archipelagos (approximate positions)
const hoangSa = [[112.336, 16.834], [111.608, 16.533], [111.2, 15.783], [112.733, 16.667], [111.71, 16.45], [111.74, 16.46], [111.77, 16.05],
  [112.27, 16.98], [111.5, 17.1], [111.58, 16.5], [112.2, 16.95], [111.92, 16.25]];
const truongSa = [[111.918, 8.644], [114.33, 11.43], [114.35, 11.45], [114.33, 9.885], [114.36, 10.18], [114.365, 10.377], [114.48, 10.38],
  [114.28, 11.05], [114.42, 10.67], [112.92, 7.87], [113.68, 8.95], [112.2, 8.85], [114.65, 8.85], [113.3, 8.1], [114.37, 9.75],
  [114.25, 9.77], [111.67, 8.67], [114.57, 10.41], [112.6, 8.82], [114.55, 9.9]];

const out = { source: 'Natural Earth 1:10m Admin 0 countries via world-atlas (public domain)', vn, nb, hoangSa, truongSa };
const file = path.join(here, '../../assets/map/vietnam.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out));
const pts = (rs) => rs.reduce((n, r) => n + r.length, 0);
console.log(`vietnam.json: ${vn.length} VN rings (${pts(vn)} points, largest ${Math.max(...vn.map((r) => r.length))}), ${nb.length} neighbour rings (${pts(nb)} points), ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
