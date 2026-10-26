// Prototype of the "Từ Lũng Cú đến Cà Mau" night river scene, used to render storyboard frames.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const P = new URLSearchParams(location.search);
const W = +(P.get('w') || 1600), H = +(P.get('h') || 900);
const MODEL_DIR = P.get('models') || '/assets/models/high';

// ---------- seeded noise ----------
let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, z) => vnoise(x, z) * 0.6 + vnoise(x * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, z * 4.3) * 0.1;

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const FOG = new THREE.Color(0x173039);
scene.fog = new THREE.FogExp2(FOG, 0.0045);
scene.background = FOG;

// ---------- palette ----------
const C = {
  bank: 0x13231f, bankHi: 0x22382c, rock: 0x34474a, rice: 0x3d5a2c, riceWater: 0x6f8f86,
  sand: 0xb89a6a, palm: 0x1f3a22, trunk: 0x4a3a2a, lantern: 0xff5a2e, lanternGold: 0xffb347,
  dragon: 0xd9a23a, window: 0xffd9a0, tower: 0x8a96a0,
};

// ---------- sky ----------
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(4000, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x050b16) }, mid: { value: new THREE.Color(0x0f2a3a) }, horizon: { value: new THREE.Color(0x173039) } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP;
      void main(){ float h = clamp(vP.y, -0.1, 1.0);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h));
        gl_FragColor = vec4(c, 1.0); }`,
  })
);
scene.add(sky);

const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 1600; i++) {
  const th = rand() * Math.PI * 2, ph = Math.acos(0.15 + rand() * 0.85);
  starPos.push(Math.sin(ph) * Math.cos(th) * 3500, Math.cos(ph) * 3500, Math.sin(ph) * Math.sin(th) * 3500);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfe6ff, size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
scene.add(stars);

function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.55)')); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = glowTexture();

const moonGroup = new THREE.Group();
const moon = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false }));
moonGroup.add(moon);
const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: 0xbfd8ff, transparent: true, opacity: 0.55, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
moonHalo.scale.set(380, 380, 1); moonHalo.material.opacity = 0.4; moonGroup.add(moonHalo);
scene.add(moonGroup);

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0x7f9fc0, 0x0e1a16, 0.8));
const moonLight = new THREE.DirectionalLight(0xa9c4ff, 1.8);
scene.add(moonLight); scene.add(moonLight.target);
const warmFill = new THREE.DirectionalLight(0xffc38a, 0.35);
warmFill.position.set(-1, 0.4, 1); scene.add(warmFill);

// environment for subtle reflections on water
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene(); envScene.add(sky.clone());
scene.environment = pmrem.fromScene(envScene, 0.02).texture;
scene.environmentIntensity = 0.5;

// ---------- the S path ----------
export const STOPS = [
  { id: 'lung-cu', name: 'Lũng Cú', p: [0, 0] },
  { id: 'ha-noi', name: 'Hà Nội', p: [26, -110] },
  { id: 'ha-long', name: 'Hạ Long', p: [56, -220] },
  { id: 'hue', name: 'Huế', p: [22, -330] },
  { id: 'da-nang', name: 'Đà Nẵng, Hội An', p: [-18, -440] },
  { id: 'tay-nguyen', name: 'Tây Nguyên', p: [-56, -550] },
  { id: 'nha-trang', name: 'Nha Trang', p: [-24, -660] },
  { id: 'phan-thiet', name: 'Phan Thiết', p: [6, -770] },
  { id: 'sai-gon', name: 'Sài Gòn', p: [32, -880] },
  { id: 'mien-tay', name: 'Miền Tây', p: [6, -990] },
  { id: 'ca-mau', name: 'Mũi Cà Mau', p: [-18, -1100] },
];
const path = new THREE.CatmullRomCurve3(
  [[0, 60], ...STOPS.map(s => s.p), [-30, -1240]].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal'
);
const pathPts = path.getSpacedPoints(900);
function pathXAt(z) {
  let best = pathPts[0];
  for (const p of pathPts) if (Math.abs(p.z - z) < Math.abs(best.z - z)) best = p;
  return best.x;
}

// ---------- water ----------
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(6000, 6000, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x07161c, roughness: 0.5, metalness: 0.0, envMapIntensity: 0.8 })
);
water.rotation.x = -Math.PI / 2; scene.add(water);

// moon glint on water (follows camera, fake reflection)


// ---------- banks: terrain on both sides of the river ----------
function regionLift(z, side) {
  // returns [baseHeight, roughness]
  if (z > -40) return [side > 0 ? 6 : 3, 6];                 // Lũng Cú highlands
  if (z > -160) return [2.2, 2];                              // Hà Nội plain
  if (z > -280) return [-3, 0];                               // Hạ Long: open bay
  if (z > -380) return [3, 3];                                // Huế
  if (z > -500) return [side > 0 ? 9 : 3, 6];                 // Đà Nẵng: hills on the right
  if (z > -610) return [7, 7];                                // Tây Nguyên plateau
  if (z > -720) return [side > 0 ? 6 : 2.5, 5];               // Nha Trang
  if (z > -830) return [2, 2];                                // Phan Thiết
  if (z > -940) return [1.6, 0.6];                            // Sài Gòn
  if (z > -1050) return [1.1, 0.5];                           // Miền Tây
  return [side > 0 ? 1.2 : -2, 0.5];                          // Cà Mau cape
}
function distToPath(x, z) {
  let best = 1e9, bx = 0;
  for (let i = 0; i < pathPts.length; i++) { const p = pathPts[i]; if (Math.abs(p.z - z) > 70) continue; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) { best = d; bx = p.x; } }
  return [Math.sqrt(best), x >= bx ? 1 : -1];
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function terrainHeight(x, z) {
  const [d, side] = distToPath(x, z);
  const [base, rough] = regionLift(z, side);
  const bank = smooth(14, 26, d);
  let y = -2.5 + bank * (base + 2.5) + fbm(x * 0.03, z * 0.03) * rough * bank;
  y += smooth(70, 320, d) * (14 + fbm(x * 0.01, z * 0.01) * 40) * (z > -280 && z < -160 ? 0.2 : 1);
  if (z > -90) y += smooth(40, 200, d) * smooth(-90, 60, z) * (30 + fbm(x * 0.015, z * 0.015) * 70);
  return y;
}
function buildTerrain() {
  const sx = 900, sz = 1700, nx = 225, nz = 425;
  const g = new THREE.PlaneGeometry(sx, sz, nx, nz); g.rotateX(-Math.PI / 2); g.translate(0, 0, -560);
  const p = g.attributes.position, col = [];
  const cA = new THREE.Color(C.bank), cB = new THREE.Color(C.bankHi), sand = new THREE.Color(0x6b5a3e), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i); const y = terrainHeight(x, z); p.setY(i, y);
    tmp.copy(cA).lerp(cB, fbm(x * 0.05, z * 0.05));
    if (y < 0.6) tmp.lerp(sand, 0.35);
    col.push(tmp.r, tmp.g, tmp.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
}
scene.add(buildTerrain());

// ---------- helpers ----------
const loader = new GLTFLoader();
async function place(slug, scale, x, y, z, rotY = 0) {
  const g = await loader.loadAsync(`${MODEL_DIR}/${slug}.glb`);
  const o = g.scene; o.scale.setScalar(scale); o.position.set(x, y, z); o.rotation.y = rotY;
  o.traverse(m => { if (m.isMesh && m.material) { m.material.envMapIntensity = 0.6; } });
  scene.add(o); return o;
}
function groundAt(x, z) { return terrainHeight(x, z); }
function pedestal(x, z, r, h, color = C.bankHi) {
  const g0 = Math.max(groundAt(x, z), -2.5);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.25, h + 3, 18), new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
  m.position.set(x, g0 + (h - 3) / 2, z); scene.add(m); return g0 + h;
}
function lantern(x, y, z, color = C.lantern, s = 0.45) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.2) }));
  body.scale.y = 1.15; g.add(body);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(s * 9, s * 9, 1); g.add(halo);
  g.position.set(x, y, z); scene.add(g); return g;
}
function fireflies(cx, cz, n, spread, yMin, yMax) {
  const pos = [];
  for (let i = 0; i < n; i++) pos.push(cx + (rand() - 0.5) * spread, yMin + rand() * (yMax - yMin), cz + (rand() - 0.5) * spread);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd8ff8a, size: 3, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })));
}
function palm(x, z, h = 9) {
  const y0 = groundAt(x, z);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, h, 6), new THREE.MeshStandardMaterial({ color: C.trunk, roughness: 1 }));
  trunk.position.y = h / 2; trunk.rotation.z = (rand() - 0.5) * 0.25; g.add(trunk);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.5, 4), new THREE.MeshStandardMaterial({ color: C.palm, roughness: 1, flatShading: true }));
    leaf.position.y = h; leaf.rotation.z = Math.PI / 2 - 0.5; leaf.rotation.y = i / 7 * Math.PI * 2;
    leaf.geometry.translate(0, 2.2, 0); g.add(leaf);
  }
  g.position.set(x, y0, z); scene.add(g);
}

// ---------- stop dressing ----------
const placed = {};
async function build() {
  const S = Object.fromEntries(STOPS.map(s => [s.id, s.p]));

  // 1 Lũng Cú: flag tower on a terraced hill (left bank)
  {
    const [px, pz] = S['lung-cu']; const hx = px - 34, hz = pz - 6; const g0 = groundAt(hx, hz);
    for (let i = 0; i < 9; i++) {
      const r = 26 - i * 2.6, h = 1.6;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.6, h, 40, 1), new THREE.MeshStandardMaterial({ color: i % 2 ? C.rice : 0x35502a, roughness: 0.9, flatShading: true }));
      ring.scale.z = 0.7; ring.position.set(hx, g0 + i * h + 0.2, hz); scene.add(ring);
      const wet = new THREE.Mesh(new THREE.TorusGeometry(r - 0.4, 0.1, 4, 48), new THREE.MeshStandardMaterial({ color: 0x3e5a58, roughness: 0.35 }));
      wet.rotation.x = Math.PI / 2; wet.scale.y = 0.7; wet.position.set(hx, g0 + i * h + h + 0.2, hz); scene.add(wet);
    }
    placed['lung-cu'] = await place('cot-co-lung-cu', 13, hx, g0 + 9 * 1.6 + 0.2, hz, 0.4);
  }
  // 2 Hà Nội: mausoleum on right bank, Turtle Tower on an islet in the river
  {
    const [px, pz] = S['ha-noi'];
    const y = pedestal(px + 34, pz - 4, 18, 3.4, 0x1b2c26);
    placed['ha-noi'] = await place('lang-bac', 20, px + 34, y, pz - 4, -0.35);
    const iy = pedestal(px - 6, pz + 10, 4.2, 1.2, 0x223428);
    placed['thap-rua'] = await place('thap-rua', 6.5, px - 6, iy, pz + 10, 0.6);
    lantern(px + 22, 4, pz + 8, C.lanternGold, 0.3); lantern(px + 46, 4, pz + 8, C.lanternGold, 0.3);
  }
  // 3 Hạ Long: karsts in an open bay, junk boat on the water
  {
    const [px, pz] = S['ha-long'];
    const rockMat = new THREE.MeshStandardMaterial({ color: C.rock, roughness: 0.95, flatShading: true });
    for (let i = 0; i < 34; i++) {
      const ang = rand() * Math.PI * 2, dist = 22 + rand() * 120;
      const x = px + Math.cos(ang) * dist, z = pz - 20 + Math.sin(ang) * Math.min(dist, 90) * 0.9;
      if (z > pz + 45) continue;
      if (Math.abs(x - pathXAt(z)) < 14 && z > pz - 60 && z < pz + 40) continue;
      const geo = new THREE.IcosahedronGeometry(1, 3); const p = geo.attributes.position;
      for (let k = 0; k < p.count; k++) { const v = new THREE.Vector3().fromBufferAttribute(p, k); const n = 1 + (vnoise(v.x * 2 + i, v.y * 2 + v.z * 2) - 0.5) * 0.45; v.multiplyScalar(n); p.setXYZ(k, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      const r = 6 + rand() * 9, h = 18 + rand() * 30;
      const m = new THREE.Mesh(geo, rockMat); m.scale.set(r, h, r * (0.8 + rand() * 0.4)); m.position.set(x, h * 0.45, z); m.rotation.y = rand() * 3; scene.add(m);
    }
    placed['ha-long'] = await place('thuyen-buom', 14, px - 4, -0.4, pz + 6, 2.2);
  }
  // 4 Huế: Phước Duyên tower on the left bank, conical hats drifting
  {
    const [px, pz] = S['hue'];
    const y = pedestal(px - 32, pz - 4, 10, 4.2, 0x1d2e27);
    placed['hue'] = await place('thap-phuoc-duyen', 22, px - 32, y, pz - 4, 0.3);
    for (let i = 0; i < 5; i++) {
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.7, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xe9dcb8, roughness: 0.8, side: THREE.DoubleSide }));
      hat.position.set(px - 8 + i * 3.2, 0.25, pz + 14 - i * 5); hat.rotation.set(0.5, i, 0.3); scene.add(hat);
    }
    lantern(px - 22, 6, pz + 2, C.lanternGold, 0.35);
  }
  // 5 Đà Nẵng, Hội An: Golden Bridge on the right hills, Dragon Bridge across the river, floating lanterns, basket boat
  {
    const [px, pz] = S['da-nang'];
    placed['da-nang'] = await place('cau-vang', 34, px + 44, 10, pz - 6, -0.5);
    // Dragon Bridge: a golden wave spanning the river
    const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(new THREE.Vector3(px - 30 + t * 60, 4 + Math.sin(t * Math.PI * 3) * 2.2 + Math.sin(t * Math.PI) * 2, pz - 34)); }
    const body = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.55, 8), new THREE.MeshStandardMaterial({ color: C.dragon, emissive: 0x7a4a10, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.4 }));
    scene.add(body);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0x2a3634, roughness: 0.8 }));
    deck.position.set(px, 2.2, pz - 34); scene.add(deck);
    for (let i = 0; i < 6; i++) { const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3, 8), deck.material); pier.position.set(px - 25 + i * 10, 0.6, pz - 34); scene.add(pier); }
    const head = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3, 6), body.material); head.rotation.z = -Math.PI / 2.4; head.position.set(px + 31, 6.5, pz - 34); scene.add(head);
    for (let i = 0; i < 42; i++) lantern(px - 10 + rand() * 24, 0.35, pz + 30 - rand() * 50, rand() > 0.3 ? C.lantern : C.lanternGold, 0.32);
    placed['thuyen-thung'] = await place('thuyen-thung', 3.2, px - 4, -0.2, pz + 12, 0.8);
  }
  // 6 Tây Nguyên: rong house and gongs on the left plateau, fireflies
  {
    const [px, pz] = S['tay-nguyen']; const gx = px - 34, gz = pz - 2; const y = groundAt(gx, gz);
    placed['tay-nguyen'] = await place('nha-rong', 17, gx, y, gz, 0.5);
    placed['cong-chieng'] = await place('cong-chieng', 3.2, gx + 12, y, gz + 8, 0.9);
    fireflies(gx + 6, gz + 6, 140, 50, y + 1, y + 10);
    lantern(gx + 9, y + 2.5, gz + 9, C.lanternGold, 0.4);
  }
  // 7 Nha Trang: Po Nagar towers set into the right hillside, the sea opening behind
  {
    const [px, pz] = S['nha-trang']; const gx = px + 40, gz = pz - 4;
    placed['nha-trang'] = await place('thap-ba-ponagar', 34, gx, groundAt(gx, gz) - 2.5, gz, -0.7);
  }
  // 8 Phan Thiết: water tower on the left bank, sand dunes
  {
    const [px, pz] = S['phan-thiet']; const gx = px - 30, gz = pz - 2;
    const duneGeo = new THREE.PlaneGeometry(220, 160, 90, 60); const dp = duneGeo.attributes.position;
    for (let k = 0; k < dp.count; k++) { const x = dp.getX(k), y = dp.getY(k); const fx = smooth(110, 70, Math.abs(x)) * smooth(80, 50, Math.abs(y)); dp.setZ(k, -3 + fx * (3 + Math.max(0, Math.sin(x * 0.05 + vnoise(x * 0.03, y * 0.03) * 3) * 6 + vnoise(x * 0.02, y * 0.02) * 10))); }
    duneGeo.computeVertexNormals();
    const dunes = new THREE.Mesh(duneGeo, new THREE.MeshStandardMaterial({ color: C.sand, roughness: 1 })); dunes.rotation.x = -Math.PI / 2; dunes.position.set(px - 130, 1, pz - 40); scene.add(dunes);
    const y = pedestal(gx, gz, 7, 3, 0x2a3328);
    placed['phan-thiet'] = await place('thap-nuoc-phan-thiet', 18, gx, y, gz, 0.2);
  }
  // 9 Sài Gòn: Bến Thành market on the right bank, skyline with Landmark 81 and Bitexco behind
  {
    const [px, pz] = S['sai-gon']; const gx = px + 36, gz = pz - 2;
    const y = pedestal(gx, gz, 16, 2.6, 0x202a28);
    placed['sai-gon'] = await place('cho-ben-thanh', 22, gx, y, gz, -0.4);
    // window texture
    const wc = document.createElement('canvas'); wc.width = 64; wc.height = 256; const g = wc.getContext('2d');
    g.fillStyle = '#0c1416'; g.fillRect(0, 0, 64, 256);
    for (let yy = 0; yy < 64; yy++) for (let xx = 0; xx < 8; xx++) if (rand() > 0.45) { g.fillStyle = rand() > 0.2 ? '#ffd9a0' : '#9fd0ff'; g.fillRect(xx * 8 + 2, yy * 4 + 1, 4, 2); }
    const wtex = new THREE.CanvasTexture(wc); wtex.colorSpace = THREE.SRGBColorSpace; wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping;
    const bmat = (rx, ry) => { const t = wtex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ color: 0x10181a, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.9, roughness: 0.6 }); };
    for (let i = 0; i < 28; i++) {
      const w = 6 + rand() * 8, h = 14 + rand() * 40, d = 6 + rand() * 8;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bmat(1, h / 20));
      b.position.set(px + 60 + rand() * 90, h / 2, pz - 20 - rand() * 90); scene.add(b);
    }
    // Landmark 81: bundled stepped towers
    const lmx = px + 92, lmz = pz - 70; const parts = [[0, 0, 120], [5, 0, 104], [-5, 0, 98], [0, 5, 90], [0, -5, 84], [5, 5, 72], [-5, -5, 66], [5, -5, 58], [-5, 5, 50]];
    for (const [ox, oz, h] of parts) { const t = new THREE.Mesh(new THREE.BoxGeometry(5, h, 5), bmat(1, h / 18)); t.position.set(lmx + ox, h / 2, lmz + oz); scene.add(t); }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 14, 6), new THREE.MeshBasicMaterial({ color: 0xffe6b8 })); spire.position.set(lmx, 127, lmz); scene.add(spire);
    // Bitexco: tapered lotus-bud tower with a helipad disc
    const bt = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 7, 84, 20), bmat(4, 5)); bt.position.set(px + 62, 42, pz - 46); scene.add(bt);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x2a3436, emissive: 0x4a3418, emissiveIntensity: 0.6 })); pad.position.set(px + 62 - 4, 66, pz - 46); scene.add(pad);
  }
  // 10 Miền Tây: floating-market boats, coconut palms
  {
    const [px, pz] = S['mien-tay'];
    placed['mien-tay'] = await place('ghe-cho-noi', 11, px - 2, -0.2, pz + 4, 1.9);
    await place('ghe-cho-noi', 9, px + 8, -0.2, pz - 18, 1.3);
    for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1; const z = pz + 60 - rand() * 130; palm(pathXAt(z) + side * (20 + rand() * 40), z, 7 + rand() * 5); }
    fireflies(px - 20, pz, 120, 60, 1, 8);
    lantern(px - 1, 3.6, pz + 4, C.lanternGold, 0.3);
  }
  // 11 Mũi Cà Mau: ship monument on the cape, mangroves, open sea
  {
    const [px, pz] = S['ca-mau']; const gx = px + 14, gz = pz - 12;
    const y = pedestal(gx, gz, 9, 2.2, 0x26302c);
    placed['ca-mau'] = await place('mui-ca-mau', 14, gx, y, gz, -1.2);
    const mg = new THREE.MeshStandardMaterial({ color: 0x14261b, roughness: 1, flatShading: true });
    for (let i = 0; i < 70; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + rand() * 2.2, 0), mg); const z = pz + 50 - rand() * 70; b.position.set(pathXAt(z) + 18 + rand() * 50, 1.2, z); b.scale.y = 0.7; scene.add(b); }
  }
}

const introGroup = new THREE.Group(); scene.add(introGroup);
for (const st of STOPS) { const l = lantern(st.p[0], 2, st.p[1], C.lanternGold, 2.2); scene.remove(l); introGroup.add(l); }
introGroup.add(new THREE.Mesh(new THREE.TubeGeometry(path, 600, 1.1, 6), new THREE.MeshBasicMaterial({ color: 0xffc77a, transparent: true, opacity: 0.85 })));
introGroup.visible = false;

// ---------- camera + composer ----------
const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 5000);
const hero = new THREE.SpotLight(0xffd2a0, 2.6, 0, 0.45, 0.85, 0); scene.add(hero); scene.add(hero.target);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.75, 0.55, 0.82));
composer.addPass(new OutputPass());

// Frame a shot. side: where the landmark should sit ('left' | 'right' | 'top' for phone).
function shoot({ cam, target, side = 'left', fov = 38, shift = 0.42, fog = 0.0045, heroAt = null, intro = false }) {
  introGroup.visible = intro; moonGroup.visible = !intro;
  scene.fog.density = fog;
  if (heroAt) { const [hx, hy, hz] = heroAt; hero.visible = true; hero.target.position.set(hx, hy, hz); hero.position.set(cam[0] + 4, cam[1] + 12, cam[2] + 10); hero.angle = 0.32; } else hero.visible = false;
  camera.fov = fov;
  camera.position.set(...cam);
  camera.lookAt(new THREE.Vector3(...target));
  if (side === 'left' || side === 'right') {
    const full = W * (1 + shift);
    camera.aspect = full / H; camera.setViewOffset(full, H, side === 'left' ? W * shift : 0, 0, W, H);
  } else if (side === 'top') {
    const fullH = H * (1 + shift);
    camera.aspect = W / fullH; camera.setViewOffset(W, fullH, 0, H * shift, W, H);
  } else { camera.aspect = W / H; camera.clearViewOffset(); }
  camera.updateProjectionMatrix();
  // moon sits ahead of the camera, slightly left and high
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
  const left = new THREE.Vector3(fwd.z, 0, -fwd.x);
  moonGroup.position.copy(camera.position).addScaledVector(fwd, 2600).addScaledVector(left, 700).add(new THREE.Vector3(0, 900, 0));
  moonLight.position.copy(camera.position).addScaledVector(fwd, -260).addScaledVector(left, 320).add(new THREE.Vector3(0, 420, 0)); moonLight.target.position.copy(camera.position).addScaledVector(fwd, 60);
  composer.setSize(W, H);
  composer.render();
}

window.__ready = build().then(() => true);
window.__shoot = shoot;
window.__STOPS = STOPS;
window.__placed = placed;
window.__pathXAt = pathXAt;
window.__THREE = THREE;
