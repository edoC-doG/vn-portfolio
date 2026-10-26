// "Từ Lũng Cú đến Cà Mau": continuous flight prototype.
// Overview of the S-shaped country -> spiral dive at Lũng Cú -> fly the river south, slowing at each stop -> rise over Cà Mau.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const TEST = Q.has('test');

// ---------------------------------------------------------------- device tier
const coarse = matchMedia('(pointer: coarse)').matches;
const smallScreen = Math.min(screen.width, screen.height) < 700;
const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
let lightMode = false;
try { lightMode = localStorage.getItem('lnm-light') === '1'; } catch (e) { /* storage blocked */ }
const TIER = Q.get('tier') || ((lightMode || (coarse && smallScreen) || mem <= 4 || cores <= 4) ? 'low' : 'mid');
const LOW = TIER === 'low';
const nq = (mid, low) => (LOW ? low : mid);

const AVAILABLE = new Set(['cot-co-lung-cu', 'lang-bac', 'thap-rua', 'thuyen-buom', 'thap-phuoc-duyen', 'cau-vang', 'thuyen-thung',
  'nha-rong', 'cong-chieng', 'thap-ba-ponagar', 'thap-nuoc-phan-thiet', 'cho-ben-thanh', 'ghe-cho-noi', 'mui-ca-mau']);
// chua-cau, nha-tho-duc-ba, buu-dien-thanh-pho have slots below and appear once their files are added here.

// ---------------------------------------------------------------- math
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + (b - a) * rand();
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, z) => vnoise(x, z) * 0.6 + vnoise(x * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, z * 4.3) * 0.1;

// ---------------------------------------------------------------- renderer
const canvas = $('#gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, powerPreference: 'high-performance', preserveDrawingBuffer: TEST });
} catch (e) {
  document.documentElement.classList.add('nogl');
  throw e;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const DPR_CAP = LOW ? 1.25 : 1.75;
let dpr = Math.min(window.devicePixelRatio || 1, lightMode ? 1 : DPR_CAP);
renderer.setPixelRatio(dpr);

const scene = new THREE.Scene();
const FOG_COL = new THREE.Color(0x173039);
scene.fog = new THREE.FogExp2(FOG_COL, 0.0042);
scene.background = FOG_COL.clone();
const SH = { uTime: { value: 0 }, uScale: { value: 600 }, uBoost: { value: 1 } };
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 9000);

// materials: Lambert on the light tier, Standard otherwise
function M(o) {
  const { roughness = 0.9, metalness = 0, ...rest } = o;
  return LOW ? new THREE.MeshLambertMaterial(rest) : new THREE.MeshStandardMaterial({ roughness, metalness, ...rest });
}
function bake(list) {
  return mergeGeometries(list.map(([g, m]) => { const c = g.index ? g.toNonIndexed() : g.clone(); if (m) c.applyMatrix4(m); return c; }), false);
}
const MY = (x, y, z, ry = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().makeRotationY(ry).scale(new THREE.Vector3(sx, sy, sz)).setPosition(x, y, z);

// ---------------------------------------------------------------- sky
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(4500, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x050b16) }, mid: { value: new THREE.Color(0x0f2a3a) }, horizon: { value: new THREE.Color(0x173039) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP;
      void main(){ float h = clamp(vP.y, -0.1, 1.0);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  })
);
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
{
  const p = [];
  for (let i = 0; i < nq(1400, 700); i++) {
    const th = rand() * Math.PI * 2, ph = Math.acos(0.12 + rand() * 0.88);
    p.push(Math.sin(ph) * Math.cos(th) * 4000, Math.cos(ph) * 4000, Math.sin(ph) * Math.sin(th) * 4000);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfe6ff, size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
  stars.frustumCulled = false; stars.renderOrder = -9; sky.add(stars);
}
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const moonGroup = new THREE.Group();
moonGroup.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false })));
{
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xbfd8ff, transparent: true, opacity: 0.4, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(380, 380, 1); moonGroup.add(halo);
}
scene.add(moonGroup);

// ---------------------------------------------------------------- lights (fixed count, so shaders never recompile)
const HEMI = new THREE.HemisphereLight(0x7f9fc0, 0x0e1a16, 0.85); scene.add(HEMI);
const moonLight = new THREE.DirectionalLight(0xa9c4ff, 1.7);
scene.add(moonLight, moonLight.target);
const warmFill = new THREE.DirectionalLight(0xffc38a, 0.35); warmFill.position.set(-1, 0.4, 1); scene.add(warmFill);
const heroLight = new THREE.SpotLight(0xffd2a0, 0, 0, 0.34, 0.85, 0); scene.add(heroLight, heroLight.target);
const warmLight = new THREE.PointLight(0xffa25a, 0, 70, 1.6); scene.add(warmLight);
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene(); env.add(sky.clone());
  scene.environment = pmrem.fromScene(env, 0.02).texture;
  scene.environmentIntensity = 0.5;
}

// ---------------------------------------------------------------- the S route
// Stops follow the real east-west order of each place (east = -x, so north is up when seen from the south), spaced evenly north to south.
const STOP_NAMES = ['Lũng Cú', 'Hà Nội', 'Hạ Long', 'Huế', 'Đà Nẵng, Hội An', 'Tây Nguyên', 'Nha Trang', 'Phan Thiết', 'Sài Gòn', 'Miền Tây', 'Mũi Cà Mau'];
const STOP_X = [60, 40, -7, -26, -50, -44, -87, -46, 8, 43, 82].map((x) => x * 1.8); // exaggerated so the S reads from above
const curve = new THREE.CatmullRomCurve3(
  [[STOP_X[0] + 4, 30], ...STOP_X.map((x, i) => [x, -110 * i]), [STOP_X[10] + 16, -1175], [STOP_X[10] + 10, -1270]].map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false, 'centripetal'
);
const N = 1500;
const PX = new Float32Array(N + 1), PZ = new Float32Array(N + 1), TX = new Float32Array(N + 1), TZ = new Float32Array(N + 1);
curve.getSpacedPoints(N).forEach((p, i) => { PX[i] = p.x; PZ[i] = p.z; });
for (let i = 0; i <= N; i++) {
  const a = Math.max(0, i - 2), b = Math.min(N, i + 2);
  const tx = PX[b] - PX[a], tz = PZ[b] - PZ[a], l = Math.hypot(tx, tz);
  TX[i] = tx / l; TZ[i] = tz / l;
}
const LTOT = curve.getLength(), STEP = LTOT / N;
function idxNear(x, z) {
  let lo = 0, hi = N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (PZ[m] > z) lo = m; else hi = m; }
  let best = 1e18, bi = lo;
  for (let i = Math.max(0, lo - 480); i <= Math.min(N, lo + 480); i += 8) { const d = (PX[i] - x) ** 2 + (PZ[i] - z) ** 2; if (d < best) { best = d; bi = i; } }
  const c = bi;
  for (let i = Math.max(0, c - 8); i <= Math.min(N, c + 8); i++) { const d = (PX[i] - x) ** 2 + (PZ[i] - z) ** 2; if (d < best) { best = d; bi = i; } }
  return bi;
}
const A_STOP = STOP_X.map((x, k) => idxNear(x, -110 * k) * STEP);
// position at a stop: lat > 0 is the right (west) bank, along > 0 is further down the river
function at(k, lat, along) {
  const a = clamp(A_STOP[k] + along, 0, LTOT), i = Math.round(a / STEP);
  return { x: PX[i] - TZ[i] * lat, z: PZ[i] + TX[i] * lat, a, i, rot: Math.atan2(-TX[i], -TZ[i]) };
}
function pathPoint(a, out) {
  const f = clamp(a / STEP, 0, N), i = Math.floor(f), j = Math.min(N, i + 1), t = f - i;
  return out.set(PX[i] + (PX[j] - PX[i]) * t, 0, PZ[i] + (PZ[j] - PZ[i]) * t);
}
function seg(a) {
  if (a <= A_STOP[0]) return [0, 0];
  for (let k = 0; k < 10; k++) if (a <= A_STOP[k + 1]) { const t = (a - A_STOP[k]) / (A_STOP[k + 1] - A_STOP[k]); return [k, t * t * (3 - 2 * t)]; }
  return [10, 0];
}
function si(arr, a) { const [k, s] = seg(a); return k >= 10 ? arr[10] : arr[k] + (arr[k + 1] - arr[k]) * s; }

// ---------------------------------------------------------------- land shaped like the country
const WEST = [160, 150, 120, 62, 58, 120, 92, 92, 120, 125, 70];
const EAST = [120, 90, 0, 26, 32, 72, 24, 46, 62, 92, 56];
const CHAN = [9, 17, 11, 11, 11, 9, 11, 11, 12, 14, 15];
const BASE_R = [6, 2.4, 2, 3, 9, 8, 6, 2.4, 1.8, 1.2, 1];
const BASE_L = [6, 2.2, -3, 1.2, 3, 8, 2, 2.2, 1.6, 1.2, 1];
const ROUGH = [6, 2, 1.5, 2.5, 5, 6, 4, 2, 0.6, 0.5, 0.4];
const MOUNT = [95, 14, 10, 26, 42, 30, 32, 8, 3, 1.5, 1];
const COLS = [0x1d3324, 0x1f3526, 0x1d2f2a, 0x1c3326, 0x1d3428, 0x3a2a20, 0x233528, 0x4e3f2c, 0x26302b, 0x1b3a22, 0x15301f].map((c) => new THREE.Color(c));
const capeFade = (a) => 1 - smooth(A_STOP[10] + 20, A_STOP[10] + 85, a);
const widthW = (a) => si(WEST, a) * capeFade(a);
const widthE = (a) => si(EAST, a) * capeFade(a);
const FLAT = [
  { a0: A_STOP[1] - 26, a1: A_STOP[1] + 30, l0: 22, l1: 60, y: 2.4, e: 8 },     // Ba Đình square
  { a0: A_STOP[4] + 58, a1: A_STOP[4] + 142, l0: 13, l1: 48, y: 1.5, e: 10 },   // Hội An quarter
  { a0: A_STOP[9] + 27, a1: A_STOP[9] + 33, l0: 12, l1: 95, y: -1.8, e: 2.5 },  // Miền Tây side canal
];
let TH_A = 0, TH_IN = 0, TH_LAT = 0;
// distance inside the coastline (negative = sea)
function landIn(i, lat, along = 0) {
  const a = i * STEP;
  let v = Math.min(widthW(a) - lat, lat + widthE(a));
  const aN = (i === 0 ? Math.min(along, 0) : a) - A_STOP[0];
  v = Math.min(v, 34 + aN - Math.abs(lat) * (lat > 0 ? 0.62 : 0.8)); // Lũng Cú is the northern tip
  if (i === N && along > 0) v = Math.min(v, -along);
  return v;
}
function terrainHeight(x, z) {
  const i = idxNear(x, z), dx = x - PX[i], dz = z - PZ[i];
  const lat = -dx * TZ[i] + dz * TX[i], along = dx * TX[i] + dz * TZ[i];
  const a = i * STEP, d = Math.abs(lat);
  const inLand = landIn(i, lat, along);
  const ch = si(CHAN, a);
  const base = lat >= 0 ? si(BASE_R, a) : si(BASE_L, a);
  const bank = smooth(ch, ch + 12, d);
  let y = -2.5 + bank * (base + 2.5) + fbm(x * 0.03, z * 0.03) * si(ROUGH, a) * bank;
  const m = si(MOUNT, a);
  if (m > 1.5) {
    const n = fbm(x * 0.012 + 3.1, z * 0.012 - 1.7);
    const karst = 1 - smooth(A_STOP[0] + 30, A_STOP[1] - 10, a); // Hà Giang: sharp limestone peaks
    y += smooth(48, 210, d) * m * lerp(0.3 + 0.7 * n, Math.pow(n, 2) * 2.1, karst);
  }
  for (const f of FLAT) {
    const w = smooth(f.a0 - f.e, f.a0, a) * (1 - smooth(f.a1, f.a1 + f.e, a)) * smooth(f.l0 - f.e, f.l0, lat) * (1 - smooth(f.l1, f.l1 + f.e, lat));
    if (w > 0) y = lerp(y, f.y, w);
  }
  TH_A = a; TH_IN = inLand; TH_LAT = lat;
  return lerp(-6, y, smooth(0, 20, inLand));
}
const gy = terrainHeight;
const SAND = new THREE.Color(0x5e5038), ROCK = new THREE.Color(0x3c4a4a);
function terrainColor(x, y, z, out) {
  const [k, s] = seg(TH_A);
  out.copy(COLS[k]); if (k < 10) out.lerp(COLS[k + 1], s);
  out.multiplyScalar(0.82 + 0.36 * fbm(x * 0.05, z * 0.05));
  if (y < 1.0) out.lerp(SAND, 0.45 * (1 - smooth(0.2, 1.0, y)));
  if (y > 26) out.lerp(ROCK, smooth(26, 80, y) * 0.7);
  return out;
}
const TERRAIN = [];
{
  const x0 = -205, x1 = 295, z0 = 60, z1 = -1225, chunks = 8, cell = LOW ? 5 : 3.4;
  const mat = M({ vertexColors: true, roughness: 0.96, flatShading: true });
  const zLen = (z0 - z1) / chunks, nx = Math.round((x1 - x0) / cell), nz = Math.round(zLen / cell);
  const tmp = new THREE.Color();
  for (let c = 0; c < chunks; c++) {
    const za = z0 - c * zLen;
    const pos = new Float32Array((nx + 1) * (nz + 1) * 3), col = new Float32Array(pos.length);
    let o = 0;
    for (let j = 0; j <= nz; j++) {
      const z = za - (j / nz) * zLen;
      for (let i = 0; i <= nx; i++) {
        const x = x0 + (i / nx) * (x1 - x0), y = terrainHeight(x, z);
        terrainColor(x, y, z, tmp);
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; col[o] = tmp.r; col[o + 1] = tmp.g; col[o + 2] = tmp.b; o += 3;
      }
    }
    const idx = [], H = (v) => pos[v * 3 + 1];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const A = j * (nx + 1) + i, B = A + 1, C = A + nx + 1, D = C + 1;
      if (H(A) > -2.3 || H(B) > -2.3 || H(C) > -2.3) idx.push(A, B, C);
      if (H(B) > -2.3 || H(D) > -2.3 || H(C) > -2.3) idx.push(B, D, C);
    }
    if (!idx.length) continue;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, mat); mesh.userData.zc = za - zLen / 2; scene.add(mesh); TERRAIN.push(mesh);
  }
}

// ---------------------------------------------------------------- water
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(9000, 9000),
  new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x061419) }, uSky: { value: new THREE.Color(0x1d3d4a) },
      uGlint: { value: new THREE.Color(0xd6e6ff) }, uMoon: { value: new THREE.Vector2(0, -1) }, uGlintAmt: { value: 1 },
    }]),
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uTime; uniform vec3 uDeep; uniform vec3 uSky; uniform vec3 uGlint; uniform vec2 uMoon; uniform float uGlintAmt; varying vec3 vW;
      #include <fog_pars_fragment>
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), u.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), u.x), u.y); }
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1.0 - clamp(V.y, 0.0, 1.0), 4.0);
        vec2 p = vW.xz;
        float n = n2(p * 0.18 + vec2(uTime * 0.06, -uTime * 0.04)) * 0.6 + n2(p * 0.55 + vec2(-uTime * 0.11, uTime * 0.07)) * 0.4;
        vec3 col = mix(uDeep, uSky, clamp(fres * 0.9 + (n - 0.5) * 0.08, 0.0, 1.0));
        vec2 dir = normalize(p - cameraPosition.xz + 0.0001);
        float al = max(dot(dir, uMoon), 0.0);
        col += uGlintAmt * uGlint * pow(al, 24.0) * smoothstep(0.62, 0.95, n) * (1.0 - fres * 0.5);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  })
);
water.rotation.x = -Math.PI / 2; scene.add(water);

// ---------------------------------------------------------------- glowing points (lanterns, fireflies, boat lights) in one draw call per cluster
function glowMaterial(alpha = 1) {
  const m = new THREE.ShaderMaterial({
    fog: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uAlpha: { value: alpha } }]),
    vertexShader: `attribute float size; attribute vec3 gcol; attribute float tw; varying vec3 vC; uniform float uScale; uniform float uTime; uniform float uBoost;
      #include <fog_pars_vertex>
      void main(){ vC = gcol; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float ph = position.x * 0.37 + position.z * 0.71;
        float s = size * uBoost * (1.0 - tw * 0.45 + tw * 0.45 * sin(uTime * (1.7 + fract(ph) * 2.0) + ph * 6.0));
        gl_PointSize = clamp(s * uScale / -mvPosition.z, 1.5, 320.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `varying vec3 vC; uniform float uAlpha;
      #include <fog_pars_fragment>
      void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(1.0 - d, 0.0), 2.4) * uAlpha;
        vec3 c = vC * a;
        #ifdef USE_FOG
          #ifdef FOG_EXP2
            c *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
          #else
            c *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
          #endif
        #endif
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  m.uniforms.uTime = SH.uTime; m.uniforms.uScale = SH.uScale; m.uniforms.uBoost = SH.uBoost;
  return m;
}
const GLOW_MAT = glowMaterial();
const SPHERE = new THREE.SphereGeometry(1, LOW ? 8 : 12, LOW ? 6 : 8);
const FIELDS = [];
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s3 = new THREE.Vector3(), _v3 = new THREE.Vector3();
// item: { x, y, z, c, s, halo?, tw?, bob?, bs?, wx?, drift?, lat?, a0?, a1?, aS? }
function field(k, items, { bodies = true, reflect = true, halo = 9, mat = GLOW_MAT, extra = false } = {}) {
  const n = items.length; if (!n) return null;
  const parent = k < 0 ? scene : G[k];
  let mesh = null;
  if (bodies) {
    mesh = new THREE.InstancedMesh(SPHERE, new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
    mesh.frustumCulled = false; parent.add(mesh);
  }
  let refl = 0; if (reflect) for (const it of items) if (it.y < 7) refl++;
  const tot = n + refl;
  const pos = new Float32Array(tot * 3), gcol = new Float32Array(tot * 3), size = new Float32Array(tot), tw = new Float32Array(tot);
  const c = new THREE.Color();
  let r = n;
  items.forEach((it, j) => {
    c.set(it.c);
    if (mesh) mesh.setColorAt(j, c.clone().multiplyScalar(it.bright ?? 2.4));
    gcol[j * 3] = c.r; gcol[j * 3 + 1] = c.g; gcol[j * 3 + 2] = c.b;
    size[j] = it.s * (it.halo ?? halo); tw[j] = it.tw ?? 0.25;
    it.ph = it.ph ?? ((j * 1.37) % 6.28); it.y0 = it.y;
    if (reflect && it.y < 7) { it.ri = r; gcol[r * 3] = c.r * 0.35; gcol[r * 3 + 1] = c.g * 0.35; gcol[r * 3 + 2] = c.b * 0.35; size[r] = size[j] * 0.8; tw[r] = tw[j]; r++; }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('gcol', new THREE.BufferAttribute(gcol, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('tw', new THREE.BufferAttribute(tw, 1));
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; parent.add(pts);
  const f = { k, items, mesh, geo, pts, dyn: items.some((it) => it.bob || it.drift || it.wx) };
  if (extra) { EXTRAS.push(pts); if (mesh) EXTRAS.push(mesh); }
  fieldUpdate(f, 0); FIELDS.push(f); return f;
}
function fieldUpdate(f, t) {
  const P = f.geo.attributes.position.array;
  for (let j = 0; j < f.items.length; j++) {
    const it = f.items[j];
    let x = it.x, y = it.y0, z = it.z;
    if (it.drift) {
      const span = it.a1 - it.a0, a = it.a0 + ((((it.aS - it.a0) + it.drift * t) % span) + span) % span, i = Math.round(a / STEP);
      x = PX[i] - TZ[i] * it.lat; z = PZ[i] + TX[i] * it.lat;
    }
    if (it.bob) y += Math.sin(t * (it.bs ?? 0.9) + it.ph) * it.bob;
    if (it.wx) { x += Math.sin(t * 0.37 + it.ph) * it.wx; z += Math.cos(t * 0.29 + it.ph * 1.7) * it.wx; }
    P[j * 3] = x; P[j * 3 + 1] = y; P[j * 3 + 2] = z;
    if (it.ri !== undefined) { P[it.ri * 3] = x; P[it.ri * 3 + 1] = 0.06; P[it.ri * 3 + 2] = z; }
    if (f.mesh) { _s3.set(it.s, it.s * 1.15, it.s); _m4.compose(_v3.set(x, y, z), _q.identity(), _s3); f.mesh.setMatrixAt(j, _m4); }
  }
  f.geo.attributes.position.needsUpdate = true;
  if (f.mesh) f.mesh.instanceMatrix.needsUpdate = true;
}
function fireflies(k, l0, l1, al0, al1, n, yLo, yHi) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const q = at(k, R(l0, l1), R(al0, al1)), g = Math.max(gy(q.x, q.z), 0);
    items.push({ x: q.x, y: g + R(yLo, yHi), z: q.z, c: 0xd8ff8a, s: 0.16, halo: 8, tw: 1, bob: R(0.3, 0.8), bs: R(0.4, 1.1), wx: R(0.6, 1.6), ph: R(0, 6.28) });
  }
  return field(k, items, { bodies: false, reflect: false, extra: true });
}

// ---------------------------------------------------------------- models (base64 files, loaded three at a time in journey order)
const loader = new GLTFLoader();
const TEMPL = {}, QUEUE = [];
let active = 0, modelsDone = 0;
const modelsTotal = AVAILABLE.size;
function pump() {
  while (active < 3 && QUEUE.length) {
    const job = QUEUE.shift(); active++;
    fetch(`models/${TIER}/${job.slug}.txt`)
      .then((r) => { if (!r.ok) throw new Error(job.slug + ' ' + r.status); return r.text(); })
      .then((txt) => { const s = atob(txt.trim()), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return loader.parseAsync(u.buffer, ''); })
      .then((g) => { g.scene.traverse((m) => { if (m.isMesh) m.material.envMapIntensity = 0.6; }); job.resolve(g.scene); })
      .catch((e) => { console.warn(e); job.resolve(null); })
      .finally(() => { active--; modelsDone++; updateLoading(); pump(); });
  }
}
function loadModel(slug) {
  if (!TEMPL[slug]) TEMPL[slug] = new Promise((resolve) => { QUEUE.push({ slug, resolve }); pump(); });
  return TEMPL[slug];
}
const MODEL_JOBS = [], ANIM = [], EXTRAS = [];
function place(k, slug, s, p, y, rotOff = 0, opts = {}) {
  if (!AVAILABLE.has(slug)) return Promise.resolve(null);
  const job = loadModel(slug).then((tpl) => {
    if (!tpl) return null;
    const o = tpl.clone(true);
    o.scale.setScalar(s); o.position.set(p.x, y, p.z); o.rotation.y = p.rot + rotOff;
    G[k].add(o);
    if (opts.extra) EXTRAS.push(o);
    const ph = hash(p.x, p.z) * 6.28;
    if (opts.bob) ANIM.push({ k, fn: (t) => { o.position.y = y + Math.sin(t * 0.9 + ph) * opts.bob; o.rotation.z = Math.sin(t * 0.7 + ph) * 0.03; o.rotation.x = Math.sin(t * 0.55 + ph * 1.3) * 0.018; } });
    if (opts.spin) ANIM.push({ k, fn: (t) => { o.rotation.y = p.rot + rotOff + t * opts.spin; } });
    if (opts.swing) ANIM.push({ k, fn: (t) => { o.rotation.x = Math.sin(t * 1.3 + ph) * opts.swing; } });
    if (opts.then) opts.then(o);
    precompile(k);
    return o;
  });
  MODEL_JOBS.push(job);
  return job;
}
function pedestal(k, x, z, r, h, color, minTop = 0.6) {
  const g0 = Math.max(gy(x, z), -2.5), top = Math.max(g0 + h, minTop), height = top - (g0 - 3);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.25, height, LOW ? 14 : 20), M({ color, roughness: 1, flatShading: true }));
  m.position.set(x, top - height / 2, z); G[k].add(m);
  return top;
}

// ---------------------------------------------------------------- shared textures
function windowTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#0c1416'; g.fillRect(0, 0, 64, 128);
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 8; xx++) if (rand() > 0.45) { g.fillStyle = rand() > 0.2 ? '#ffd9a0' : '#9fd0ff'; g.fillRect(xx * 8 + 2, yy * 8 + 2, 4, 4); }
  g.fillStyle = '#0c1416'; g.fillRect(0, 120, 8, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const WINDOW_MAT = M({ color: 0x0e1719, emissive: 0xffffff, emissiveMap: windowTexture(), emissiveIntensity: 0.85, roughness: 0.6 });
function scaleUV(g, w, h, d) {
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) {
    const hs = f < 2 ? d : w, vs = f === 2 || f === 3 ? 0 : h;
    for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setXY(j, (uv.getX(j) * hs) / 6, (uv.getY(j) * vs) / 12); }
  }
  return g;
}
function flagTexture() {
  const c = document.createElement('canvas'); c.width = 192; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#da251d'; g.fillRect(0, 0, 192, 128);
  g.fillStyle = '#ffde00'; g.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 17 : 42, an = -Math.PI / 2 + (i * Math.PI) / 5; g.lineTo(96 + Math.cos(an) * r, 64 + Math.sin(an) * r); }
  g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function nonLaTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#e9dcb8'; g.fillRect(0, 0, 64, 256);
  for (let y = 8; y < 256; y += 16) { g.fillStyle = 'rgba(150,125,80,0.55)'; g.fillRect(0, y, 64, 2); }
  for (let x = 0; x < 64; x += 4) { g.fillStyle = `rgba(120,100,60,${0.05 + rand() * 0.08})`; g.fillRect(x, 0, 1, 256); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- stops
const G = STOP_NAMES.map(() => { const g = new THREE.Group(); scene.add(g); return g; });
const GCENTER = STOP_NAMES.map((_, k) => { const p = at(k, 0, k === 4 ? 50 : 15); return new THREE.Vector2(p.x, p.z); });
const HERO = [], HERO_ALONG = [], WARM = [];
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

function terraces(k, x, z, g0, rot, n, r0, dr, h) {
  const A = [], B = [], W = [];
  for (let i = 0; i < n; i++) {
    const r = r0 - i * dr, extra = i === 0 ? 6 : 0;
    (i % 2 ? A : B).push([new THREE.CylinderGeometry(r, r + 0.6, h + extra, LOW ? 24 : 40, 1).scale(1, 1, 0.7), MY(x, g0 + i * h + 0.2 - extra / 2, z, rot)]);
    W.push([new THREE.TorusGeometry(r - 0.45, 0.1, 3, LOW ? 24 : 48).rotateX(Math.PI / 2).scale(1, 1, 0.7), MY(x, g0 + i * h + 0.2 + h / 2, z, rot)]);
  }
  G[k].add(new THREE.Mesh(bake(A), M({ color: 0x3d5a2c, flatShading: true })));
  G[k].add(new THREE.Mesh(bake(B), M({ color: 0x35502a, flatShading: true })));
  G[k].add(new THREE.Mesh(bake(W), M({ color: 0x4d6c68, roughness: 0.35 })));
  return g0 + (n - 1) * h + 0.2 + h / 2;
}
const FLAG_MAT = new THREE.ShaderMaterial({
  fog: true, side: THREE.DoubleSide,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: null } }]),
  vertexShader: `uniform float uTime; varying vec2 vUv; varying float vS;
    #include <fog_pars_vertex>
    void main(){ vUv = uv; vec3 p = position; float w = uv.x;
      p.z += sin(uv.x * 6.0 - uTime * 4.0) * 0.32 * w + sin(uv.x * 11.0 - uTime * 6.5 + uv.y * 2.0) * 0.08 * w;
      p.y -= w * w * 0.2; vS = cos(uv.x * 6.0 - uTime * 4.0);
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vS;
    #include <fog_pars_fragment>
    void main(){ vec3 c = texture2D(map, vUv).rgb * (0.78 + 0.22 * vS) * 1.25; gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
FLAG_MAT.uniforms.map.value = flagTexture(); FLAG_MAT.uniforms.uTime = SH.uTime;
function addFlag(k, o, rot) {
  const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3());
  const geo = new THREE.PlaneGeometry(4.2, 2.8, 20, 8).translate(2.1, -1.4, 0);
  const flag = new THREE.Mesh(geo, FLAG_MAT);
  flag.position.set(c.x, box.max.y - 0.2, c.z); flag.rotation.y = rot; G[k].add(flag);
}

// 01 Lũng Cú: flag tower on a terraced hill, terraces on the far bank, village lights on the slopes
{
  const k = 0, p = at(k, -34, 6), g0 = gy(p.x, p.z);
  const top = terraces(k, p.x, p.z, g0, p.rot, 9, 26, 2.6, 1.6);
  HERO[k] = v3(p.x, top + 5, p.z); HERO_ALONG[k] = 6; { const w = at(k, -14, -8); WARM[k] = v3(w.x, g0 + 6, w.z); }
  place(k, 'cot-co-lung-cu', 13, p, top, 0.4, { then: (o) => addFlag(k, o, p.rot) });
  const q = at(k, 52, -30); terraces(k, q.x, q.z, gy(q.x, q.z), q.rot, 7, 22, 2.8, 1.5);
  const vl = [];
  for (let i = 0; i < nq(16, 8); i++) { const s = at(k, R(40, 95) * (i % 2 ? 1 : -1), R(-70, 40)), y = gy(s.x, s.z); if (y > 2) vl.push({ x: s.x, y: y + 1.2, z: s.z, c: 0xffb35c, s: 0.25, tw: 0.3 }); }
  field(k, vl, { reflect: false });
}
// 02 Hà Nội: mausoleum on Ba Đình square, Hoàn Kiếm lake with Turtle Tower, Thê Húc bridge to Ngọc Sơn
{
  const k = 1, p = at(k, 38, 4), y = pedestal(k, p.x, p.z, 18, 1.2, 0x1b2c26);
  HERO[k] = v3(p.x, y + 6, p.z); HERO_ALONG[k] = 4;
  place(k, 'lang-bac', 20, p, y, -0.35);
  const lamps = [];
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const q = at(k, 21 + i * 2.6, 4 + s * 13); lamps.push({ x: q.x, y: gy(q.x, q.z) + 3.4, z: q.z, c: 0xffd59a, s: 0.2, tw: 0.1 }); }
  const t = at(k, -7, -12), ty = pedestal(k, t.x, t.z, 4.2, 1.2, 0x223428);
  place(k, 'thap-rua', 6.5, t, ty, 0.6);
  // Ngọc Sơn islet with a small temple
  const ns = at(k, -11, -42), nsy = pedestal(k, ns.x, ns.z, 4.6, 1.0, 0x223428);
  G[k].add(new THREE.Mesh(bake([[new THREE.BoxGeometry(4.2, 2.4, 3.4), MY(ns.x, nsy + 1.2, ns.z, ns.rot)]]), M({ color: 0x7a3f2a })));
  G[k].add(new THREE.Mesh(bake([
    [new THREE.ConeGeometry(3.7, 1.7, 4).rotateY(Math.PI / 4).scale(1.25, 1, 1), MY(ns.x, nsy + 3.2, ns.z, ns.rot)],
    [new THREE.ConeGeometry(2.4, 1.2, 4).rotateY(Math.PI / 4).scale(1.25, 1, 1), MY(ns.x, nsy + 4.2, ns.z, ns.rot)],
  ]), M({ color: 0x2b2422, flatShading: true })));
  // Thê Húc: red arched bridge from the bank to the islet
  {
    const b = at(k, -30, -47), S = v3(b.x, Math.max(gy(b.x, b.z), 0.3) + 0.3, b.z);
    const dir = v3(b.x - ns.x, 0, b.z - ns.z).normalize(), E = v3(ns.x + dir.x * 4.3, nsy + 0.3, ns.z + dir.z * 4.3);
    const Mid = S.clone().add(E).multiplyScalar(0.5); Mid.y += 2.6;
    const side = v3(-dir.z, 0, dir.x).multiplyScalar(0.75);
    const crv = (o, dy) => new THREE.QuadraticBezierCurve3(S.clone().add(o).setY(S.y + dy), Mid.clone().add(o).setY(Mid.y + dy), E.clone().add(o).setY(E.y + dy));
    const parts = [[new THREE.TubeGeometry(crv(v3(0, 0, 0), 0), 24, 0.42, 5), null]];
    for (const sgn of [-1, 1]) parts.push([new THREE.TubeGeometry(crv(side.clone().multiplyScalar(sgn), 0.8), 24, 0.07, 4), null]);
    for (let i = 1; i < 10; i++) { const tt = i / 10; for (const sgn of [-1, 1]) { const pt = crv(side.clone().multiplyScalar(sgn), 0).getPoint(tt); parts.push([new THREE.BoxGeometry(0.08, 0.8, 0.08), MY(pt.x, pt.y + 0.4, pt.z)]); } }
    G[k].add(new THREE.Mesh(bake(parts), M({ color: 0xb52a22, emissive: 0x8a1a12, emissiveIntensity: 1 })));
  }
  const lake = [];
  for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, q = at(k, s * 21, -64 + i * 7.5); lake.push({ x: q.x, y: Math.max(gy(q.x, q.z), 0.3) + 2.6, z: q.z, c: 0xffc46b, s: 0.24, tw: 0.15 }); }
  lake.push({ x: ns.x, y: nsy + 2.2, z: ns.z, c: 0xff5a2e, s: 0.35, tw: 0.3 });
  field(k, lamps.concat(lake), { reflect: true });
  // lakeside trees
  const tg = new THREE.IcosahedronGeometry(1, 1), n = nq(18, 9), trees = new THREE.InstancedMesh(tg, M({ color: 0x173222, flatShading: true }), n);
  for (let i = 0; i < n; i++) { const q = at(k, -R(23, 40), R(-75, 25)), r = R(2, 3.4), g = Math.max(gy(q.x, q.z), 0); trees.setMatrixAt(i, _m4.compose(v3(q.x, g + r * 0.9, q.z), _q.identity(), v3(r, r * 1.2, r))); }
  G[k].add(trees);
  WARM[k] = v3(ns.x, nsy + 3, ns.z);
  if (!LOW) { const d = at(k, 6, 58); place(k, 'thuyen-thung', 3, d, -0.15, 0.4, { bob: 0.06, spin: 0.05, extra: true }); }
}
// 03 Hạ Long: limestone karsts rising from the bay, three junk boats
{
  const k = 2;
  const bases = [0, 1, 2, 3].map(() => {
    const g = new THREE.IcosahedronGeometry(1, LOW ? 2 : 3), p = g.attributes.position, sd = rand() * 10;
    for (let i = 0; i < p.count; i++) {
      _v3.fromBufferAttribute(p, i); const n = 1 + (vnoise(_v3.x * 2 + sd, _v3.y * 2 + _v3.z * 2) - 0.5) * 0.5;
      _v3.multiplyScalar(n); if (_v3.y < 0) _v3.y *= 0.4; p.setXYZ(i, _v3.x, _v3.y, _v3.z);
    }
    g.computeVertexNormals(); return g;
  });
  const rockMat = M({ color: 0x34474a, roughness: 0.95, flatShading: true });
  bases.forEach((g) => {
    const want = nq(11, 6), mats = [];
    for (let t = 0; t < 60 && mats.length < want; t++) {
      const q = at(k, -R(20, 210), R(-110, 190));
      if (gy(q.x, q.z) > -1) continue;
      const r = R(6, 14), h = R(18, 46) * (1 + Math.abs(q.a - A_STOP[k]) / 400);
      mats.push(new THREE.Matrix4().compose(v3(q.x, h * 0.42, q.z), _q.setFromAxisAngle(v3(0, 1, 0), R(0, 6)).clone(), v3(r, h, r * R(0.8, 1.2))));
    }
    const im = new THREE.InstancedMesh(g, rockMat, mats.length); mats.forEach((m, i) => im.setMatrixAt(i, m)); G[k].add(im);
  });
  const boats = [[-11, -6, 14, 2.2], [-48, 40, 12, 1.4], [-86, -34, 11, 2.8]];
  const lights = [];
  boats.forEach(([l, al, s, r], i) => {
    const q = at(k, l, al); place(k, 'thuyen-buom', s, q, -0.4, r, { bob: 0.12 });
    lights.push({ x: q.x, y: 3.2, z: q.z, c: 0xffb347, s: 0.25, tw: 0.4 });
    if (i === 0) { HERO[k] = v3(q.x, 5, q.z); HERO_ALONG[k] = al; WARM[k] = v3(q.x, 4, q.z); }
  });
  field(k, lights, { reflect: true });
}
// 04 Huế: Phước Duyên tower of Thiên Mụ pagoda, Trường Tiền bridge with changing lights, conical hats floating as lanterns
{
  const k = 3, p = at(k, 32, -4), y = pedestal(k, p.x, p.z, 10, 4.2, 0x1d2e27);
  HERO[k] = v3(p.x, y + 9, p.z); HERO_ALONG[k] = -4;
  place(k, 'thap-phuoc-duyen', 22, p, y, -0.3);
  // Trường Tiền: six steel bowstring spans
  {
    const b = at(k, 2, 40), L = 52, spans = 6, sl = L / spans;
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rot; G[k].add(g);
    const deck = [[new THREE.BoxGeometry(L, 0.6, 4.4), MY(0, 2.6, 0)]];
    for (let s = 0; s <= spans; s++) deck.push([new THREE.CylinderGeometry(0.7, 0.9, 5.4, 8), MY(-L / 2 + s * sl, -0.2, 0)]);
    g.add(new THREE.Mesh(bake(deck), M({ color: 0x2b3638 })));
    const arch = [];
    for (let s = 0; s < spans; s++) for (const sd of [-2.1, 2.1]) {
      const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(v3(-L / 2 + (s + t) * sl, 2.9 + 3.9 * Math.sin(Math.PI * t), sd)); }
      arch.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.17, 4), null]);
      for (let i = 1; i < 6; i++) { const t = i / 6, h = 3.9 * Math.sin(Math.PI * t); arch.push([new THREE.BoxGeometry(0.09, h, 0.09), MY(-L / 2 + (s + t) * sl, 2.9 + h / 2, sd)]); }
    }
    const am = new THREE.MeshBasicMaterial({ color: 0x8fd0ff });
    g.add(new THREE.Mesh(bake(arch), am));
    ANIM.push({ k, fn: (t) => am.color.setHSL((0.55 + t * 0.025) % 1, 0.75, 0.6) });
  }
  // nón lá with a candle inside, drifting on the Perfume River
  {
    const n = nq(10, 6), geo = new THREE.ConeGeometry(0.95, 0.85, LOW ? 16 : 28, 1, true).rotateX(Math.PI);
    const im = new THREE.InstancedMesh(geo, M({ color: 0xe9dcb8, map: nonLaTexture(), side: THREE.DoubleSide, emissive: 0x2a1a08 }), n);
    im.frustumCulled = false; G[k].add(im);
    const hats = [], candles = [];
    for (let i = 0; i < n; i++) {
      const q = at(k, R(-8, 8), -36 + i * 6.2 + R(-2, 2)), ph = R(0, 6.28);
      hats.push({ x: q.x, z: q.z, ph, tilt: R(-0.25, 0.25), ry: R(0, 6) });
      candles.push({ x: q.x, y: 0.42, z: q.z, c: 0xffb35c, s: 0.12, halo: 10, tw: 0.6, bob: 0.05, ph });
    }
    field(k, candles, { bodies: false, reflect: true });
    const e = new THREE.Euler();
    ANIM.push({ k, fn: (t) => { hats.forEach((h, i) => { e.set(h.tilt, h.ry + t * 0.05, 0); im.setMatrixAt(i, _m4.compose(_v3.set(h.x, 0.3 + Math.sin(t * 0.9 + h.ph) * 0.05, h.z), _q.setFromEuler(e), _s3.set(1, 1, 1))); }); im.instanceMatrix.needsUpdate = true; } });
  }
  const q = at(k, 22, -4); field(k, [{ x: q.x, y: Math.max(gy(q.x, q.z), 0) + 2.4, z: q.z, c: 0xffc46b, s: 0.35, tw: 0.3 }]);
  WARM[k] = v3(q.x, 3, q.z);
  if (!LOW) { const d = at(k, -5, 64); place(k, 'ghe-cho-noi', 8, d, -0.2, Math.PI / 2 + 0.2, { bob: 0.08, extra: true }); }
}
// 05 Đà Nẵng, Hội An: Golden Bridge on the hills, Dragon Bridge overhead, then the lantern quarter of Hội An
{
  const k = 4, p = at(k, 46, 6), y0 = gy(p.x, p.z);
  HERO[k] = v3(p.x, y0 + 10, p.z); HERO_ALONG[k] = 6;
  place(k, 'cau-vang', 34, p, y0 + 1.5, -0.5);
  // Cầu Rồng: the camera passes under the deck
  {
    const b = at(k, 0, 36), L = 64, g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rot; G[k].add(g);
    const deck = [[new THREE.BoxGeometry(L, 0.9, 6), MY(0, 14, 0)]];
    for (let i = 0; i < 5; i++) deck.push([new THREE.CylinderGeometry(1, 1.2, 16.6, 10), MY(-L / 2 + 6 + i * ((L - 12) / 4), 5.3, 2.2)], [new THREE.CylinderGeometry(1, 1.2, 16.6, 10), MY(-L / 2 + 6 + i * ((L - 12) / 4), 5.3, -2.2)]);
    g.add(new THREE.Mesh(bake(deck), M({ color: 0x2a3634, roughness: 0.8 })));
    const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(v3(-L / 2 - 2 + t * (L + 4), 17 + 2.6 * Math.sin(t * Math.PI * 4.5 + 0.4), 0)); }
    const dm = M({ color: 0xd9a23a, emissive: 0x9a5a10, emissiveIntensity: 1.1, metalness: 0.4, roughness: 0.4 });
    const head = new THREE.ConeGeometry(1.3, 3.4, 6).rotateZ(-Math.PI / 2);
    const last = pts[pts.length - 1];
    g.add(new THREE.Mesh(bake([[new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), LOW ? 120 : 200, 0.62, LOW ? 6 : 8), null], [head, MY(last.x + 1.6, last.y + 0.4, 0)]]), dm));
    ANIM.push({ k, fn: (t) => { dm.emissiveIntensity = 0.9 + 0.35 * Math.sin(t * 1.3); } });
    const rail = []; for (let i = 0; i <= 16; i++) for (const sd of [-1, 1]) { const q = at(k, -L / 2 + (i * L) / 16, 36); rail.push({ x: q.x + TX[q.i] * sd * 3, y: 14.8, z: q.z + TZ[q.i] * sd * 3, c: 0xfff1d6, s: 0.12, tw: 0.1 }); }
    field(k, rail, { reflect: false });
  }
  // Hội An: yellow shophouses, lantern strings along the bank, floating flower lanterns
  {
    const walls = [], roofs = [], lan = [];
    for (let i = 0; i < nq(11, 7); i++) {
      const al = 64 + i * 7.4, q = at(k, 28 + R(-1, 1), al), yy = gy(q.x, q.z), w = R(5.2, 6.6), h = R(3.6, 5.2), d = 6;
      walls.push([new THREE.BoxGeometry(d, h, w), MY(q.x, yy + h / 2, q.z, q.rot)]);
      roofs.push([new THREE.BoxGeometry(d * 0.75, d * 0.75, w + 0.7).rotateZ(Math.PI / 4).scale(1, 0.62, 1), MY(q.x, yy + h, q.z, q.rot)]);
      const f = at(k, 28 - d / 2 - 0.6, al); lan.push({ x: f.x, y: yy + 3, z: f.z, c: i % 2 ? 0xff5a2e : 0xffb347, s: 0.3, tw: 0.2 });
    }
    G[k].add(new THREE.Mesh(bake(walls), M({ color: 0xc9a24a, emissive: 0x2a1a04 })));
    G[k].add(new THREE.Mesh(bake(roofs), M({ color: 0x3a2420, flatShading: true })));
    const pal = [0xff5a2e, 0xffb347, 0xff7aa8, 0xd9452b, 0x9c7bff];
    for (let i = 0; i < nq(34, 18); i++) { const al = 60 + i * (84 / nq(34, 18)), q = at(k, 21.5, al), sag = Math.sin(((al - 60) / 12) * Math.PI); lan.push({ x: q.x, y: gy(q.x, q.z) + 3.9 - Math.abs(sag) * 0.5, z: q.z, c: pal[i % pal.length], s: 0.26, tw: 0.2, bob: 0.04 }); }
    field(k, lan, { reflect: true });
    const hd = [];
    for (let i = 0; i < nq(46, 20); i++) hd.push({ lat: R(-9, 9), a0: A_STOP[k] + 40, a1: A_STOP[k] + 165, aS: A_STOP[k] + R(40, 165), drift: R(0.5, 1.1), x: 0, y: 0.3, z: 0, c: pal[i % 3], s: 0.2, tw: 0.35, bob: 0.05 });
    field(k, hd, { reflect: true });
    place(k, 'chua-cau', 12, at(k, 23, 102), 1.5, Math.PI / 2);
    [[-7, 58, 3.2], [8, 82, 3], [-9, 106, 2.8], [5, 130, 3]].forEach(([l, al, s]) => place(k, 'thuyen-thung', s, at(k, l, al), -0.15, R(0, 6), { bob: 0.06, spin: R(-0.06, 0.06) }));
    WARM[k] = (() => { const w = at(k, 24, 96); return v3(w.x, 4, w.z); })();
  }
}
// 06 Tây Nguyên: rông house, gongs around a fire, coffee rows on the far hills, fireflies
{
  const k = 5, p = at(k, -34, 2), y = gy(p.x, p.z);
  HERO[k] = v3(p.x, y + 8, p.z); HERO_ALONG[k] = 2;
  place(k, 'nha-rong', 17, p, y, 0.5);
  [[-20, -9], [-17.5, -4.5], [-15, 0]].forEach(([l, al]) => { const q = at(k, l, al); place(k, 'cong-chieng', 3.2, q, Math.max(gy(q.x, q.z), 0) + 0.1, 0.3, { swing: 0.05 }); });
  const f = at(k, -25, 9), fy = Math.max(gy(f.x, f.z), 0);
  const logs = []; for (let i = 0; i < 4; i++) logs.push([new THREE.CylinderGeometry(0.18, 0.2, 2.4, 6).rotateZ(Math.PI / 2 - 0.35), MY(f.x, fy + 0.35, f.z, (i * Math.PI) / 4)]);
  G[k].add(new THREE.Mesh(bake(logs), M({ color: 0x3a2a1a })));
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a2a).multiplyScalar(2.2) }));
  const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd27a).multiplyScalar(2.4) }));
  flame.position.set(f.x, fy + 1.2, f.z); flame2.position.set(f.x, fy + 1.0, f.z); G[k].add(flame, flame2);
  ANIM.push({ k, fn: (t) => { flame.scale.set(1, 0.8 + 0.25 * Math.sin(t * 9) + 0.1 * Math.sin(t * 23), 1); flame2.scale.set(1, 0.85 + 0.3 * Math.sin(t * 13 + 1), 1); } });
  field(k, [{ x: f.x, y: fy + 1.4, z: f.z, c: 0xff8a3a, s: 0.9, tw: 0.9 }], { bodies: false, reflect: false });
  WARM[k] = v3(f.x, fy + 3, f.z);
  // coffee rows on the right-bank hills
  const bush = new THREE.IcosahedronGeometry(1, 0), mats = [];
  for (let lat = 26; lat < 92; lat += 5) for (let al = -48; al < 48; al += 3.2) {
    if (rand() < (LOW ? 0.55 : 0.2)) continue;
    const q = at(k, lat + R(-0.6, 0.6), al), g = gy(q.x, q.z); if (g < 1) continue;
    const s = R(0.85, 1.2); mats.push(new THREE.Matrix4().compose(v3(q.x, g + 0.6, q.z), _q.identity(), v3(1.1 * s, 0.8 * s, 1.1 * s)));
  }
  const cof = new THREE.InstancedMesh(bush, M({ color: 0x1d3a1e, flatShading: true }), mats.length); mats.forEach((m, i) => cof.setMatrixAt(i, m));
  G[k].add(cof); EXTRAS.push(cof);
  fireflies(k, -52, -10, -26, 30, nq(140, 60), 1, 9);
}
// 07 Nha Trang: Po Nagar towers on the hillside, islands and squid-fishing boat lights on the sea
{
  const k = 6, p = at(k, 40, 4), y = gy(p.x, p.z) - 2.5;
  HERO[k] = v3(p.x, y + 13, p.z); HERO_ALONG[k] = 4;
  place(k, 'thap-ba-ponagar', 34, p, y, -0.7);
  const ig = new THREE.IcosahedronGeometry(1, 1), mats = [];
  for (let t = 0; t < 40 && mats.length < nq(8, 5); t++) {
    const q = at(k, -R(80, 240), R(-60, 220)); if (gy(q.x, q.z) > -3) continue;
    const r = R(22, 46); mats.push(new THREE.Matrix4().compose(v3(q.x, -2, q.z), _q.identity(), v3(r, R(10, 28), r * 0.8)));
  }
  const isl = new THREE.InstancedMesh(ig, M({ color: 0x1c2f26, flatShading: true }), mats.length); mats.forEach((m, i) => isl.setMatrixAt(i, m)); G[k].add(isl);
  const sq = [];
  for (let i = 0; i < nq(44, 22); i++) { const q = at(k, -R(150, 520), R(-150, 420)); sq.push({ x: q.x, y: 0.9, z: q.z, c: 0xe6fbff, s: 0.35, halo: 10, tw: 0.5 }); }
  field(k, sq, { bodies: false, reflect: true, extra: true });
  const prom = []; for (let al = -70; al <= 70; al += 9) { const q = at(k, 17, al); prom.push({ x: q.x, y: Math.max(gy(q.x, q.z), 0) + 3, z: q.z, c: 0xffd59a, s: 0.18, tw: 0.1 }); }
  field(k, prom, { reflect: true });
  WARM[k] = (() => { const w = at(k, 28, 4); return v3(w.x, gy(w.x, w.z) + 3, w.z); })();
  if (!LOW) { const d = at(k, 5, 56); place(k, 'thuyen-thung', 3, d, -0.15, 1.2, { bob: 0.06, spin: 0.04, extra: true }); }
}
// 08 Phan Thiết: water tower, Mũi Né dunes, a fleet of basket boats in the bay
{
  const k = 7, p = at(k, -32, 2), y = pedestal(k, p.x, p.z, 7, 3, 0x2a3328);
  HERO[k] = v3(p.x, y + 7, p.z); HERO_ALONG[k] = 2; WARM[k] = v3(p.x, y + 1.5, p.z);
  place(k, 'thap-nuoc-phan-thiet', 18, p, y, 0.2);
  const d = at(k, 135, -10), sx = nq(90, 45), sz = nq(60, 30);
  const dg = new THREE.PlaneGeometry(220, 160, sx, sz), dp = dg.attributes.position;
  for (let i = 0; i < dp.count; i++) { const x = dp.getX(i), yy = dp.getY(i); const fx = smooth(110, 70, Math.abs(x)) * smooth(80, 50, Math.abs(yy)); dp.setZ(i, -3 + fx * (3 + Math.max(0, Math.sin(x * 0.05 + vnoise(x * 0.03, yy * 0.03) * 3) * 6 + vnoise(x * 0.02, yy * 0.02) * 10))); }
  dg.rotateX(-Math.PI / 2); dg.computeVertexNormals();
  const dunes = new THREE.Mesh(dg, M({ color: 0xc49a6a, roughness: 1 })); dunes.position.set(d.x, 1, d.z); dunes.rotation.y = d.rot; G[k].add(dunes);
  for (let i = 0; i < nq(6, 3); i++) place(k, 'thuyen-thung', 2.4, at(k, -R(56, 82), R(-30, 40)), -0.15, R(0, 6), { bob: 0.07 });
  field(k, [{ x: p.x, y: y + 0.8, z: p.z, c: 0xffc46b, s: 0.3, tw: 0.2 }], { reflect: false });
}
// 09 Sài Gòn: Bến Thành market, skyline with Landmark 81 and Bitexco, riverside lights
{
  const k = 8, p = at(k, 38, 2), y = pedestal(k, p.x, p.z, 16, 1.4, 0x202a28);
  HERO[k] = v3(p.x, y + 7, p.z); HERO_ALONG[k] = 2;
  place(k, 'cho-ben-thanh', 22, p, y, -0.4);
  { const d1 = at(k, 62, 34), d2 = at(k, 46, 56); place(k, 'nha-tho-duc-ba', 20, d1, gy(d1.x, d1.z), -0.3); place(k, 'buu-dien-thanh-pho', 22, d2, gy(d2.x, d2.z), -0.3); }
  const parts = [], reserved = [[38, 2, 22], [62, 34, 12], [46, 56, 14], [98, 78, 10], [66, 54, 9]];
  for (let n = 0, t = 0; n < nq(34, 18) && t < 500; t++) {
    const west = rand() < 0.75, lat = west ? R(58, 160) : -R(26, 70), al = R(-30, 130);
    if (reserved.some(([l, a, r]) => Math.hypot(lat - l, al - a) < r + 8)) continue;
    const q = at(k, lat, al), g = gy(q.x, q.z); if (g < 0.5) continue;
    const w = R(6, 13), h = R(14, west ? 56 : 32), dd = R(6, 12);
    parts.push([scaleUV(new THREE.BoxGeometry(w, h, dd), w, h, dd), MY(q.x, g + h / 2, q.z, q.rot + R(-0.2, 0.2))]); n++;
  }
  const lm = at(k, 98, 78), lg = Math.max(gy(lm.x, lm.z), 0);
  for (const [ox, oz, h] of [[0, 0, 120], [5, 0, 104], [-5, 0, 98], [0, 5, 90], [0, -5, 84], [5, 5, 72], [-5, -5, 66], [5, -5, 58], [-5, 5, 50]]) parts.push([scaleUV(new THREE.BoxGeometry(5, h, 5), 5, h, 5), MY(lm.x + ox, lg + h / 2, lm.z + oz)]);
  const bx = at(k, 66, 54), bg = Math.max(gy(bx.x, bx.z), 0);
  parts.push([new THREE.CylinderGeometry(3.2, 7, 84, 20), MY(bx.x, bg + 42, bx.z)]);
  G[k].add(new THREE.Mesh(bake(parts), WINDOW_MAT));
  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 14, 6), new THREE.MeshBasicMaterial({ color: 0xffe6b8 })); spire.position.set(lm.x, lg + 127, lm.z); G[k].add(spire);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 1.2, 24), M({ color: 0x2a3436, emissive: 0x4a3418, emissiveIntensity: 0.6 })); pad.position.set(bx.x + 3.6, bg + 66, bx.z); G[k].add(pad);
  const lights = [];
  for (let al = -50; al <= 70; al += 8) for (const s of [-1, 1]) { const q = at(k, s * 15, al); lights.push({ x: q.x, y: Math.max(gy(q.x, q.z), 0) + 3.2, z: q.z, c: 0xffd59a, s: 0.18, tw: 0.1 }); }
  lights.push({ x: lm.x, y: lg + 135, z: lm.z, c: 0xff4040, s: 0.5, tw: 1 });
  field(k, lights, { reflect: true });
  WARM[k] = (() => { const w = at(k, 28, 2); return v3(w.x, 3, w.z); })();
  if (!LOW) { const d = at(k, -6, 60); place(k, 'ghe-cho-noi', 8, d, -0.2, Math.PI / 2 - 0.15, { bob: 0.08, extra: true }); }
}
// 10 Miền Tây: floating-market boats with lanterns, coconut palms, stilt houses, a monkey bridge over a side canal
{
  const k = 9;
  const boats = [[-7, -4, 11, 1.9], [9, -24, 9, Math.PI / 2 + 0.25], [-9, 20, 9, Math.PI / 2 - 0.2], [7, 38, 8.5, Math.PI / 2 + 0.1], [-6, -44, 8, Math.PI / 2 - 0.3]];
  const bl = [];
  boats.forEach(([l, al, s, r], i) => {
    const q = at(k, l, al); place(k, 'ghe-cho-noi', s, q, -0.2, r, { bob: 0.08 });
    bl.push({ x: q.x, y: 2.6, z: q.z, c: i % 2 ? 0xffb347 : 0xff5a2e, s: 0.28, tw: 0.3 });
    if (i === 0) { HERO[k] = v3(q.x, 3, q.z); HERO_ALONG[k] = al; WARM[k] = v3(q.x, 4, q.z); }
  });
  field(k, bl, { reflect: true });
  // palms (two instanced meshes for every tree)
  const trunkG = new THREE.CylinderGeometry(0.16, 0.28, 1, 5).translate(0, 0.5, 0);
  const crownParts = []; for (let i = 0; i < 7; i++) crownParts.push([new THREE.ConeGeometry(0.5, 4.5, 4).translate(0, 2.2, 0).rotateZ(Math.PI / 2 - 0.5).rotateY((i / 7) * Math.PI * 2), null]);
  const crownG = bake(crownParts), tm = [], cm = [];
  for (let t = 0; t < 400 && tm.length < nq(80, 34); t++) {
    const lat = (rand() < 0.5 ? -1 : 1) * R(17, 64), al = R(-80, 80);
    if (lat > 10 && Math.abs(al - 30) < 6) continue;
    const q = at(k, lat, al), g = gy(q.x, q.z); if (g < 0.4) continue;
    const h = R(7, 12), lean = R(-0.22, 0.22), ry = R(0, 6.28);
    const base = new THREE.Matrix4().compose(v3(q.x, g, q.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, lean, 'YXZ')), v3(1, 1, 1));
    tm.push(base.clone().multiply(new THREE.Matrix4().makeScale(1, h, 1)));
    cm.push(base.clone().multiply(new THREE.Matrix4().makeTranslation(0, h, 0)));
  }
  const tr = new THREE.InstancedMesh(trunkG, M({ color: 0x4a3a2a }), tm.length), cr = new THREE.InstancedMesh(crownG, M({ color: 0x1f3a22, flatShading: true }), cm.length);
  tm.forEach((m, i) => tr.setMatrixAt(i, m)); cm.forEach((m, i) => cr.setMatrixAt(i, m)); G[k].add(tr, cr);
  // stilt houses
  const body = [], roof = [], win = [];
  for (let i = 0; i < nq(7, 4); i++) {
    const s = i % 2 ? 1 : -1, al = -66 + i * 21, q = at(k, s * R(22, 28), al), g = Math.max(gy(q.x, q.z), -1);
    body.push([new THREE.BoxGeometry(4, 2.6, 5), MY(q.x, g + 2.4 + 1.3, q.z, q.rot)]);
    for (const [ox, oz] of [[-1.7, -2.2], [1.7, -2.2], [-1.7, 2.2], [1.7, 2.2]]) body.push([new THREE.CylinderGeometry(0.1, 0.1, 3.4, 5), MY(q.x, g + 1, q.z, q.rot).multiply(new THREE.Matrix4().makeTranslation(ox, 0, oz))]);
    roof.push([new THREE.BoxGeometry(3.6, 3.6, 5.8).rotateZ(Math.PI / 4).scale(1, 0.55, 1), MY(q.x, g + 5, q.z, q.rot)]);
    const f = at(k, s * (R(22, 28) - 2.2), al); win.push({ x: f.x, y: g + 3.6, z: f.z, c: 0xffc46b, s: 0.22, tw: 0.2 });
  }
  G[k].add(new THREE.Mesh(bake(body), M({ color: 0x5a4632 })), new THREE.Mesh(bake(roof), M({ color: 0x6b5a34, flatShading: true })));
  field(k, win, { reflect: true });
  // cầu khỉ: bamboo monkey bridge over the side canal
  {
    const b = at(k, 42, 30), g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rot; G[k].add(g);
    const parts = [[new THREE.CylinderGeometry(0.08, 0.08, 10, 5).rotateX(Math.PI / 2), MY(0, 2.2, 0)], [new THREE.CylinderGeometry(0.05, 0.05, 10, 5).rotateX(Math.PI / 2), MY(0.4, 3.2, 0)]];
    for (const z of [-4, 0, 4]) for (const sd of [-0.3, 0.3]) parts.push([new THREE.CylinderGeometry(0.06, 0.06, 5.4, 5).rotateZ(sd * 0.6), MY(sd, 0.9, z)]);
    g.add(new THREE.Mesh(bake(parts), M({ color: 0x8a7a4a })));
  }
  fireflies(k, -60, 60, -60, 60, nq(120, 50), 1, 7);
}
// 11 Mũi Cà Mau: ship monument at the cape, mangrove forest, a beacon out at sea
{
  const k = 10, p = at(k, 16, 12), y = pedestal(k, p.x, p.z, 9, 2.2, 0x26302c);
  HERO[k] = v3(p.x, y + 5, p.z); HERO_ALONG[k] = 12; WARM[k] = v3(p.x, y + 2, p.z);
  place(k, 'mui-ca-mau', 14, p, y, -1.2);
  const mg = new THREE.IcosahedronGeometry(1, 0), mats = [];
  for (let t = 0; t < 600 && mats.length < nq(120, 50); t++) {
    const q = at(k, (rand() < 0.5 ? -1 : 1) * R(16, 60), R(-80, 50)), g = gy(q.x, q.z); if (g < 0.1) continue;
    if (Math.hypot(q.x - p.x, q.z - p.z) < 12) continue;
    const s = R(1.5, 3.6); mats.push(new THREE.Matrix4().compose(v3(q.x, g + s * 0.5, q.z), _q.setFromAxisAngle(v3(0, 1, 0), R(0, 6)).clone(), v3(s, s * 0.7, s)));
  }
  const mangrove = new THREE.InstancedMesh(mg, M({ color: 0x14261b, flatShading: true }), mats.length); mats.forEach((m, i) => mangrove.setMatrixAt(i, m)); G[k].add(mangrove);
  const b = at(k, -40, 170);
  field(k, [{ x: b.x, y: 6, z: b.z, c: 0xffffff, s: 0.5, halo: 14, tw: 1 }, ...[0, 1, 2, 3].map(() => { const q = at(k, -R(60, 200), R(60, 260)); return { x: q.x, y: 0.8, z: q.z, c: 0xe6fbff, s: 0.3, tw: 0.5 }; })], { bodies: false, reflect: true });
}

// ---------------------------------------------------------------- overview: route ribbon, stop markers, glowing coastline, village lights
const OV = new THREE.Group(); scene.add(OV);
const ribbonMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uLit: { value: 0 }, uAlpha: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `varying vec2 vUv; uniform float uLit; uniform float uAlpha;
    void main(){ float lit = step(vUv.x, uLit); float head = exp(-pow((vUv.x - uLit) * 90.0, 2.0)) * step(0.001, uLit);
      vec3 c = mix(vec3(0.85, 0.62, 0.35) * 0.5, vec3(1.0, 0.78, 0.45) * 1.5, lit) + vec3(1.0, 0.6, 0.4) * head * 2.0;
      gl_FragColor = vec4(c * uAlpha, 1.0);
      #include <colorspace_fragment>
    }`,
});
{
  const rc = new THREE.CatmullRomCurve3(curve.getSpacedPoints(400).filter((p, i) => i * (LTOT / 400) <= A_STOP[10] + 60).map((p) => p.clone().setY(1.6)));
  OV.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 600, 2.2, 6), ribbonMat));
}
const markerMat = glowMaterial(1);
const markers = field(-1, STOP_NAMES.map((_, k) => { const p = at(k, 0, 0); return { x: p.x, y: 4, z: p.z, c: 0xffc77a, s: 1, halo: 26, tw: 0.4 }; }), { bodies: false, reflect: false, mat: markerMat });
const MAPB = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
const coastMat = new THREE.MeshBasicMaterial({ color: 0x7fbccc, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
{
  const west = [], east = [];
  const edge = (i, sg) => { let l = 0; while (l < 320 && landIn(i, sg * (l + 1.5)) > 0) l += 1.5; return l; };
  for (let i = 0; i <= N; i += 5) {
    const w = edge(i, 1), e = edge(i, -1);
    if (landIn(i, 0) <= 0 && w < 0.5 && e < 0.5) { if (west.length) break; continue; }
    west.push([PX[i] - TZ[i] * w, PZ[i] + TX[i] * w]); east.push([PX[i] + TZ[i] * e, PZ[i] - TX[i] * e]);
  }
  const loop = [...west, ...east.reverse()];
  for (const [x, z] of loop) { MAPB.x0 = Math.min(MAPB.x0, x); MAPB.x1 = Math.max(MAPB.x1, x); MAPB.z0 = Math.min(MAPB.z0, z); MAPB.z1 = Math.max(MAPB.z1, z); }
  const pos = [], idx = [], hw = 2.8;
  for (let i = 0; i < loop.length; i++) {
    const [x0, z0] = loop[(i - 1 + loop.length) % loop.length], [x1, z1] = loop[i], [x2, z2] = loop[(i + 1) % loop.length];
    let nx = -(z2 - z0), nz = x2 - x0; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    pos.push(x1 + nx * hw, 0.5, z1 + nz * hw, x1 - nx * hw, 0.5, z1 - nz * hw);
    const j = i * 2, jn = ((i + 1) % loop.length) * 2; idx.push(j, j + 1, jn, j + 1, jn + 1, jn);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const cm = new THREE.Mesh(g, coastMat); cm.material.side = THREE.DoubleSide; OV.add(cm);
}
{
  const items = [];
  for (let t = 0; t < 14000 && items.length < nq(1100, 520); t++) {
    const x = R(MAPB.x0, MAPB.x1), z = R(MAPB.z0, MAPB.z1), y = terrainHeight(x, z);
    if (y < 0.6 || TH_IN < 8 || Math.abs(TH_LAT) < si(CHAN, TH_A) + 5) continue;
    let near = 1e9; for (let k = 0; k < 11; k++) { const p = at(k, 0, 0); near = Math.min(near, Math.hypot(p.x - x, p.z - z)); }
    if (rand() > 0.22 + 0.78 * Math.exp(-((near / 110) ** 2))) continue;
    items.push({ x, y: y + 0.8, z, c: rand() < 0.85 ? 0xffb86b : 0xffe2b0, s: 0.22, tw: 0.35 });
  }
  field(-1, items, { bodies: false, reflect: false });
}

// ---------------------------------------------------------------- camera rig
const SIDE = [1, -1, 1, -1, -1, 1, -1, 1, -1, 1, -1]; // where each stop's panel sits: 1 right, -1 left
const CAMCFG = [
  { back: 50, h: 15, look: 0.5 }, { back: 52, h: 9, look: 0.55 }, { back: 34, h: 8, look: 0.4 }, { back: 50, h: 10.5, look: 0.5 },
  { back: 58, h: 9, look: 0.5 }, { back: 48, h: 12, look: 0.5 }, { back: 56, h: 10, look: 0.5 }, { back: 44, h: 9, look: 0.5 },
  { back: 54, h: 9.5, look: 0.5 }, { back: 30, h: 8, look: 0.4 }, { back: 40, h: 8.5, look: 0.5 },
];
const ADW = HERO_ALONG.map((al, k) => A_STOP[k] + al - CAMCFG[k].back);
const A_START = ADW[0], A_END = ADW[10] + 8;
const U_HOLD = 0.03, U_INTRO = 0.085, U_END = 0.93;
const NTB = 4000, TA = new Float64Array(NTB + 1), TU = new Float64Array(NTB + 1);
{
  let acc = 0;
  for (let j = 0; j <= NTB; j++) {
    const a = A_START + ((A_END - A_START) * j) / NTB; TA[j] = a;
    let near = 0; for (const ad of ADW) near = Math.max(near, Math.exp(-((a - ad) ** 2) / (22 * 22)));
    if (j) acc += (A_END - A_START) / NTB / (1 - 0.87 * near);
    TU[j] = acc;
  }
  for (let j = 0; j <= NTB; j++) TU[j] /= acc;
}
function arcAt(uj) {
  let lo = 0, hi = NTB; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TU[m] < uj) lo = m; else hi = m; }
  const t = (uj - TU[lo]) / Math.max(1e-9, TU[hi] - TU[lo]); return TA[lo] + (TA[hi] - TA[lo]) * clamp(t, 0, 1);
}
function ujAt(a) { const f = clamp(((a - A_START) / (A_END - A_START)) * NTB, 0, NTB), i = Math.floor(f), j = Math.min(NTB, i + 1); return TU[i] + (TU[j] - TU[i]) * (f - i); }
const uOfStop = (k) => U_INTRO + ujAt(ADW[k]) * (U_END - U_INTRO);

const _pp = new THREE.Vector3(), _la = new THREE.Vector3();
function stopNear(a) {
  let k = 0, bd = 1e9; for (let i = 0; i < 11; i++) { const d = a - ADW[i]; if (Math.abs(d) < Math.abs(bd)) { bd = d; k = i; } }
  const sl = bd < 0 ? 46 : 16;
  return { k, d: bd, wb: Math.exp(-(bd * bd) / 1600), wl: Math.exp(-(bd * bd) / (sl * sl)) };
}
function journeyPose(a, pos, look) {
  const s = stopNear(a), c = CAMCFG[s.k], h = lerp(10.5, c.h, s.wb);
  pathPoint(a, pos); const i = Math.round(clamp(a / STEP, 0, N));
  const off = SIDE[s.k] * -3 * s.wb; // drift toward the panel side so the landmark sits clear of it
  pos.x += -TZ[i] * off; pos.z += TX[i] * off; pos.y = h;
  pathPoint(a + 44, look); look.y = h * 0.5;
  look.lerp(HERO[s.k], s.wl * c.look);
  return s;
}
const toOrbit = (pos, T) => { const o = pos.clone().sub(T), d = o.length(); return { d, yaw: Math.atan2(o.x, o.z), pitch: Math.asin(o.y / d) }; };
function orbitPose(T, d, yaw, pitch, pos, look) { const cp = Math.cos(pitch); pos.set(T.x + d * cp * Math.sin(yaw), T.y + d * Math.sin(pitch), T.z + d * cp * Math.cos(yaw)); look.copy(T); }

const MAP_C = new THREE.Vector3((MAPB.x0 + MAPB.x1) / 2, 0, (MAPB.z0 + MAPB.z1) / 2);
const P0 = 1.36;
let OV_DIST = 2000;
const J0 = { pos: new THREE.Vector3(), look: new THREE.Vector3() }, JE = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
journeyPose(A_START, J0.pos, J0.look); journeyPose(A_END, JE.pos, JE.look);
const O1 = toOrbit(J0.pos, J0.look), OE = toOrbit(JE.pos, JE.look);
const _T = new THREE.Vector3();
const STATE = { phase: 'intro', a: A_START, s: stopNear(A_START), tI: 0, tE: 0, ujour: 0 };
function pose(u, time, pos, look) {
  if (u < U_INTRO) {
    const t = u < U_HOLD ? 0 : (u - U_HOLD) / (U_INTRO - U_HOLD);
    STATE.phase = 'intro'; STATE.tI = t; STATE.a = A_START; STATE.ujour = 0;
    const br = (1 - smooth(0, 0.3, t)) * 0.04 * Math.sin(time * 0.15);
    _T.copy(MAP_C).lerp(J0.look, easeIO(clamp(t * 1.5, 0, 1)));
    const d = Math.exp(lerp(Math.log(OV_DIST), Math.log(O1.d), easeIO(t)));
    let y1 = O1.yaw; if (y1 > Math.PI) y1 -= Math.PI * 2;
    const yaw = lerp(Math.PI + br, y1, smooth(0.12, 0.92, t)), pitch = lerp(P0, O1.pitch, smooth(0.3, 1, t));
    orbitPose(_T, d, yaw, pitch, pos, look);
    STATE.s = stopNear(A_START);
    return;
  }
  if (u > U_END) {
    const t = (u - U_END) / (1 - U_END);
    STATE.phase = 'end'; STATE.tE = t; STATE.a = A_END; STATE.ujour = 1;
    _T.copy(JE.look).lerp(MAP_C, easeIO(clamp((t - 0.1) * 1.4, 0, 1)));
    const d = Math.exp(lerp(Math.log(OE.d), Math.log(OV_DIST), easeIO(t)));
    let y0 = OE.yaw; if (y0 > Math.PI) y0 -= Math.PI * 2;
    const yaw = lerp(y0, Math.PI + 0.03 * Math.sin(time * 0.15) * smooth(0.8, 1, t), smooth(0.08, 0.9, t)), pitch = lerp(OE.pitch, P0, smooth(0, 0.75, t));
    orbitPose(_T, d, yaw, pitch, pos, look);
    STATE.s = stopNear(A_END);
    return;
  }
  const uj = (u - U_INTRO) / (U_END - U_INTRO), a = arcAt(uj);
  STATE.phase = 'journey'; STATE.a = a; STATE.ujour = uj;
  STATE.s = journeyPose(a, pos, look);
}

// ---------------------------------------------------------------- post
let composer = null, bloomPass = null, bloomOn = !LOW && !lightMode;
if (!LOW) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.7, 0.5, 0.82);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
}

// ---------------------------------------------------------------- UI
const PANELS = $$('.panel').map((el) => ({ el, k: el.dataset.k, o: -1 }));
const DOTS = $$('.rail .dot');
const railFill = $('.rail .fill'), railLabel = $('.rail .now');
const LABELS = STOP_NAMES.map((n, k) => { const el = document.createElement('span'); el.className = 'map-label'; el.textContent = n; $('#labels').appendChild(el); return { el, p: (() => { const q = at(k, 0, 0); return v3(q.x, 4, q.z); })() }; });
const isPhoneLayout = () => matchMedia('(max-width: 760px)').matches;
function setPanel(p, w) {
  w = Math.round(w * 50) / 50; if (w === p.o) return; p.o = w;
  p.el.style.opacity = w; p.el.style.transform = `translate3d(0, ${((1 - w) * 14).toFixed(1)}px, 0)`;
  p.el.style.visibility = w < 0.02 ? 'hidden' : 'visible'; p.el.classList.toggle('live', w > 0.6);
}
let railCur = -2;
function updateUI(u) {
  const st = STATE;
  for (const p of PANELS) {
    let w = 0;
    if (p.k === 'intro') w = 1 - smooth(U_HOLD * 0.4, U_HOLD + 0.012, u);
    else if (p.k === 'end') w = st.phase === 'end' ? smooth(0.55, 0.85, st.tE) : 0;
    else {
      const k = +p.k;
      if (st.phase === 'journey') { const d = st.a - ADW[k]; w = d < 0 ? 1 - smooth(14, 40, -d) : 1 - smooth(10, 30, d); }
      else if (st.phase === 'intro' && k === 0) w = smooth(0.72, 1, st.tI);
      else if (st.phase === 'end' && k === 10) w = 1 - smooth(0, 0.3, st.tE);
    }
    setPanel(p, w);
  }
  const cur = st.phase === 'intro' ? (st.tI > 0.7 ? 0 : -1) : st.phase === 'end' ? 11 : st.s.k;
  if (cur !== railCur) {
    railCur = cur;
    DOTS.forEach((d, i) => { d.classList.toggle('past', i < cur); d.classList.toggle('cur', i === cur); d.setAttribute('aria-current', i === cur ? 'step' : 'false'); });
    if (cur >= 0 && cur <= 10) { railLabel.textContent = `${String(cur + 1).padStart(2, '0')} ${STOP_NAMES[cur]}`; railLabel.style.left = `${(cur / 10) * 100}%`; railLabel.dataset.edge = cur === 0 ? 'start' : cur === 10 ? 'end' : ''; }
    else railLabel.textContent = '';
  }
  railFill.style.transform = `scaleX(${clamp((u - U_INTRO) / (U_END - U_INTRO), 0, 1).toFixed(4)})`;
}
function updateLabels(ov) {
  const show = ov > 0.05;
  for (const L of LABELS) {
    if (!show) { if (L.el.style.opacity !== '0') L.el.style.opacity = '0'; continue; }
    _v3.copy(L.p).project(camera);
    const x = (_v3.x * 0.5 + 0.5) * VW, y = (-_v3.y * 0.5 + 0.5) * VH;
    L.el.style.opacity = ov.toFixed(2); L.el.style.transform = `translate3d(${(x + 14).toFixed(1)}px, ${(y - 9).toFixed(1)}px, 0)`;
  }
}
const loadingEl = $('#loading');
function updateLoading() {
  if (!loadingEl) return;
  if (modelsDone >= modelsTotal) { loadingEl.hidden = true; return; }
  loadingEl.hidden = false; loadingEl.textContent = `Đang tải công trình ${modelsDone}/${modelsTotal}`;
}
updateLoading();

// scroll, autoplay, navigation
const track = $('#track');
let maxScroll = 1, targetU = 0, curU = 0, auto = false;
const AUTO_SECONDS = 150;
const measure = () => { maxScroll = Math.max(1, track.offsetHeight - window.innerHeight); };
const readU = () => clamp(window.scrollY / maxScroll, 0, 1);
const writeU = (u) => window.scrollTo(0, u * maxScroll);
const playBtn = $('#play');
function setAuto(on) {
  auto = on; playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  playBtn.querySelector('.lbl').textContent = on ? 'Tạm dừng' : 'Tự chạy';
  playBtn.classList.toggle('on', on);
  if (on) { if (readU() > 0.995) { writeU(0); curU = 0; } targetU = readU(); }
}
playBtn.addEventListener('click', () => setAuto(!auto));
for (const ev of ['wheel', 'touchstart']) window.addEventListener(ev, () => { if (auto) setAuto(false); }, { passive: true });
function go(k) { setAuto(false); writeU(uOfStop(k)); }
DOTS.forEach((d, i) => d.addEventListener('click', () => go(i)));
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go],[data-act]'); if (!b) return;
  if (b.dataset.go !== undefined) go(+b.dataset.go);
  const act = b.dataset.act;
  if (act === 'play') setAuto(true);
  if (act === 'restart') { setAuto(false); writeU(0); curU = 0; }
  if (act === 'copy') {
    const email = 'longnminhse@gmail.com', done = () => { b.textContent = 'Đã chép email'; setTimeout(() => { b.textContent = 'Chép email'; }, 1800); };
    const fallback = () => { const el = b.closest('.panel').querySelector('.email'); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Đã chọn, nhấn Ctrl+C'; };
    try { navigator.clipboard.writeText(email).then(done, fallback); } catch (err) { fallback(); }
  }
});
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,select')) return;
  const cur = STATE.phase === 'intro' ? -1 : STATE.phase === 'end' ? 11 : STATE.s.k;
  if (e.key === ' ' && !e.target.closest('button,a')) { e.preventDefault(); setAuto(!auto); }
  else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'ArrowDown') { e.preventDefault(); if (cur < 10) go(cur + 1); else { setAuto(false); writeU(1); } }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp') { e.preventDefault(); if (cur > 0) go(Math.min(cur - 1, 10)); else { setAuto(false); writeU(0); } }
});
// light mode
const lightBox = $('#light');
lightBox.checked = lightMode;
function applyLight() {
  dpr = Math.min(window.devicePixelRatio || 1, lightMode ? 1 : DPR_CAP); renderer.setPixelRatio(dpr); composer?.setPixelRatio(dpr);
  bloomOn = !LOW && !lightMode && !degradedBloom;
  for (const o of EXTRAS) o.visible = !lightMode;
}
lightBox.addEventListener('change', () => { lightMode = lightBox.checked; try { localStorage.setItem('lnm-light', lightMode ? '1' : '0'); } catch (e) { /* ignore */ } applyLight(); });

// ---------------------------------------------------------------- sizing
let VW = 0, VH = 0;
function resize(force) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!force && w === VW && Math.abs(h - VH) < (coarse ? 140 : 1)) return;
  VW = w; VH = h;
  renderer.setSize(w, h, false); composer?.setSize(w, h); bloomPass?.resolution.set(w / 2, h / 2);
  const asp = w / h;
  camera.fov = asp >= 1 ? 40 : clamp((2 * Math.atan(Math.tan((21 * Math.PI) / 180) / asp) * 180) / Math.PI, 40, 78);
  camera.aspect = asp; camera.updateProjectionMatrix();
  const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * asp);
  OV_DIST = Math.max((MAPB.z1 - MAPB.z0) / 2 / Math.tan(vf / 2), (MAPB.x1 - MAPB.x0) / 2 / Math.tan(hf / 2)) * (asp >= 1 ? 1.1 : 1.16);
  measure();
}
window.addEventListener('resize', () => resize(false));
resize(true);

// ---------------------------------------------------------------- precompile shaders behind the fog
let compileTimer = 0;
function precompile(k) {
  clearTimeout(compileTimer);
  compileTimer = setTimeout(() => {
    if (!renderer.compileAsync) return;
    const vis = G.map((g) => g.visible); G.forEach((g) => { g.visible = true; });
    renderer.compileAsync(scene, camera).catch(() => {});
    G.forEach((g, i) => { g.visible = vis[i]; });
  }, 120);
}

// ---------------------------------------------------------------- loop
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), fwd = new THREE.Vector3(), left = new THREE.Vector3();
let last = performance.now(), T = 0, roll = 0, shiftX = 0, shiftY = 0, frames = 0, fpsT = 0, slowStreak = 0, degradedBloom = false;
const fpsEl = $('#fps');
const tierName = LOW ? 'bản nhẹ' : 'bản đầy đủ';
const VIS_R = () => (lightMode ? 300 : LOW ? 360 : 440);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (auto) { targetU = Math.min(1, targetU + dt / AUTO_SECONDS); writeU(targetU); if (targetU >= 1) setAuto(false); }
  else targetU = readU();
  const tau = 0.28 + Math.min(1.2, Math.abs(targetU - curU) * 9);
  curU += (targetU - curU) * (1 - Math.exp(-dt / tau));
  if (Math.abs(targetU - curU) < 1e-6) curU = targetU;
  step(curU, dt);
  frames++; fpsT += dt;
  if (fpsT >= 1) {
    const fps = Math.round(frames / fpsT); fpsEl.textContent = `${fps} khung/giây · ${tierName}`;
    if (fps < 40 && !TEST) { slowStreak++; if (slowStreak >= 2) { slowStreak = 0; if (bloomOn) { bloomOn = false; degradedBloom = true; } else if (dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); composer?.setPixelRatio(dpr); } } }
    else slowStreak = 0;
    frames = 0; fpsT = 0;
  }
}
function step(u, dt) {
  SH.uTime.value = T; water.material.uniforms.uTime.value = T;
  pose(u, T, camPos, camLook);
  camera.position.copy(camPos); camera.lookAt(camLook);
  // bank into curves during the flight
  let targetRoll = 0;
  if (STATE.phase === 'journey') { const i0 = Math.round(clamp(STATE.a / STEP, 0, N)), i1 = Math.round(clamp((STATE.a + 30) / STEP, 0, N)); let dh = Math.atan2(TX[i1], TZ[i1]) - Math.atan2(TX[i0], TZ[i0]); dh = Math.atan2(Math.sin(dh), Math.cos(dh)); targetRoll = clamp(dh * 0.22, -0.06, 0.06); }
  roll += (targetRoll - roll) * (1 - Math.exp(-dt / 0.5)); camera.rotateZ(roll);
  const camY = camera.position.y, ov = smooth(70, 420, camY);
  // frame the landmark away from the panel
  let wp = 0, side = 0;
  if (STATE.phase === 'journey') { const d = STATE.a - ADW[STATE.s.k]; wp = d < 0 ? 1 - smooth(14, 40, -d) : 1 - smooth(10, 30, d); side = SIDE[STATE.s.k]; }
  else if (STATE.phase === 'intro') { wp = 1; side = STATE.tI > 0.72 ? SIDE[0] * smooth(0.72, 1, STATE.tI) : -1 * (1 - smooth(0, 0.5, STATE.tI)); }
  else { wp = 1; side = STATE.tE < 0.4 ? SIDE[10] * (1 - smooth(0, 0.4, STATE.tE)) : -1 * smooth(0.5, 0.85, STATE.tE); }
  const phone = isPhoneLayout();
  const tx = phone ? 0 : 0.2 * wp * side, ty = phone ? 0.22 * Math.max(wp, 0.6) : 0;
  shiftX += (tx - shiftX) * (1 - Math.exp(-dt / 0.35)); shiftY += (ty - shiftY) * (1 - Math.exp(-dt / 0.35));
  const ax = Math.abs(shiftX);
  if (ax > 0.002 || shiftY > 0.002) {
    const fw = VW * (1 + ax), fh = VH * (1 + shiftY);
    camera.setViewOffset(fw, fh, shiftX > 0 ? VW * ax : 0, VH * shiftY, VW, VH);
  } else camera.clearViewOffset();
  SH.uScale.value = (renderer.getPixelRatio() * VH * (1 + shiftY)) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  // atmosphere follows altitude
  scene.fog.density = lerp(0.0042, 0.00016, smooth(25, 420, camY));
  sky.position.copy(camera.position);
  camera.getWorldDirection(fwd); fwd.y = 0; if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1); fwd.normalize();
  left.set(fwd.z, 0, -fwd.x);
  moonGroup.position.copy(camera.position).addScaledVector(fwd, 2600).addScaledVector(left, 700).add(_v3.set(0, 900, 0));
  moonLight.position.copy(camera.position).addScaledVector(fwd, -260).addScaledVector(left, 320).add(_v3.set(0, 420, 0));
  moonLight.target.position.copy(camera.position).addScaledVector(fwd, 60);
  water.material.uniforms.uMoon.value.set(moonGroup.position.x - camera.position.x, moonGroup.position.z - camera.position.z).normalize();
  // lights on the current landmark
  const s = STATE.s, k = s.k, near = STATE.phase === 'journey' ? s.wb : STATE.phase === 'intro' ? smooth(0.6, 1, STATE.tI) : 1 - smooth(0, 0.4, STATE.tE);
  heroLight.intensity = 2.6 * near; heroLight.target.position.copy(HERO[k]);
  heroLight.position.copy(camera.position).add(_v3.set(0, 12, 0)).addScaledVector(fwd, -10);
  warmLight.intensity = 140 * near; warmLight.position.copy(WARM[k]);
  // overview layer
  ribbonMat.uniforms.uAlpha.value = ov; water.material.uniforms.uGlintAmt.value = 1 - smooth(40, 260, camY); HEMI.intensity = lerp(0.85, 1.8, ov); markerMat.uniforms.uAlpha.value = ov; coastMat.opacity = 0.4 * ov;
  ribbonMat.uniforms.uLit.value = STATE.phase === 'end' ? smooth(0.15, 0.85, STATE.tE) * 0.985 : STATE.phase === 'journey' ? STATE.ujour * 0.985 : 0;
  OV.visible = ov > 0.01; markers.pts.visible = ov > 0.01;
  SH.uBoost.value = lerp(1, 2.6, ov);
  // visibility: only nearby stops and terrain are drawn during the flight
  const low = camY < 320, vr = VIS_R();
  for (let i = 0; i < 11; i++) G[i].visible = low && Math.hypot(camera.position.x - GCENTER[i].x, camera.position.z - GCENTER[i].y) < vr;
  for (const m of TERRAIN) m.visible = !low || Math.abs(m.userData.zc - camera.position.z) < 640;
  for (const f of FIELDS) if (f.dyn && (f.k < 0 || G[f.k].visible)) fieldUpdate(f, T);
  for (const a of ANIM) if (G[a.k].visible) a.fn(T);
  updateUI(u); updateLabels(ov);
  if (bloomOn && composer) composer.render(); else renderer.render(scene, camera);
}
applyLight();
requestAnimationFrame(frame);

// test hooks
window.__fly = {
  ready: Promise.all(MODEL_JOBS),
  shot(u, t = 10) { curU = targetU = u; T = t; writeU(u); step(u, 0.016); step(u, 0.5); step(u, 0.5); step(u, 0.5); step(u, 0.5); },
  uOfStop, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tier: TIER, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }),
  U: { U_HOLD, U_INTRO, U_END },
};
