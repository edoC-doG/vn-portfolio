// "Từ Lũng Cú đến Cà Mau": continuous flight prototype.
// Overview of the S-shaped country -> spiral dive at Lũng Cú -> fly the river south, slowing at each stop -> rise over Cà Mau.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const TEST = Q.has('test');
if (TEST) document.documentElement.classList.add('test'); // screenshots: no CSS transitions caught mid-way

// ---------------------------------------------------------------- device tier
const coarse = matchMedia('(pointer: coarse)').matches;
const smallScreen = Math.min(screen.width, screen.height) < 700;
const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
let lightMode = false;
try { lightMode = localStorage.getItem('lnm-light') === '1'; } catch (e) { /* storage blocked */ }
const TIER = Q.get('tier') || ((lightMode || (coarse && smallScreen) || mem <= 4 || cores <= 4) ? 'low' : 'mid');
const LOW = TIER === 'low';
const nq = (mid, low) => (LOW ? low : mid);

// Every model in assets/models, listed by build.mjs. Meshy slots (chua-cau, nha-hoi-an-1, ngo-mon...) are used as soon as
// their files exist; until then the scene falls back to a library model or a code-built stand-in.
const AVAILABLE = new Set(/*MODELS*/ null || ['cot-co-lung-cu', 'lang-bac', 'thap-rua', 'thuyen-buom', 'thap-phuoc-duyen', 'cau-vang', 'thuyen-thung',
  'nha-rong', 'cong-chieng', 'thap-ba-ponagar', 'thap-nuoc-phan-thiet', 'cho-ben-thanh', 'ghe-cho-noi', 'mui-ca-mau']);
const CREDITS = /*CREDITS*/ null || []; // CC BY authors of the Sketchfab models in use
// null: models and textures are base64 .txt files next to the page (the prototype preview cannot serve .glb);
// a path such as '/': plain .glb / .jpg / .png files under it (the Next.js site in web/)
const ASSET_BASE = /*ASSET_BASE*/ null;
const pick = (...slugs) => slugs.find((s) => s && AVAILABLE.has(s)) || null;

// ---------------------------------------------------------------- language (Vietnamese / English)
// On the site the route decides (<html data-lang>); in the prototype ?lang=vi|en wins, then the visitor's saved choice,
// then the browser language. Each panel swaps its content with the
// English copy in <template id="panels-en">; elements marked data-t / data-ta take their text / attribute from TXT;
// strings built in code read tx() and refresh through langHook().
const TXT = {
  vi: {
    title: 'Từ Lũng Cú đến Cà Mau', other: 'EN', otherAria: 'Switch to English',
    stops: ['Lũng Cú', 'Hà Nội', 'Hạ Long', 'Huế', 'Đà Nẵng, Hội An', 'Tây Nguyên', 'Nha Trang', 'Phan Thiết', 'Sài Gòn', 'Miền Tây', 'Mũi Cà Mau'],
    stop: 'Chặng', rail: 'Các chặng', top: 'Về đầu trang', cv: 'CV nhanh ↗', light: 'Chế độ nhẹ', play: 'Tự chạy', pause: 'Tạm dừng',
    fpsInit: '– khung/giây', fps: (n) => `${n} khung/giây · ${LOW ? 'bản nhẹ' : 'bản đầy đủ'}`,
    loading: (a, b) => `Đang tải công trình ${a}/${b}`,
    skyTitle: 'Đổi giờ trong cảnh', wxTitle: 'Đổi thời tiết',
    time: { real: 'Giờ thật', day: 'Ban ngày', sunset: 'Hoàng hôn', night: 'Ban đêm' },
    wx: { real: 'Thời tiết thật', clear: 'Trời quang', rain: 'Mưa' },
    sky: { heavy: 'mưa to', rain: 'mưa', cloud: 'nhiều mây', sun: 'nắng', clear: 'trời quang' },
    copy: 'Chép email', copied: 'Đã chép email', selected: 'Đã chọn, nhấn Ctrl+C',
    close: 'Đóng ×', closeAria: 'Đóng', creditsH: 'Ghi công mô hình 3D',
    creditsP: 'Cảnh dùng mô hình từ Sketchfab theo giấy phép CC BY 4.0 của các tác giả dưới đây, cùng texture và mô hình CC0 từ Poly Haven và ambientCG. Các công trình chính làm bằng Meshy.',
  },
  en: {
    title: 'From Lũng Cú to Cà Mau', other: 'VI', otherAria: 'Chuyển sang tiếng Việt',
    stops: ['Lũng Cú', 'Hà Nội', 'Hạ Long', 'Huế', 'Đà Nẵng, Hội An', 'Central Highlands', 'Nha Trang', 'Phan Thiết', 'Saigon', 'Mekong Delta', 'Cà Mau Cape'],
    stop: 'Stop', rail: 'Stops', top: 'Back to top', cv: 'Quick CV ↗', light: 'Light mode', play: 'Autoplay', pause: 'Pause',
    fpsInit: '– fps', fps: (n) => `${n} fps · ${LOW ? 'light' : 'full'} version`,
    loading: (a, b) => `Loading landmarks ${a}/${b}`,
    skyTitle: 'Change the time of day in the scene', wxTitle: 'Change the weather',
    time: { real: 'Real time', day: 'Daytime', sunset: 'Sunset', night: 'Night' },
    wx: { real: 'Real weather', clear: 'Clear sky', rain: 'Rain' },
    sky: { heavy: 'heavy rain', rain: 'rain', cloud: 'cloudy', sun: 'sunny', clear: 'clear sky' },
    copy: 'Copy email', copied: 'Email copied', selected: 'Selected, press Ctrl+C',
    close: 'Close ×', closeAria: 'Close', creditsH: '3D model credits',
    creditsP: 'The scene uses Sketchfab models by the authors below, under CC BY 4.0, plus CC0 textures and models from Poly Haven and ambientCG. The main landmarks are made with Meshy.',
  },
};
let LANG = (() => {
  const q = document.documentElement.dataset.lang || Q.get('lang'); if (TXT[q]) return q;
  try { const s = localStorage.getItem('lnm-lang'); if (TXT[s]) return s; } catch (e) { /* storage blocked */ }
  return /^vi/i.test(navigator.language || 'vi') ? 'vi' : 'en';
})();
const tx = (key) => TXT[LANG][key];
const LANG_HOOKS = [];
const langHook = (f) => { LANG_HOOKS.push(f); f(); };
const PANEL_HTML = { vi: {}, en: {} };
for (const s of $('#panels-en')?.content.querySelectorAll('section[data-k]') || []) PANEL_HTML.en[s.dataset.k] = s.innerHTML;
const PAGE_LANG = TXT[document.documentElement.dataset.lang] ? document.documentElement.dataset.lang : 'vi'; // the prototype ships in Vietnamese
for (const el of $$('.panel[data-k]')) { PANEL_HTML[PAGE_LANG][el.dataset.k] = el.innerHTML; el.dataset.lang = PAGE_LANG; }
function applyLang() {
  const L = TXT[LANG];
  document.documentElement.lang = LANG; if (!document.documentElement.dataset.lang) document.title = L.title; // the site sets its own titles
  for (const el of $$('.panel[data-k]')) {
    const html = PANEL_HTML[LANG][el.dataset.k];
    if (html !== undefined && el.dataset.lang !== LANG) { el.innerHTML = html; el.dataset.lang = LANG; }
  }
  for (const el of $$('[data-t]')) el.textContent = L[el.dataset.t];
  for (const el of $$('[data-ta]')) { const [attr, k] = el.dataset.ta.split(':'); el.setAttribute(attr, L[k]); }
  $$('.rail .dot').forEach((d, i) => d.setAttribute('aria-label', `${L.stop} ${i + 1}, ${L.stops[i]}`));
  const lb = $('#lang'); if (lb) { lb.textContent = L.other; lb.setAttribute('aria-label', L.otherAria); lb.lang = LANG === 'vi' ? 'en' : 'vi'; }
  for (const f of LANG_HOOKS) f();
}
applyLang();
$('#lang')?.addEventListener('click', (e) => {
  // on the site the pill is a link to the other language's page: keep the place in the journey across the reload
  if (e.currentTarget.tagName === 'A') { try { sessionStorage.setItem('lnm-u', String(readU())); } catch (err) { /* storage blocked */ } return; }
  LANG = LANG === 'vi' ? 'en' : 'vi';
  try { localStorage.setItem('lnm-lang', LANG); } catch (e) { /* storage blocked */ }
  if (Q.has('lang')) { Q.set('lang', LANG); history.replaceState(null, '', `${location.pathname}?${Q}${location.hash}`); }
  applyLang();
});

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
// ridged multifractal: sharp crests and branching valleys, the shape real mountain ranges have
function ridged(x, z) {
  let sum = 0, amp = 0.5, w = 1, f = 1;
  for (let o = 0; o < 5; o++) { let r = 1 - Math.abs(vnoise(x * f + o * 7.1, z * f - o * 3.3) * 2 - 1); r *= r * w; w = clamp(r * 2, 0, 1); sum += r * amp; f *= 2.03; amp *= 0.5; }
  return sum * 1.1;
}

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
const SH = { uTime: { value: 0 }, uScale: { value: 600 }, uBoost: { value: 1 }, uLamp: { value: 1 } }; // uLamp: artificial lights, 1 at night, near 0 by day
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 9000);

// materials: Lambert on the light tier, Standard otherwise
function M(o) {
  const { roughness = 0.9, metalness = 0, ...rest } = o;
  return LOW ? new THREE.MeshLambertMaterial(rest) : new THREE.MeshStandardMaterial({ roughness, metalness, ...rest });
}
// ---------------------------------------------------------------- textures (base64 files, like the models)
const TEX_JOBS = [];
function loadTex(name, { mime = 'image/jpeg', placeholder = '#8080ff', srgb = false, repeat = true } = {}) {
  const ph = document.createElement('canvas'); ph.width = ph.height = 1;
  const pg = ph.getContext('2d'); pg.fillStyle = placeholder; pg.fillRect(0, 0, 1, 1);
  const t = new THREE.Texture(ph); t.needsUpdate = true;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = LOW ? 1 : 4; // the real image replaces the placeholder on load; t.dispose() there makes the GPU copy reallocate at the new size
  const src = ASSET_BASE == null
    ? fetch(`textures/${name}.txt`).then((r) => { if (!r.ok) throw new Error(name + ' ' + r.status); return r.text(); }).then((b64) => `data:${mime};base64,${b64.trim()}`)
    : Promise.resolve(`${ASSET_BASE}textures/${name}.${mime === 'image/png' ? 'png' : 'jpg'}`);
  TEX_JOBS.push(src
    .then((url) => new Promise((res) => { const img = new Image(); img.onload = () => { t.image = img; t.dispose(); t.needsUpdate = true; res(); }; img.onerror = () => { console.warn('texture ' + name); res(); }; img.src = url; }))
    .catch((e) => console.warn(e)));
  return t;
}

// Terrain textures from assets/incoming, prepared by tools/textures/process.mjs; build.mjs inlines the manifest here.
// Without them the shader below falls back to noise.
const TERRAIN_TEX = /*TERRAIN_TEX*/ null;
const NAT_TEX = !!(TERRAIN_TEX && ['rock', 'ground', 'field', 'sand'].every((l) => TERRAIN_TEX[l]));
const toSRGBHex = (m) => '#' + m.map((v) => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)).toString(16).padStart(2, '0')).join('');
const NAT_MAPS = {};
const WET = { value: 0 }; // rain darkens the ground and makes it shine
// Terrain, karsts and islands: smooth normals with detail added in the shader. Steep faces become rock with strata,
// gentle slopes stay vegetated (tinted by the vertex colours), and the waterline turns to wet sand. A procedural bump adds grain.
const NAT_GLSL = `
  float nh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float nn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(nh3(i), nh3(i + vec3(1,0,0)), f.x), mix(nh3(i + vec3(0,1,0)), nh3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(nh3(i + vec3(0,0,1)), nh3(i + vec3(1,0,1)), f.x), mix(nh3(i + vec3(0,1,1)), nh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
  vec3 natBump(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection) {
    vec3 vSigmaX = normalize(dFdx(surf_pos)), vSigmaY = normalize(dFdy(surf_pos)), vN = surf_norm;
    vec3 R1 = cross(vSigmaY, vN), R2 = cross(vN, vSigmaX);
    float fDet = dot(vSigmaX, R1) * faceDirection;
    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surf_norm - vGrad);
  }
  varying vec3 vNatP; varying vec3 vNatN; uniform vec3 uRock; uniform vec3 uSand; uniform float uVeg; uniform float uWet;
#ifdef NAT_TEX
  uniform sampler2D tRock, tGround, tField, tSand; uniform vec3 uRockMean, uGroundMean, uFieldMean, uSandMean;
  vec3 triC(sampler2D t, vec3 p, vec3 w){ return texture2D(t, p.zy).rgb * w.x + texture2D(t, p.xz).rgb * w.y + texture2D(t, p.xy).rgb * w.z; }
  // texture relative to its average, mostly as light and dark: a channel the photo barely has (blue in warm rock) must not blow up
  vec3 rel(vec3 c, vec3 m){ float l = dot(c, vec3(0.2126, 0.7152, 0.0722)) / dot(m, vec3(0.2126, 0.7152, 0.0722)); return mix(vec3(l), c / m, 0.3); }
#ifdef NAT_TEX_N
  uniform sampler2D tRockN, tGroundN, tFieldN, tSandN;
  // whiteout-blended triplanar normal mapping (world space)
  vec3 triN(sampler2D t, vec3 p, vec3 w, vec3 N, float k){
    vec3 nx = texture2D(t, p.zy).xyz * 2.0 - 1.0, ny = texture2D(t, p.xz).xyz * 2.0 - 1.0, nz = texture2D(t, p.xy).xyz * 2.0 - 1.0;
    nx = vec3(nx.xy * k + N.zy, abs(nx.z) * N.x); ny = vec3(ny.xy * k + N.xz, abs(ny.z) * N.y); nz = vec3(nz.xy * k + N.xy, abs(nz.z) * N.z);
    return normalize(nx.zyx * w.x + ny.xzy * w.y + nz.xyz * w.z);
  }
  vec3 topN(sampler2D t, vec2 uv, vec3 N, float k){ vec3 n = texture2D(t, uv).xyz * 2.0 - 1.0; n = vec3(n.xy * k + N.xz, abs(n.z) * N.y); return normalize(n.xzy); }
#endif
#endif
`;
function natureMaterial({ color = 0xffffff, vertexColors = false, rock = 0x3b3d3a, sand = 0x4f4634, veg = 1, roughness = 0.95 } = {}) {
  const m = M({ color, vertexColors, roughness });
  if (NAT_TEX) for (const l of ['rock', 'ground', 'field', 'sand']) {
    NAT_MAPS[l] ??= loadTex('terrain-' + l, { srgb: true, placeholder: toSRGBHex(TERRAIN_TEX[l].mean) });
    if (!LOW) NAT_MAPS[l + 'N'] ??= loadTex('terrain-' + l + '-n');
  }
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRock = { value: new THREE.Color(rock) }; sh.uniforms.uSand = { value: new THREE.Color(sand) }; sh.uniforms.uVeg = { value: veg }; sh.uniforms.uWet = WET;
    if (NAT_TEX) {
      for (const l of ['rock', 'ground', 'field', 'sand']) {
        const U = l[0].toUpperCase() + l.slice(1);
        sh.uniforms['t' + U] = { value: NAT_MAPS[l] }; sh.uniforms['u' + U + 'Mean'] = { value: new THREE.Vector3(...TERRAIN_TEX[l].mean) };
        if (!LOW) sh.uniforms['t' + U + 'N'] = { value: NAT_MAPS[l + 'N'] };
      }
      sh.defines = { ...sh.defines, NAT_TEX: '', ...(LOW ? {} : { NAT_TEX_N: '' }) };
    }
    sh.vertexShader = 'varying vec3 vNatP; varying vec3 vNatN;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 natP = vec4(transformed, 1.0); vec3 natN = objectNormal;
      #ifdef USE_INSTANCING
        natP = instanceMatrix * natP; natN = mat3(instanceMatrix) * natN;
      #endif
      vNatP = (modelMatrix * natP).xyz; vNatN = normalize(mat3(modelMatrix) * natN);`);
    sh.fragmentShader = NAT_GLSL + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 P = vNatP; vec3 WN = normalize(vNatN);
        float slope = 1.0 - clamp(WN.y, 0.0, 1.0);
        float big = nn3(P * 0.06), mid = nn3(P * 0.31), fine = nn3(P * 1.7);
        // vegetation: canopy clumps and clearings
        vec3 veg = diffuseColor.rgb * (0.62 + 0.55 * big) * mix(0.72, 1.12, smoothstep(0.35, 0.7, mid));
        // rock: strata along y, broken by noise
        float strata = 0.82 + 0.18 * sin(P.y * 1.6 + big * 6.0 + mid * 2.0);
        vec3 rk = uRock * (0.62 + 0.55 * mid) * strata * (0.85 + 0.3 * fine);
        float rockW = smoothstep(0.38, 0.62, slope + (big - 0.5) * 0.35) * uVeg + (1.0 - uVeg);
        float sandW = (1.0 - smoothstep(0.35, 1.5, P.y + (mid - 0.5) * 0.8)) * (1.0 - rockW * 0.6);
        vec3 sandC = uSand * (0.75 + 0.4 * fine);
        #ifdef NAT_TEX
          // photo textures divided by their own average: they add detail, the region tint still comes from the vertex colours
          vec3 tw = pow(abs(WN), vec3(4.0)); tw /= tw.x + tw.y + tw.z;
          rk = uRock * rel(triC(tRock, P / 11.0, tw), uRockMean) * mix(vec3(1.0), rel(triC(tRock, P / 43.0 + 0.37, tw), uRockMean), 0.35) * (0.8 + 0.4 * big);
          vec3 gT = rel(texture2D(tGround, P.xz / 7.5).rgb, uGroundMean), fT = rel(texture2D(tField, P.xz / 9.0).rgb, uFieldMean);
          // fields on low flat land near the river, forest floor elsewhere
          float fieldW = (1.0 - smoothstep(3.0, 9.0, P.y + (big - 0.5) * 6.0)) * (1.0 - smoothstep(0.12, 0.3, slope));
          veg = diffuseColor.rgb * (0.7 + 0.5 * big) * mix(mix(vec3(1.0), gT, 0.85), mix(vec3(1.0), fT, 0.85) * vec3(1.05, 1.0, 0.85), fieldW);
          sandC = uSand * rel(texture2D(tSand, P.xz / 6.0).rgb, uSandMean) * (0.85 + 0.3 * mid);
        #endif
        vec3 natC = mix(veg, rk, rockW);
        natC = mix(natC, sandC * mix(0.55, 1.0, smoothstep(-0.2, 0.9, P.y)), sandW);
        diffuseColor.rgb = natC * mix(1.0, 0.6, uWet);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.3, uWet);')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
${LOW ? '' : NAT_TEX ? `        #ifdef NAT_TEX_N
        {
          vec3 Nr = triN(tRockN, P / 11.0, tw, WN, 1.0);
          vec3 Nv = mix(topN(tGroundN, P.xz / 7.5, WN, 0.8), topN(tFieldN, P.xz / 9.0, WN, 0.8), fieldW);
          vec3 Nw = normalize(mix(mix(Nv, Nr, rockW), topN(tSandN, P.xz / 6.0, WN, 0.6), sandW));
          normal = normalize((viewMatrix * vec4(Nw, 0.0)).xyz);
        }
        #endif` : `        {
          float natH = nn3(vNatP * 0.9) * 0.55 + nn3(vNatP * 3.1) * 0.22 + nn3(vNatP * 9.0) * 0.08;
          normal = natBump(-vViewPosition, normal, vec2(dFdx(natH), dFdy(natH)) * 1.4, faceDirection);
        }`}`);
  };
  m.customProgramCacheKey = () => 'nature' + (vertexColors ? 'v' : '') + (NAT_TEX ? 't' : '');
  return m;
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
    uniforms: { top: { value: new THREE.Color(0x050b16) }, mid: { value: new THREE.Color(0x0f2a3a) }, horizon: { value: new THREE.Color(0x173039) },
      uSunDir: { value: new THREE.Vector3(0, -1, 0) }, uSunCol: { value: new THREE.Color(0, 0, 0) }, uSunDisc: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform float uSunDisc; varying vec3 vP;
      void main(){ float h = clamp(vP.y, -0.1, 1.0);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h));
        // sun: wide glow (strongest low on the horizon at dawn and dusk) and the disc
        float sd = max(dot(normalize(vP), uSunDir), 0.0);
        c += uSunCol * (pow(sd, 5.0) * 0.45 + pow(sd, 60.0) * 0.6) + uSunCol * smoothstep(0.9993, 0.9997, sd) * uSunDisc * 6.0;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  })
);
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
const STARS_MAT = new THREE.PointsMaterial({ color: 0xcfe6ff, size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 });
{
  const p = [];
  for (let i = 0; i < nq(1400, 700); i++) {
    const th = rand() * Math.PI * 2, ph = Math.acos(0.12 + rand() * 0.88);
    p.push(Math.sin(ph) * Math.cos(th) * 4000, Math.cos(ph) * 4000, Math.sin(ph) * Math.sin(th) * 4000);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const stars = new THREE.Points(g, STARS_MAT);
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
const MOON_HALO = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xbfd8ff, transparent: true, opacity: 0.4, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
moonGroup.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false })));
{
  const halo = new THREE.Sprite(MOON_HALO);
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
// image-based light from the sky; rebuilt when the time of day or the weather has moved enough (see updateAtmo)
const PMREM = new THREE.PMREMGenerator(renderer), ENV_SCENE = new THREE.Scene(); ENV_SCENE.add(sky.clone());
function rebuildEnv() { const old = scene.environment; scene.environment = PMREM.fromScene(ENV_SCENE, 0.02).texture; old?.dispose(); }
rebuildEnv(); scene.environmentIntensity = 0.5;

// ---------------------------------------------------------------- the S route
// Stops follow the real east-west order of each place (east = -x, so north is up when seen from the south), spaced evenly north to south.
const STOP_NAMES = ['Lũng Cú', 'Hà Nội', 'Hạ Long', 'Huế', 'Đà Nẵng, Hội An', 'Tây Nguyên', 'Nha Trang', 'Phan Thiết', 'Sài Gòn', 'Miền Tây', 'Mũi Cà Mau'];
const STOP_X = [60, 40, -7, -26, -50, -44, -87, -46, 8, 43, 82].map((x) => x * 1.8); // exaggerated so the S reads from above
// the route starts out at sea north of Lũng Cú, so the camera has room to fly in toward the flag
const curve = new THREE.CatmullRomCurve3(
  [[STOP_X[0] + 6, 95], ...STOP_X.map((x, i) => [x, -110 * i]), [STOP_X[10] + 16, -1175], [STOP_X[10] + 10, -1270]].map(([x, z]) => new THREE.Vector3(x, 0, z)),
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
const COLS = [0x1d3324, 0x1f3526, 0x1d2f2a, 0x1c3326, 0x1d3428, 0x5a2a1c, 0x233528, 0x4e3f2c, 0x26302b, 0x1b3a22, 0x15301f].map((c) => new THREE.Color(c));
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
  let y = -2.5 + bank * (base + 2.5) + (fbm(x * 0.03, z * 0.03) + 0.35 * (fbm(x * 0.11, z * 0.11) - 0.5)) * si(ROUGH, a) * bank;
  const m = si(MOUNT, a);
  if (m > 1.5) {
    const n = fbm(x * 0.012 + 3.1, z * 0.012 - 1.7);
    const karst = 1 - smooth(A_STOP[0] + 30, A_STOP[1] - 10, a); // Hà Giang: sharp limestone peaks
    const r = ridged(x * 0.011 + 1.3, z * 0.011 - 4.2);
    y += smooth(48, 210, d) * m * lerp(0.22 + 0.5 * n + 0.55 * r * (0.6 + 0.4 * n), Math.pow(n, 2) * 2.1, karst);
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
  const x0 = -205, x1 = 295, z0 = 60, z1 = -1225, chunks = 8, cell = LOW ? 4.2 : 2.6;
  const mat = natureMaterial({ vertexColors: true });
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
// Normal-mapped sea: sky reflection by Fresnel, a glitter path under the moon, lighter water and foam over the shallows.
// The shallows come from a small height texture baked from the terrain function (no reflection pass).
const DEPTH_B = { x0: -205, z0: 60, w: 500, h: -1285 };
const depthTex = (() => {
  const W = LOW ? 128 : 192, H = LOW ? 320 : 480, d = new Uint8Array(W * H * 4);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const y = terrainHeight(DEPTH_B.x0 + ((i + 0.5) / W) * DEPTH_B.w, DEPTH_B.z0 + ((j + 0.5) / H) * DEPTH_B.h);
    d[(j * W + i) * 4] = Math.round(clamp((y + 6) / 12, 0, 1) * 255);
  }
  const t = new THREE.DataTexture(d, W, H); t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
})();
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(9000, 9000),
  new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x04121a) }, uShallow: { value: new THREE.Color(0x15403f) },
      uSkyLo: { value: new THREE.Color(0x1f4250) }, uSkyHi: { value: new THREE.Color(0x0b2232) }, uMoonCol: { value: new THREE.Color(0xe8f0ff) },
      uMoonDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() }, uGlintAmt: { value: 1 }, uRain: { value: 0 },
      tNormal: { value: null }, tDepth: { value: null }, uDepthB: { value: new THREE.Vector4(DEPTH_B.x0, DEPTH_B.z0, 1 / DEPTH_B.w, 1 / DEPTH_B.h) },
    }]),
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSkyLo; uniform vec3 uSkyHi; uniform vec3 uMoonCol; uniform vec3 uMoonDir;
      uniform float uGlintAmt; uniform float uRain; uniform sampler2D tNormal; uniform sampler2D tDepth; uniform vec4 uDepthB; varying vec3 vW;
      #include <fog_pars_fragment>
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), u.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), u.x), u.y); }
      vec3 nm(vec2 uv){ return texture2D(tNormal, uv).xzy * 2.0 - 1.0; } // the map's blue channel is "up"
      // rain: expanding rings, one drop per cell, two staggered layers
      vec2 ripples(vec2 p, float t){
        vec2 acc = vec2(0.0);
        for (int k = 0; k < 2; k++) {
          vec2 q = p * (k == 0 ? 1.0 : 1.37) + float(k) * 7.3, i = floor(q), f = fract(q) - 0.5;
          float h = h1(i + float(k) * 1.7), ph = fract(t * (0.8 + h * 0.6) + h * 7.0);
          vec2 d = f - (vec2(h1(i + 3.1), h1(i + 5.7)) - 0.5) * 0.5; float r = length(d), rr = ph * 0.5;
          acc += d / (r + 1e-3) * sin((r - rr) * 45.0) * smoothstep(0.07, 0.0, abs(r - rr)) * (1.0 - ph);
        }
        return acc;
      }
      void main(){
        vec3 toCam = cameraPosition - vW; float dist = length(toCam); vec3 V = toCam / dist;
        vec2 p = vW.xz;
        vec3 n = nm(p / 31.0 + vec2(uTime * 0.010, uTime * 0.007)) + nm(p / 11.0 + vec2(-uTime * 0.017, uTime * 0.012)) * 0.8
${LOW ? '' : '               + nm(p / 3.7 + vec2(uTime * 0.026, -uTime * 0.021)) * 0.45'};
        float detail = 1.0 - smoothstep(80.0, 900.0, dist);
        vec3 N = normalize(vec3(n.x * 0.42 * detail, n.y, n.z * 0.42 * detail));
        if (uRain > 0.01) { vec2 rp = ripples(p * 1.4, uTime) * uRain * (1.0 - smoothstep(25.0, 90.0, dist)); N = normalize(N + vec3(rp.x, 0.0, rp.y) * 0.9); }
        // depth of the sea floor under this point (deep sea outside the baked area)
        vec2 duv = (p - uDepthB.xy) * uDepthB.zw; float floorY = -6.0;
        if (duv.x > 0.0 && duv.x < 1.0 && duv.y > 0.0 && duv.y < 1.0) floorY = texture2D(tDepth, duv).r * 12.0 - 6.0;
        float depth = max(-floorY, 0.0);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 R = reflect(-V, N); R.y = abs(R.y);
        vec3 sky = mix(uSkyLo, uSkyHi, smoothstep(0.0, 0.45, R.y));
        float m = max(dot(R, uMoonDir), 0.0);
        float spec = pow(m, 1400.0) * 5.0 + pow(m, 220.0) * 0.22 + pow(m, 30.0) * 0.012;
        vec3 body = mix(uShallow, uDeep, smoothstep(0.25, 4.5, depth));
        vec3 col = mix(body, sky, fres) + uMoonCol * spec * uGlintAmt;
        // foam where the water meets the shore
        float fn = n2(p * 0.55 + vec2(uTime * 0.12, -uTime * 0.09)) * 0.7 + n2(p * 1.7 - uTime * 0.2) * 0.3;
        float band = 0.5 + 0.5 * sin(depth * 7.0 - uTime * 1.4 + fn * 3.0);
        float foam = (1.0 - smoothstep(0.05, 1.1, depth)) * smoothstep(0.45, 0.8, fn * 0.7 + band * 0.45) * step(-5.9, floorY);
        col = mix(col, vec3(0.42, 0.52, 0.56), foam * 0.6 * detail);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  })
);
water.material.uniforms.tNormal.value = loadTex('waternormals');
water.material.uniforms.tDepth.value = depthTex;
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
    fragmentShader: `varying vec3 vC; uniform float uAlpha; uniform float uLamp;
      #include <fog_pars_fragment>
      void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(1.0 - d, 0.0), 2.4) * uAlpha;
        vec3 c = vC * a * uLamp;
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
  m.uniforms.uTime = SH.uTime; m.uniforms.uScale = SH.uScale; m.uniforms.uBoost = SH.uBoost; m.uniforms.uLamp = SH.uLamp;
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
const TREE_KINDS = ['oak', 'ash', 'pine', 'bush']; // baked from EZ-Tree by tools/trees/bake.mjs
const TREE_MESHES = !LOW; // the light tier draws impostors only, to stay within its draw-call budget
const modelsTotal = () => Object.keys(TEMPL).length; // models requested so far (stops load in journey order)
function pump() {
  while (active < 3 && QUEUE.length) {
    const job = QUEUE.shift(); active++;
    fetch(ASSET_BASE == null ? `models/${TIER}/${job.slug}.txt` : `${ASSET_BASE}models/${TIER}/${job.slug}.glb`)
      .then((r) => { if (!r.ok) throw new Error(job.slug + ' ' + r.status); return ASSET_BASE == null ? r.text() : r.arrayBuffer(); })
      .then((data) => { if (typeof data !== 'string') return loader.parseAsync(data, ''); const s = atob(data.trim()), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return loader.parseAsync(u.buffer, ''); })
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
const EXCL = []; // [x, z, r]: keep the forest off landmarks, pedestals and terraces
function place(k, slug, s, p, y, rotOff = 0, opts = {}) {
  if (!AVAILABLE.has(slug)) return Promise.resolve(null);
  EXCL.push([p.x, p.z, s * 0.55 + 5]);
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
  EXCL.push([x, z, r + 5]);
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

// ---------------------------------------------------------------- scenery: library models and code-built surroundings
// Library props (assets/models, see tools/library) are drawn instanced: one draw call per material however many copies.
// Meshy slots use pick(): the Meshy file when it exists, else a library stand-in, else a code-built one.
const UP = new THREE.Vector3(0, 1, 0), _m4b = new THREE.Matrix4(), _pf = { x: 0, z: 0, tx: 0, tz: 1 };
// small props live in SG[k], drawn only near the camera (they vanish in the fog further out anyway); big ones go in G[k]
const SG = G.map((g) => { const s = new THREE.Group(); g.add(s); return s; });
const SG_R = () => (LOW ? 110 : 230);
const MAT_TEX = {};
const matTex = (name) => (MAT_TEX[name] ??= loadTex('mat-' + name, { srgb: true, placeholder: '#808080' }));
const texMat = (name, opts = {}) => M({ color: 0xffffff, map: matTex(name), roughness: 0.92, ...opts });
// box whose UVs are in world units (one texture tile per `tile` units), so a texture keeps its scale on any size
function tiledBox(w, h, d, tile = 4) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setXY(j, (uv.getX(j) * dims[f][0]) / tile, (uv.getY(j) * dims[f][1]) / tile); }
  return g;
}
const tint = (g, c) => { const col = new THREE.Color(c), a = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < a.length; i += 3) { a[i] = col.r; a[i + 1] = col.g; a[i + 2] = col.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
// position on the route with linear interpolation (at() snaps to the path samples, too coarse for moving traffic)
function atf(k, lat, along) {
  const f = clamp((A_STOP[k] + along) / STEP, 0, N - 1e-6), i = Math.floor(f), t = f - i, j = i + 1;
  _pf.tx = TX[i] + (TX[j] - TX[i]) * t; _pf.tz = TZ[i] + (TZ[j] - TZ[i]) * t;
  _pf.x = PX[i] + (PX[j] - PX[i]) * t - _pf.tz * lat; _pf.z = PZ[i] + (PZ[j] - PZ[i]) * t + _pf.tx * lat;
  return _pf;
}
// Many copies of one library model. items: [{ x, z, y?, s, ry? }]; s is the model's largest size in world units.
// opts.long turns the model so its longest side runs along ry (vehicles, boats); opts.update(t, items) moves them each frame.
function scatter(k, slug, items, opts = {}) {
  if (!slug || !AVAILABLE.has(slug) || !items.length) return null;
  if (opts.excl) for (const it of items) EXCL.push([it.x, it.z, it.s * opts.excl]);
  for (const it of items) if (it.y === undefined) it.y = Math.max(gy(it.x, it.z), 0) + (opts.dy ?? 0) * it.s;
  const set = { items, meshes: [], parts: [] };
  MODEL_JOBS.push(loadModel(slug).then((tpl) => {
    if (!tpl) return;
    tpl.updateMatrixWorld(true);
    // props standing on the camera's flight path would fill the screen: drop those (moving traffic stays on its road)
    if (!opts.update && !opts.keep) { set.items = items.filter((it) => camClear(it.x, it.z, it.s * 0.45 + 3)); if (!set.items.length) return; }
    const pre = new THREE.Matrix4();
    if (opts.long) { const sz = new THREE.Box3().setFromObject(tpl).getSize(new THREE.Vector3()); if (sz.x > sz.z) pre.makeRotationY(Math.PI / 2); }
    tpl.traverse((m) => {
      if (!m.isMesh) return;
      const im = new THREE.InstancedMesh(m.geometry, m.material, set.items.length);
      set.meshes.push(im); set.parts.push(pre.clone().multiply(m.matrixWorld)); (opts.far ? G[k] : SG[k]).add(im);
      if (opts.extra) EXTRAS.push(im);
    });
    setMatrices(set);
    if (opts.update) { for (const im of set.meshes) im.frustumCulled = false; ANIM.push({ k, fn: (t) => { opts.update(t, items); setMatrices(set); } }); }
    else for (const im of set.meshes) im.computeBoundingSphere();
    precompile(k);
  }));
  return set;
}
// whether a prop at (x, z) with radius r keeps clear of the flight path (sampled once, after the camera rig is defined)
// and of the line of sight from the camera at each stop to its landmark
let CAM_PTS = null, CAM_LINES = null;
function camClear(x, z, r) {
  if (!CAM_PTS) {
    CAM_PTS = []; CAM_LINES = [];
    const p = new THREE.Vector3(), l = new THREE.Vector3();
    for (let a = A_START; a <= A_END; a += 3) { journeyPose(a, p, l); CAM_PTS.push(p.x, p.z); }
    for (let k = 0; k < 11; k++) { journeyPose(ADW[k], p, l); CAM_LINES.push([p.x, p.z, HERO[k].x, HERO[k].z]); }
  }
  for (let i = 0; i < CAM_PTS.length; i += 2) if ((CAM_PTS[i] - x) ** 2 + (CAM_PTS[i + 1] - z) ** 2 < r * r) return false;
  for (const [ax, az, bx, bz] of CAM_LINES) {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
    if (Math.hypot(x - ax - dx * t, z - az - dz * t) < r + 4 + 0.15 * t * Math.sqrt(L2)) return false;
  }
  return true;
}
function setMatrices(set) {
  set.items.forEach((it, i) => {
    _m4.compose(_v3.set(it.x, it.y, it.z), _q.setFromAxisAngle(UP, it.ry ?? 0), _s3.setScalar(it.s));
    for (let j = 0; j < set.meshes.length; j++) set.meshes[j].setMatrixAt(i, _m4b.multiplyMatrices(_m4, set.parts[j]));
  });
  for (const im of set.meshes) im.instanceMatrix.needsUpdate = true;
}
// items along a bank: n copies between along a0 and a1 at lateral lat ± jitter
function along(k, n, lat, a0, a1, s, { jit = 0, sJit = 0.15, ry = null, face = 0, gap = 0 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const al = a0 + ((a1 - a0) * (i + 0.5)) / n + R(-gap, gap), l = lat + R(-jit, jit), q = at(k, l, al);
    out.push({ x: q.x, z: q.z, s: s * (1 + R(-sJit, sJit)), ry: ry ?? q.rot + face });
  }
  return out;
}
const around = (k, n, l0, l1, a0, a1, s, sJit = 0.25) => [...Array(n)].map(() => { const q = at(k, R(l0, l1), R(a0, a1)); return { x: q.x, z: q.z, s: s * (1 + R(-sJit, sJit)), ry: R(0, 6.28) }; });

// road strip along the river at lateral offset lat (centre), width w, along a0..a1, following the ground
const ROAD_MAT = {};
function road(k, lat, a0, a1, w, tex, { lift = 0.12, tile = 6 } = {}) {
  const pos = [], uv = [], idx = [], n = Math.max(2, Math.ceil((a1 - a0) / 2)), hs = [];
  for (let i = 0; i <= n; i++) {
    const al = a0 + ((a1 - a0) * i) / n;
    let hm = 0;
    for (const s of [-1, 0, 1]) { const q = at(k, lat + (s * w) / 2, al); hm = Math.max(hm, gy(q.x, q.z)); }
    hm = Math.max(hm, 0.5) + lift; hs.push(hm);
    for (const s of [-1, 1]) { const q = atf(k, lat + (s * w) / 2, al); pos.push(q.x, hm, q.z); uv.push(((s + 1) / 2) * (w / tile), (al - a0) / tile); }
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    if (i % 3 === 0) { const q = at(k, lat, al); EXCL.push([q.x, q.z, w * 0.5 + 3]); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  ROAD_MAT[tex] ??= texMat(tex, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  SG[k].add(new THREE.Mesh(g, ROAD_MAT[tex]));
  return { lat, a0, a1, w, h: (al) => { const f = clamp(((al - a0) / (a1 - a0)) * n, 0, n), i = Math.min(n - 1, Math.floor(f)); return hs[i] + (hs[i + 1] - hs[i]) * (f - i); } };
}
// traffic on a road: lanes either side of the centre line, vehicles loop from a0 to a1 (or back)
function traffic(k, rd, specs) {
  for (const { slug, n, s, speed = 6 } of specs) {
    if (!pick(slug) || (LOW && s > 3)) continue; // light tier: motorbikes only (cars and buses carry a dozen materials each)
    const items = [...Array(n)].map((_, i) => ({ ph: rand() * (rd.a1 - rd.a0), dir: i % 2 ? 1 : -1, lane: (i % 2 ? 1 : -1) * rd.w * R(0.12, 0.32), v: speed * R(0.7, 1.25), s: s * R(0.92, 1.08), x: 0, y: 0, z: 0 }));
    const len = rd.a1 - rd.a0;
    const move = (t) => { for (const it of items) { const al = rd.a0 + ((((it.ph + it.dir * it.v * t) % len) + len) % len), q = atf(k, rd.lat + it.lane, al); it.x = q.x; it.z = q.z; it.y = rd.h(al); it.ry = Math.atan2(q.tx, q.tz) + (it.dir > 0 ? 0 : Math.PI); } };
    move(0);
    scatter(k, slug, items, { long: true, update: move });
  }
}
// power lines: poles every `step` along a bank, three sagging wires between neighbours (one draw call)
const WIRE_MAT = new THREE.LineBasicMaterial({ color: 0x15191a });
function powerLine(k, lat, a0, a1, step = 12, h = 7.5) {
  const poles = along(k, Math.max(2, Math.round((a1 - a0) / step)), lat, a0, a1, h, { sJit: 0.05 });
  scatter(k, 'cot-dien', poles);
  const v = [];
  for (let i = 1; i < poles.length; i++) {
    const A = poles[i - 1], B = poles[i], dx = B.x - A.x, dz = B.z - A.z, l = Math.hypot(dx, dz), nx = -dz / l, nz = dx / l;
    for (const [o, dy, sag] of [[-0.45, 0.9, 0.7], [0, 0.82, 0.9], [0.45, 0.9, 0.7], [0.15, 0.7, 1.4]]) {
      let px, py, pz;
      for (let s = 0; s <= 8; s++) {
        const t = s / 8, x = A.x + dx * t + nx * o, z = A.z + dz * t + nz * o, y = A.y + (B.y - A.y) * t + A.s * dy - sag * 4 * t * (1 - t);
        if (s) v.push(px, py, pz, x, y, z); px = x; py = y; pz = z;
      }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  SG[k].add(new THREE.LineSegments(g, WIRE_MAT));
}
// a row of narrow houses (stand-in until the Meshy house arrives): plaster walls tinted per house, tiled or flat roofs
function houseRow(k, lat, a0, a1, { w = [4.5, 6.5], h = [5, 9], d = 7, tints, roof = 'roof-moss', wall = 'plaster', flat = false, face = 1 }) {
  const walls = [], roofs = [], houses = [];
  for (let al = a0; al < a1;) {
    const ww = R(w[0], w[1]), hh = R(h[0], h[1]), q = at(k, lat + R(-0.6, 0.6), al + ww / 2), y = Math.max(gy(q.x, q.z), 0.3);
    walls.push([tint(tiledBox(d, hh, ww, 4), tints[houses.length % tints.length]), MY(q.x, y + hh / 2, q.z, q.rot)]);
    if (flat) roofs.push([tiledBox(d + 0.4, 0.4, ww + 0.2, 4), MY(q.x, y + hh + 0.2, q.z, q.rot)]);
    else roofs.push([new THREE.CylinderGeometry(0.01, d * 0.62, ww + 0.6, 3, 1).rotateX(Math.PI / 2).scale(1, 0.55, 1), MY(q.x, y + hh + d * 0.15, q.z, q.rot)]);
    houses.push({ x: q.x, z: q.z, y, w: ww, h: hh, rot: q.rot, al: al + ww / 2 });
    EXCL.push([q.x, q.z, Math.max(d, ww) * 0.7]);
    al += ww + R(0, 0.3);
  }
  G[k].add(new THREE.Mesh(bake(walls), texMat(wall, { vertexColors: true })));
  G[k].add(new THREE.Mesh(bake(roofs), flat ? texMat('concrete') : texMat(roof, { color: 0xc8a090 })));
  return houses;
}
// instanced copies of a small code-built geometry (flowers, posts, fronds...)
function instances(k, geo, mat, items, { extra = false } = {}) {
  if (!items.length) return null;
  const im = new THREE.InstancedMesh(geo, mat, items.length);
  items.forEach((it, i) => im.setMatrixAt(i, _m4.compose(_v3.set(it.x, it.y ?? Math.max(gy(it.x, it.z), 0), it.z), _q.setFromAxisAngle(UP, it.ry ?? 0), _s3.set(it.sx ?? it.s, it.sy ?? it.s, it.sz ?? it.s))));
  if (items[0].c !== undefined) items.forEach((it, i) => im.setColorAt(i, new THREE.Color(it.c)));
  im.computeBoundingSphere(); SG[k].add(im); if (extra) EXTRAS.push(im);
  return im;
}
// points on land between lat/along bounds, keeping those whose ground passes test(y)
function onLand(k, n, l0, l1, a0, a1, test = (y) => y > 0.6, tries = 6) {
  const out = [];
  for (let t = 0; t < n * tries && out.length < n; t++) { const q = at(k, R(l0, l1), R(a0, a1)), y = gy(q.x, q.z); if (test(y)) out.push({ x: q.x, z: q.z, y }); }
  return out;
}
// geometry for a fan of leaves from the ground (dừa nước) and a dragon-fruit post
const FROND = (() => { const p = []; for (let i = 0; i < 9; i++) p.push([new THREE.ConeGeometry(0.22, 4.2, 3).translate(0, 2.1, 0).rotateZ(-0.35 - R(0, 0.5)).rotateY((i / 9) * Math.PI * 2 + R(-0.2, 0.2)), null]); return bake(p); })();
const PITAYA = (() => { const p = [[new THREE.BoxGeometry(0.22, 1.8, 0.22).translate(0, 0.9, 0), null]]; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; p.push([new THREE.CylinderGeometry(0.09, 0.12, 1.3, 4).translate(0, 0.65, 0).rotateZ(1.9).rotateY(a).translate(0, 1.85, 0), null]); } return p; })();
const PITAYA_POST = bake([PITAYA[0]]), PITAYA_ARMS = bake(PITAYA.slice(1));
// waterfall: a sheet with falling streaks and a mist of glow points at its foot
const FALL_MAT = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]),
  vertexShader: `varying vec2 vUv;
    #include <fog_pars_vertex>
    void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `uniform float uTime; varying vec2 vUv;
    #include <fog_pars_fragment>
    float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), u.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), u.x), u.y); }
    void main(){
      float s = n2(vec2(vUv.x * 26.0, vUv.y * 3.0 + uTime * 2.6)) * 0.6 + n2(vec2(vUv.x * 60.0, vUv.y * 7.0 + uTime * 4.0)) * 0.4;
      float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
      float a = edge * (0.35 + 0.65 * smoothstep(0.35, 0.8, s)) * (0.75 + 0.25 * vUv.y);
      gl_FragColor = vec4(mix(vec3(0.62, 0.72, 0.76), vec3(0.95, 0.98, 1.0), s), a * 0.85);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
FALL_MAT.uniforms.uTime = SH.uTime;

function terraces(k, x, z, g0, rot, n, r0, dr, h) {
  EXCL.push([x, z, r0 + 6]);
  const A = [], B = [], W = [];
  for (let i = 0; i < n; i++) {
    const r = r0 - i * dr, extra = i === 0 ? 6 : 0;
    (i % 2 ? A : B).push([new THREE.CylinderGeometry(r, r + 0.6, h + extra, LOW ? 24 : 40, 1).scale(1, 1, 0.7), MY(x, g0 + i * h + 0.2 - extra / 2, z, rot)]);
    W.push([new THREE.TorusGeometry(r - 0.45, 0.1, 3, LOW ? 24 : 48).rotateX(Math.PI / 2).scale(1, 1, 0.7), MY(x, g0 + i * h + 0.2 + h / 2, z, rot)]);
  }
  // grass texture with UVs in world units (side: around and up; caps: across)
  const uvCyl = (g, r) => { const uv = g.attributes.uv, done = new Set(); for (const gr of g.groups) for (let i = gr.start; i < gr.start + gr.count; i++) { const v = g.index.getX(i); if (done.has(v)) continue; done.add(v); if (gr.materialIndex === 0) uv.setXY(v, (uv.getX(v) * 2 * Math.PI * r) / 5, (uv.getY(v) * h) / 5); else uv.setXY(v, ((uv.getX(v) - 0.5) * 2 * r) / 5, ((uv.getY(v) - 0.5) * 2 * r) / 5); } return g; };
  for (const L of [A, B]) L.forEach((e, j) => uvCyl(e[0], r0 - (L === A ? 2 * j + 1 : 2 * j) * dr));
  G[k].add(new THREE.Mesh(bake(A), texMat('grass', { color: 0xa8c070 })));
  G[k].add(new THREE.Mesh(bake(B), texMat('grass', { color: 0x90a860 })));
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
  { // 389 stone steps: one flight per terrace, climbing the side of the hill that faces the approaching camera
    const steps = [], dir = new THREE.Vector2(0.45, 1).normalize(), ell = (r) => r / Math.hypot(dir.x, dir.y / 0.7);
    for (let i = 0; i < 9; i++) {
      const rIn = ell(26 - (i + 1) * 2.6), rOut = ell(26 - i * 2.6), y = g0 + i * 1.6 + 0.2 + 0.8;
      for (let j = 0; j < 4; j++) { const r = rOut - ((rOut - rIn) * (j + 0.5)) / 4, yy = y + (1.6 * (j + 1)) / 4; steps.push([tiledBox(0.9, 0.5, 2.6, 2), MY(p.x, yy - 0.25, p.z, p.rot).multiply(new THREE.Matrix4().makeRotationY(Math.atan2(dir.x, dir.y))).multiply(new THREE.Matrix4().makeTranslation(0, 0, r))]); }
    }
    G[k].add(new THREE.Mesh(bake(steps), texMat('stone-wall', { color: 0xc8c2b4 })));
  }
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
    const g = mergeVertices(new THREE.IcosahedronGeometry(1, LOW ? 2 : 3).deleteAttribute('normal').deleteAttribute('uv')), p = g.attributes.position, sd = rand() * 10;
    for (let i = 0; i < p.count; i++) {
      _v3.fromBufferAttribute(p, i);
      // lumpy outline, vertical fluting from rain, a notch at the waterline
      const ang = Math.atan2(_v3.z, _v3.x), flute = 0.07 * Math.sin(ang * 9 + _v3.y * 3 + sd) + 0.04 * Math.sin(ang * 17 - _v3.y * 5);
      const n = 1 + (vnoise(_v3.x * 2 + sd, _v3.y * 2 + _v3.z * 2) - 0.5) * 0.5 + (vnoise(_v3.x * 5 - sd, _v3.y * 5 + _v3.z * 5) - 0.5) * 0.16 + flute;
      const notch = 1 - 0.18 * Math.exp(-(((_v3.y + 0.62) / 0.12) ** 2));
      _v3.x *= n * notch; _v3.z *= n * notch; _v3.y *= n; if (_v3.y < 0) _v3.y *= 0.4; p.setXYZ(i, _v3.x, _v3.y, _v3.z);
    }
    g.computeVertexNormals(); return g;
  });
  const rockMat = natureMaterial({ color: 0x2a4a2c, rock: 0x5c5f58 });
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
    for (const px of [-26, -14, 14, 26]) deck.push([new THREE.CylinderGeometry(1, 1.2, 16.6, 10), MY(px, 5.3, 2.2)], [new THREE.CylinderGeometry(1, 1.2, 16.6, 10), MY(px, 5.3, -2.2)]); // no piers near the flight line
    g.add(new THREE.Mesh(bake(deck), M({ color: 0x6a716e, roughness: 0.8 })));
    const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(v3(-L / 2 - 2 + t * (L + 4), 17 + 2.6 * Math.sin(t * Math.PI * 4.5 + 0.4), 0)); }
    const dm = M({ color: 0xd9a23a, emissive: 0x9a5a10, emissiveIntensity: 1.1, metalness: 0.4, roughness: 0.4 });
    const head = new THREE.ConeGeometry(1.3, 3.4, 6).rotateZ(-Math.PI / 2);
    const last = pts[pts.length - 1];
    g.add(new THREE.Mesh(bake([[new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), LOW ? 120 : 200, 0.62, LOW ? 6 : 8), null], [head, MY(last.x + 1.6, last.y + 0.4, 0)]]), dm));
    ANIM.push({ k, fn: (t) => { dm.emissiveIntensity = (0.9 + 0.35 * Math.sin(t * 1.3)) * lerp(0.3, 1, SH.uLamp.value); } });
    const rail = []; for (let i = 0; i <= 16; i++) for (const sd of [-1, 1]) { const q = at(k, -L / 2 + (i * L) / 16, 36); rail.push({ x: q.x + TX[q.i] * sd * 3, y: 14.8, z: q.z + TZ[q.i] * sd * 3, c: 0xfff1d6, s: 0.12, tw: 0.1 }); }
    field(k, rail, { reflect: false });
  }
  // Hội An: yellow shophouses, lantern strings along the bank, floating flower lanterns
  {
    // shophouses: the Meshy houses (nha-hoi-an-1/2) when they exist, else textured stand-ins in Hội An yellows
    const walls = [], roofs = [], lan = [], hm = [pick('nha-hoi-an-1'), pick('nha-hoi-an-2')], meshy = [[], []];
    const yellows = [0xe3bf5a, 0xd9a842, 0xe8c66e, 0xcfa04a];
    for (let i = 0; i < nq(11, 7); i++) {
      const al = 64 + i * 7.4, q = at(k, 28 + R(-1, 1), al), yy = gy(q.x, q.z), w = R(5.2, 6.6), h = R(3.6, 5.2), d = 6;
      const v = i % 2, slot = hm[v] ?? hm[1 - v];
      if (slot) meshy[hm[v] ? v : 1 - v].push({ x: q.x, z: q.z, y: yy, s: v ? 9 : 7.5, ry: q.rot + Math.PI / 2 });
      else {
        walls.push([tint(tiledBox(d, h, w, 3.5), yellows[i % yellows.length]), MY(q.x, yy + h / 2, q.z, q.rot)]);
        roofs.push([new THREE.BoxGeometry(d * 0.75, d * 0.75, w + 0.7).rotateZ(Math.PI / 4).scale(1, 0.62, 1), MY(q.x, yy + h, q.z, q.rot)]);
      }
      EXCL.push([q.x, q.z, 5]);
      const f = at(k, 28 - d / 2 - 0.6, al); lan.push({ x: f.x, y: yy + 3, z: f.z, c: i % 2 ? 0xff5a2e : 0xffb347, s: 0.3, tw: 0.2 });
    }
    if (walls.length) {
      G[k].add(new THREE.Mesh(bake(walls), texMat('plaster-old', { vertexColors: true, emissive: 0x1a1004 })));
      G[k].add(new THREE.Mesh(bake(roofs), texMat('roof-moss', { color: 0xb08878, flatShading: true })));
    }
    meshy.forEach((items, v) => scatter(k, hm[v], items));
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
  const ig = mergeVertices(new THREE.IcosahedronGeometry(1, LOW ? 2 : 3).deleteAttribute('normal').deleteAttribute('uv')), mats = [];
  { const p = ig.attributes.position; for (let i = 0; i < p.count; i++) { _v3.fromBufferAttribute(p, i); const n = 1 + (vnoise(_v3.x * 2.3 + 5, _v3.z * 2.3 + _v3.y) - 0.5) * 0.45; p.setXYZ(i, _v3.x * n, _v3.y * n, _v3.z * n); } ig.computeVertexNormals(); }
  for (let t = 0; t < 40 && mats.length < nq(8, 5); t++) {
    const q = at(k, -R(80, 240), R(-60, 220)); if (gy(q.x, q.z) > -3) continue;
    const r = R(22, 46); mats.push(new THREE.Matrix4().compose(v3(q.x, -2, q.z), _q.identity(), v3(r, R(10, 28), r * 0.8)));
  }
  const isl = new THREE.InstancedMesh(ig, natureMaterial({ color: 0x1f3a26, rock: 0x3d403a }), mats.length); mats.forEach((m, i) => isl.setMatrixAt(i, m)); G[k].add(isl);
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
  { const uv = dg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (220 / 9), uv.getY(i) * (160 / 9)); }
  const dunes = new THREE.Mesh(dg, texMat('sand-red', { color: 0xf2d2b0, roughness: 1 })); dunes.position.set(d.x, 1, d.z); dunes.rotation.y = d.rot; G[k].add(dunes);
  { const d2 = at(k, 120, 120), wd = new THREE.Mesh(dg, texMat('sand-white', { color: 0xfff6ea, roughness: 1 })); wd.position.set(d2.x, 1, d2.z); wd.rotation.y = d2.rot + 0.7; wd.scale.set(0.8, 1.3, 0.7); G[k].add(wd); } // the white dunes of Mũi Né
  for (let i = 0; i < nq(6, 3); i++) place(k, 'thuyen-thung', 2.4, at(k, -R(56, 82), R(-30, 40)), -0.15, R(0, 6), { bob: 0.07 });
  field(k, [{ x: p.x, y: y + 0.8, z: p.z, c: 0xffc46b, s: 0.3, tw: 0.2 }], { reflect: false });
}
// 09 Sài Gòn: Bến Thành market, skyline with Landmark 81 and Bitexco, riverside lights
{
  const k = 8, p = at(k, 38, 2), y = pedestal(k, p.x, p.z, 16, 1.4, 0x202a28);
  HERO[k] = v3(p.x, y + 7, p.z); HERO_ALONG[k] = 2;
  place(k, 'cho-ben-thanh', 22, p, y, -0.4);
  { const d1 = at(k, 62, 34), d2 = at(k, 46, 56); place(k, pick('nha-tho-duc-ba') ? 'nha-tho-duc-ba' : 'nha-tho-duc-ba-sf', 26, d1, gy(d1.x, d1.z), -0.3 + Math.PI / 2); place(k, 'buu-dien-thanh-pho', 22, d2, gy(d2.x, d2.z), -0.3); }
  const parts = [], reserved = [[38, 2, 22], [62, 34, 12], [46, 56, 14], [98, 78, 10], [66, 54, 9]];
  for (let n = 0, t = 0; n < nq(34, 18) && t < 500; t++) {
    const west = rand() < 0.75, lat = west ? R(58, 160) : -R(26, 70), al = R(-30, 130);
    if (reserved.some(([l, a, r]) => Math.hypot(lat - l, al - a) < r + 8)) continue;
    const q = at(k, lat, al), g = gy(q.x, q.z); if (g < 0.5) continue;
    const w = R(6, 13), h = R(14, west ? 56 : 32), dd = R(6, 12);
    parts.push([scaleUV(new THREE.BoxGeometry(w, h, dd), w, h, dd), MY(q.x, g + h / 2, q.z, q.rot + R(-0.2, 0.2))]); n++;
  }
  const lm = at(k, 98, 78), lg = Math.max(gy(lm.x, lm.z), 0), l81 = AVAILABLE.has('landmark-81');
  if (l81) scatter(k, 'landmark-81', [{ x: lm.x, z: lm.z, y: lg, s: 128, ry: lm.rot }], { far: true, keep: true });
  else for (const [ox, oz, h] of [[0, 0, 120], [5, 0, 104], [-5, 0, 98], [0, 5, 90], [0, -5, 84], [5, 5, 72], [-5, -5, 66], [5, -5, 58], [-5, 5, 50]]) parts.push([scaleUV(new THREE.BoxGeometry(5, h, 5), 5, h, 5), MY(lm.x + ox, lg + h / 2, lm.z + oz)]);
  const bx = at(k, 66, 54), bg = Math.max(gy(bx.x, bx.z), 0);
  parts.push([new THREE.CylinderGeometry(3.2, 7, 84, 20), MY(bx.x, bg + 42, bx.z)]);
  G[k].add(new THREE.Mesh(bake(parts), WINDOW_MAT));
  if (!l81) { const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 14, 6), new THREE.MeshBasicMaterial({ color: 0xffe6b8 })); spire.position.set(lm.x, lg + 127, lm.z); G[k].add(spire); }
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

// ---------------------------------------------------------------- scenery around the stops (helpers are above the stops)

// 01 Lũng Cú: cliffs on the far hills, bamboo, boulders, pink buckwheat on the slopes, a hamlet of earth-walled houses
{
  const k = 0;
  scatter(k, 'vach-da-1', around(k, nq(5, 3), 70, 130, -60, 70, 46), { dy: -0.25, excl: 0.4, far: true });
  scatter(k, 'vach-da-2', around(k, nq(5, 3), -130, -70, -60, 70, 46), { dy: -0.25, excl: 0.4, far: true });
  scatter(k, 'suon-nui', around(k, 3, 90, 150, -120, -40, 70), { dy: -0.3, far: true });
  scatter(k, 'tre', onLand(k, nq(14, 6), 40, 85, -70, 20, (y) => y > 2 && y < 25).map((p) => ({ ...p, s: R(7, 10), ry: R(0, 6) })), { excl: 0.3 });
  scatter(k, 'tang-da', onLand(k, nq(16, 8), -90, 90, -80, 60, (y) => y > 1).map((p) => ({ ...p, s: R(1.5, 4), ry: R(0, 6) })));
  const pink = [0xff8cc6, 0xf06ab0, 0xffb3d9, 0xffffff];
  instances(k, new THREE.IcosahedronGeometry(0.3, 0), M({ color: 0xffffff, roughness: 1 }), onLand(k, nq(1800, 600), 26, 110, -90, 50, (y) => y > 2 && y < 30).map((p, i) => ({ ...p, y: p.y + 0.25, s: R(0.8, 1.6), c: pink[i % 4] })), { extra: true });
  const lolo = [];
  for (const [l, al] of [[56, -36], [64, -28], [61, -44], [72, -34], [52, -52]]) { const q = at(k, l, al); lolo.push({ q, y: Math.max(gy(q.x, q.z), 0.5) }); }
  G[k].add(new THREE.Mesh(bake(lolo.map(({ q, y }) => [tiledBox(6, 3.4, 5, 3), MY(q.x, y + 1.7, q.z, q.rot + 0.3)])), texMat('earth-wall', { color: 0xd8b48a })));
  G[k].add(new THREE.Mesh(bake(lolo.map(({ q, y }) => [new THREE.CylinderGeometry(0.01, 4.2, 6.6, 3, 1).rotateX(Math.PI / 2).rotateY(Math.PI / 2).scale(1, 0.5, 1), MY(q.x, y + 3.4 + 0.8, q.z, q.rot + 0.3)])), texMat('roof-tile', { color: 0x9a8a80 })));
  for (const { q } of lolo) EXCL.push([q.x, q.z, 7]);
}
// 02 Hà Nội: lakeside road with motorbikes, banyans around the lake, street lamps, One Pillar Pagoda and Khuê Văn Các near Ba Đình,
// old-quarter tube houses with power lines north of the lake
{
  const k = 1;
  const rd = road(k, 21, -80, 70, 6, 'asphalt'); road(k, 25.5, -80, 70, 3, 'pavers');
  traffic(k, rd, [{ slug: 'xe-may-cub', n: nq(16, 6), s: 1.9 }, { slug: 'xe-ga-vino', n: nq(10, 4), s: 1.8 }, { slug: 'xe-may-rx', n: nq(8, 3), s: 1.9 }, { slug: 'o-to', n: nq(4, 2), s: 4.4, speed: 7 }, { slug: 'xe-khach', n: 1, s: 9, speed: 5 }]);
  scatter(k, 'den-duong', along(k, nq(12, 6), 24.6, -76, 66, 4.2));
  scatter(k, pick('xich-lo'), along(k, 3, 24.9, -60, 30, 2.6, { gap: 8 }).map((p) => ({ ...p, ry: p.ry + Math.PI / 2 })), { long: true }); // Meshy slot
  scatter(k, 'cay-da', [...along(k, nq(6, 3), -26, -66, 22, 14, { jit: 3, gap: 4 }), ...along(k, 3, 27.5, -40, 40, 13, { gap: 6 })].map((p) => ({ ...p, ry: R(0, 6) })), { excl: 0.45 });
  { const q = at(k, 52, 46); scatter(k, 'chua-mot-cot', [{ x: q.x, z: q.z, s: 15, ry: q.rot + Math.PI / 2 }], { excl: 0.5 }); }
  { const q = at(k, 78, -40); scatter(k, 'khue-van-cac', [{ x: q.x, z: q.z, s: 18, ry: q.rot + Math.PI / 2 }], { excl: 0.5 }); }
  const oq = pick('nha-ong-ha-noi');
  if (oq) scatter(k, oq, along(k, nq(9, 5), -33, 28, 82, 8, { face: Math.PI / 2 }), { excl: 0.5 });
  else houseRow(k, -33, 28, 82, { w: [3.6, 5], h: [6, 10], d: 9, tints: [0xe8d6a8, 0xd9c49a, 0xc9d6c0, 0xe6c6a0, 0xd8c8b8] });
  road(k, -26.5, 26, 84, 4, 'asphalt');
  powerLine(k, -28.8, 28, 82, 11);
  scatter(k, 'xe-may-cub', along(k, nq(10, 4), -28.4, 30, 80, 1.9, { jit: 0.4, ry: 0 }).map((p) => ({ ...p, ry: R(0, 6) })), { long: true });
}
// 03 Hạ Long: more junks under sail, buoys and kayaks among the karsts, a floating fishing village
{
  const k = 2;
  scatter(k, 'tau-buom-2', [[-60, 70, 16], [-120, 140, 18], [-150, 10, 15]].map(([l, al, s]) => { const q = at(k, l, al); return { x: q.x, z: q.z, y: -0.3, s, ry: R(0, 6) }; }), { long: true });
  scatter(k, 'phao', around(k, nq(18, 8), -70, -14, 20, 120, 1.4).map((p) => ({ ...p, y: -0.35 })));
  scatter(k, 'kayak', around(k, nq(6, 3), -60, -16, -30, 60, 3.2).map((p) => ({ ...p, y: -0.05 })), { long: true });
  scatter(k, 'thuyen-viet', around(k, nq(5, 3), -90, -20, 40, 130, 5.5).map((p) => ({ ...p, y: -0.25 })), { long: true });
  const nb = pick('nha-be');
  const rafts = [[-62, 62], [-70, 74], [-58, 80], [-74, 88], [-64, 94], [-80, 66]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, ry: q.rot + R(-0.3, 0.3) }; });
  if (nb) scatter(k, nb, rafts.map((r) => ({ ...r, y: -0.2, s: 9 })));
  else {
    G[k].add(new THREE.Mesh(bake(rafts.map((r) => [tiledBox(9, 0.5, 7, 3), MY(r.x, 0.1, r.z, r.ry)])), texMat('planks')));
    G[k].add(new THREE.Mesh(bake(rafts.map((r) => [tiledBox(4.5, 2.6, 4, 2), MY(r.x + 0.8, 1.6, r.z, r.ry)])), texMat('painted-wood')));
    G[k].add(new THREE.Mesh(bake(rafts.map((r) => [tiledBox(5.4, 0.18, 5, 2).rotateX(0.18), MY(r.x + 0.8, 3.1, r.z, r.ry)])), texMat('tin')));
    field(k, rafts.map((r) => ({ x: r.x, y: 2.4, z: r.z, c: 0xffc46b, s: 0.22, tw: 0.2 })), { reflect: true });
  }
}
// 04 Huế: dragon boats and sampans on the Perfume River, lotus in the shallows, the pagoda gate, the citadel on the far bank
{
  const k = 3;
  scatter(k, pick('thuyen-rong', 'thuyen-duoi-dai'), [[-6, -30], [5, 14]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, y: -0.2, s: 8, ry: q.rot + R(-0.2, 0.2) }; }), { long: true });
  scatter(k, 'thuyen-viet', [[8, -50], [-9, 70], [7, 90]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, y: -0.2, s: 5, ry: q.rot + R(-0.5, 0.5) }; }), { long: true });
  scatter(k, 'sen', around(k, nq(10, 5), 11, 14, -70, -20, 5).map((p) => ({ ...p, y: 0.02 })));
  { const q = at(k, 19, -4), y = Math.max(gy(q.x, q.z), 0.4); scatter(k, pick('cong-tam-quan', 'den-chua'), [{ x: q.x, z: q.z, y, s: 10, ry: q.rot + Math.PI / 2 }], { excl: 0.5 }); }
  const nm = pick('ngo-mon'), c = at(k, -52, 24), cy = Math.max(gy(c.x, c.z), 0.5);
  if (nm) scatter(k, nm, [{ x: c.x, z: c.z, y: cy, s: 34, ry: c.rot - Math.PI / 2 }], { excl: 0.5 });
  else {
    const wall = [], dark = [], roof = [], wood = [];
    for (const s of [-1, 1]) wall.push([tiledBox(10, 6, 26, 4), MY(c.x, cy + 3, c.z, c.rot).multiply(new THREE.Matrix4().makeTranslation(0, 0, s * 25))]);
    wall.push([tiledBox(12, 8, 26, 4), MY(c.x, cy + 4, c.z, c.rot)]);
    for (const o of [-7, 0, 7]) dark.push([new THREE.BoxGeometry(12.2, o ? 3.6 : 4.6, 3), MY(c.x, cy + (o ? 1.8 : 2.3), c.z, c.rot).multiply(new THREE.Matrix4().makeTranslation(0, 0, o))]);
    for (const [y0, w0] of [[8, 1], [12.4, 0.72]]) {
      roof.push([new THREE.CylinderGeometry(0.01, 6.5 * w0, 24 * w0, 4, 1).rotateY(Math.PI / 4).scale(1, 0.4, 1.9), MY(c.x, cy + y0 + 2.6, c.z, c.rot)]);
      for (const z of [-9, -3, 3, 9]) for (const x of [-3, 3]) wood.push([new THREE.CylinderGeometry(0.22, 0.22, 3, 6), MY(c.x, cy + y0 + 1.5, c.z, c.rot).multiply(new THREE.Matrix4().makeTranslation(x * w0, 0, z * w0))]);
    }
    G[k].add(new THREE.Mesh(bake(wall), texMat('stone-wall', { color: 0xb9b3a6 })));
    G[k].add(new THREE.Mesh(bake(dark), M({ color: 0x0f0d0b })));
    G[k].add(new THREE.Mesh(bake(roof), M({ color: 0xc8a22c, emissive: 0x2a1c02, roughness: 0.5 })));
    G[k].add(new THREE.Mesh(bake(wood), M({ color: 0x7a2a1a })));
    EXCL.push([c.x, c.z, 34]);
  }
}
// 05 Đà Nẵng: high-rises along the Hàn river with a busy riverside road, cable cars up to the Golden Bridge; Hội An: market props
{
  const k = 4;
  const rd = road(k, -20.5, 0, 60, 6, 'asphalt'); road(k, -24.8, 0, 60, 2.6, 'pavers');
  traffic(k, rd, [{ slug: 'xe-may-cub', n: nq(12, 5), s: 1.9 }, { slug: 'xe-ga-vino', n: nq(10, 4), s: 1.8 }, { slug: 'xe-vespa', n: nq(5, 2), s: 1.8 }, { slug: 'o-to', n: nq(5, 2), s: 4.4, speed: 7 }]);
  scatter(k, 'den-duong', along(k, nq(7, 4), -23.6, 2, 58, 4.2));
  scatter(k, 'toa-van-phong', [[-29, 12, 44], [-30, 44, 50], [-28, 28, 36], [-30, 58, 40]].map(([l, al, s]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s, ry: q.rot + R(-0.2, 0.2) }; }), { excl: 0.4, far: true });
  { const parts = []; for (const [l, al, w, h] of [[-29, 2, 9, 30], [-30, 22, 8, 24], [-29, 36, 10, 34], [-30, 50, 8, 22]]) { const q = at(k, l, al), g = Math.max(gy(q.x, q.z), 0.5); parts.push([scaleUV(new THREE.BoxGeometry(w, h, w), w, h, w), MY(q.x, g + h / 2, q.z, q.rot)]); EXCL.push([q.x, q.z, w]); } G[k].add(new THREE.Mesh(bake(parts), WINDOW_MAT)); }
  // cable car: cabins along a sagging line from the valley up to the Golden Bridge
  const A = at(k, 22, -46), B = at(k, 44, 4), ya = Math.max(gy(A.x, A.z), 0) + 6, yb = gy(B.x, B.z) + 18, cab = [], wv = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; wv.push(A.x + (B.x - A.x) * t, ya + (yb - ya) * t - 5 * t * (1 - t), A.z + (B.z - A.z) * t); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(wv, 3)); G[k].add(new THREE.Line(lg, WIRE_MAT));
  for (let i = 1; i < 6; i++) { const t = i / 6; cab.push({ x: A.x + (B.x - A.x) * t, y: ya + (yb - ya) * t - 5 * t * (1 - t) - 2.6, z: A.z + (B.z - A.z) * t, s: 2.6, ry: Math.atan2(B.x - A.x, B.z - A.z) }); }
  scatter(k, 'cap-treo', cab, { long: true });
  // Hội An riverside: banana and coconut behind the houses, lanterns, motorbikes parked on the brick street, sampans
  road(k, 23.8, 58, 148, 3.6, 'brick-floor');
  scatter(k, 'xe-may-cub', along(k, nq(8, 3), 24.6, 62, 140, 1.9, { gap: 3 }).map((p) => ({ ...p, ry: p.ry + Math.PI / 2 + R(-0.3, 0.3) })), { long: true });
  scatter(k, 'chuoi', onLand(k, nq(10, 5), 36, 52, 60, 146).map((p) => ({ ...p, s: R(4.5, 6), ry: R(0, 6) })));
  scatter(k, 'dua', onLand(k, nq(6, 3), 34, 50, 58, 146).map((p) => ({ ...p, s: R(9, 12), ry: R(0, 6) })));
  scatter(k, 'den-long-vn', along(k, nq(6, 3), 25.6, 66, 140, 2.2, { gap: 3 }).map((p) => ({ ...p, y: p.y + 2.2 })));
  scatter(k, 'thuyen-viet', [[-4, 70], [6, 118], [-6, 136]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, y: -0.2, s: 5.5, ry: q.rot + R(-0.4, 0.4) }; }), { long: true });
  scatter(k, 'ro', along(k, 4, 22.6, 70, 130, 1.2, { gap: 4 }));
}
// 06 Tây Nguyên: thatched stilt houses round the rông house, elephants, bananas and ferns, a waterfall on the far hills
{
  const k = 5;
  scatter(k, 'nha-mai-la', [[-50, -22], [-56, 18], [-44, 30], [-62, -4]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s: 10, ry: q.rot + R(-0.4, 0.4) }; }), { excl: 0.5 });
  scatter(k, 'voi', [[-27, 22], [-31, 26]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s: 4.2, ry: q.rot + 2 + R(-0.3, 0.3) }; }), { long: true });
  scatter(k, 'chuoi', onLand(k, nq(10, 5), -70, -30, -50, 40).map((p) => ({ ...p, s: R(4.5, 6), ry: R(0, 6) })));
  scatter(k, 'duong-xi', onLand(k, nq(14, 6), -60, -24, -50, 40).map((p) => ({ ...p, s: R(2, 3), ry: R(0, 6) })), { extra: true });
  const w = at(k, 54, 34), wy = gy(w.x, w.z);
  scatter(k, 'vach-da-2', [{ x: w.x, z: w.z, y: wy - 6, s: 34, ry: w.rot + Math.PI / 2 }], { excl: 0.5 });
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(5, 22), FALL_MAT); fall.position.set(w.x - TZ[w.i] * -6, wy + 6, w.z + TX[w.i] * -6); fall.rotation.y = w.rot + Math.PI / 2; G[k].add(fall);
  field(k, [...Array(nq(30, 14))].map(() => ({ x: w.x - TZ[w.i] * -9 + R(-3, 3), y: wy - 4 + R(0, 3), z: w.z + TX[w.i] * -9 + R(-3, 3), c: 0xcfe6ff, s: 0.5, halo: 6, tw: 0.6, bob: 0.3 })), { bodies: false, reflect: false });
}
// 07 Nha Trang: parasols and loungers on the beach, coconut palms on the promenade, hotels, squid boats at sea, sea cliffs
{
  const k = 6;
  road(k, 21.5, -80, 70, 5, 'asphalt');
  scatter(k, 'dua', along(k, nq(12, 6), 18.4, -76, 66, 11, { gap: 2 }).map((p) => ({ ...p, ry: R(0, 6) })));
  scatter(k, 'du-bien', around(k, nq(10, 5), -24, -19, -60, 50, 3.2).map((p) => ({ ...p, y: Math.max(gy(p.x, p.z), 0.4) })));
  scatter(k, 'ghe-bien', around(k, nq(10, 5), -24, -19, -60, 50, 2).map((p) => ({ ...p, y: Math.max(gy(p.x, p.z), 0.4) })));
  scatter(k, 'toa-van-phong', [[68, -40, 28], [74, -20, 32], [70, 50, 30], [78, 66, 26]].map(([l, al, s]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s, ry: q.rot + R(-0.3, 0.3) }; }), { excl: 0.4 });
  scatter(k, pick('thuyen-cau-muc', 'thuyen-ca'), around(k, nq(8, 4), -170, -50, -40, 160, 9).map((p) => ({ ...p, y: -0.4 })), { long: true });
  scatter(k, 'vach-bien', around(k, 3, -60, -36, -60, 60, 30).map((p) => ({ ...p, y: -3 })), { far: true });
}
// 08 Phan Thiết: dragon-fruit fields on the hills, fishing boats, coconut palms
{
  const k = 7;
  const posts = onLand(k, nq(260, 90), 36, 100, -60, 40, (y) => y > 1 && y < 14);
  instances(k, PITAYA_POST, M({ color: 0x9c968a, roughness: 1 }), posts.map((p) => ({ ...p, s: 1 })), { extra: true });
  instances(k, PITAYA_ARMS, M({ color: 0x3f7a3a, roughness: 0.8 }), posts.map((p) => ({ ...p, s: 1, ry: R(0, 6) })), { extra: true });
  scatter(k, 'thuyen-ca', around(k, nq(6, 3), -90, -40, -30, 60, 8).map((p) => ({ ...p, y: -0.4 })), { long: true });
  scatter(k, 'dua', onLand(k, nq(10, 5), -40, -18, -60, 50).map((p) => ({ ...p, s: R(9, 12), ry: R(0, 6) })));
}
// 09 Sài Gòn: busy riverside road (motorbikes, buses, cars), street food carts and plastic stools on the pavement, power lines,
// townhouses with shutters and air conditioners, office towers, a ferry crossing the river
{
  const k = 8;
  const rd = road(k, 20, -60, 90, 7, 'asphalt'); road(k, 25, -60, 90, 3, 'pavers');
  traffic(k, rd, [{ slug: 'xe-may-cub', n: nq(24, 8), s: 1.9 }, { slug: 'xe-ga-vino', n: nq(18, 6), s: 1.8 }, { slug: 'xe-may-rx', n: nq(10, 4), s: 1.9 }, { slug: 'xe-vespa', n: nq(6, 2), s: 1.8 },
    { slug: 'o-to', n: nq(6, 3), s: 4.4, speed: 7 }, { slug: 'xe-buyt', n: 2, s: 10, speed: 5 }]);
  powerLine(k, 26.8, -58, 88, 12);
  if (!LOW) scatter(k, 'xe-day', along(k, nq(5, 2), 25.4, -50, 80, 2.4, { gap: 6 }).map((p) => ({ ...p, ry: p.ry + Math.PI / 2 })));
  const stools = []; for (const c of along(k, nq(7, 3), 25.2, -46, 84, 1, { gap: 5 })) for (let i = 0; i < 5; i++) stools.push({ x: c.x + R(-1.2, 1.2), z: c.z + R(-1.2, 1.2), s: 0.55, ry: R(0, 6) });
  scatter(k, 'ghe-do', stools); scatter(k, 'ghe-xanh', stools.slice(0, Math.floor(stools.length / 3)).map((p) => ({ ...p, x: p.x + 0.7, s: 0.6 })));
  scatter(k, 'cay-ven-bien', along(k, nq(8, 4), 27.2, -56, 86, 10, { gap: 3 }).map((p) => ({ ...p, ry: R(0, 6) })), { excl: 0.3 });
  const np = pick('nha-pho-sai-gon');
  const row = np ? null : houseRow(k, 31.5, 60, 92, { w: [4, 5.5], h: [12, 18], d: 8, flat: true, wall: 'white', tints: [0xe9e4d8, 0xd6e2e6, 0xf0dcc2, 0xdfe6d0, 0xe8d0d0] });
  if (np) scatter(k, np, along(k, 6, 31.5, 60, 92, 16, { face: Math.PI / 2 }), { excl: 0.5 });
  else {
    scatter(k, 'cua-cuon', row.map((h) => { const q = at(k, 27.4, h.al); return { x: q.x, z: q.z, s: 3.6, ry: h.rot + Math.PI / 2 }; }));
    scatter(k, 'cuc-nong', row.filter((_, i) => i % 2 === 0).map((h) => { const q = at(k, 27.3, h.al); return { x: q.x, z: q.z, y: h.y + h.h * 0.6, s: 2, ry: h.rot + Math.PI / 2 }; }));
  }
  scatter(k, 'toa-van-phong', [[120, 20, 60], [140, 60, 70], [110, -20, 48]].map(([l, al, s]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s, ry: q.rot }; }), { excl: 0.4, far: true });
  // ferry: hull, deck and cabin crossing back and forth
  const fg = new THREE.Group(); G[k].add(fg);
  fg.add(new THREE.Mesh(tiledBox(5, 1, 11, 3), texMat('painted-wood', { color: 0xd8e4e8 })));
  const cabin = new THREE.Mesh(tiledBox(3.6, 1.8, 4, 2), texMat('white')); cabin.position.set(0, 1.4, -2.5); fg.add(cabin);
  const fq = at(k, 0, 24);
  ANIM.push({ k, fn: (t) => { const l = Math.sin(t * 0.07) * 9, q = atf(k, l, 24); fg.position.set(q.x, 0.25 + Math.sin(t) * 0.05, q.z); fg.rotation.y = fq.rot + Math.PI / 2; } });
}
// 10 Miền Tây: Cần Thơ stilt houses, small sampans and longtail boats, hammocks, fruit stalls, banana and coconut,
// nipa palms on the banks, rice paddies inland
{
  const k = 9;
  scatter(k, 'nha-san-can-tho', [[24, -56], [-26, -14], [26, 50]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, y: Math.max(gy(q.x, q.z), -0.5), s: 11, ry: q.rot + (l > 0 ? Math.PI / 2 : -Math.PI / 2) }; }), { excl: 0.5 });
  scatter(k, 'nha-nho-can-tho', [[-24, 40], [28, -36]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s: 10, ry: q.rot + (l > 0 ? Math.PI / 2 : -Math.PI / 2) }; }), { excl: 0.5 });
  scatter(k, 'thuyen-viet', around(k, nq(6, 3), -10, 10, -70, 70, 5).map((p) => ({ ...p, y: -0.25, ry: p.ry })), { long: true });
  scatter(k, 'thuyen-duoi-dai', around(k, nq(3, 2), -9, 9, -60, 60, 7).map((p) => ({ ...p, y: -0.25 })), { long: true });
  scatter(k, 'vong', [[22, -50], [-23, -10], [24, 46]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s: 3, ry: q.rot }; }));
  scatter(k, 'sap-rau', [[-17, -2], [18, 22]].map(([l, al]) => { const q = at(k, l, al); return { x: q.x, z: q.z, s: 3.2, ry: q.rot }; }));
  scatter(k, 'chuoi', onLand(k, nq(16, 6), 16, 60, -80, 80).concat(onLand(k, nq(10, 4), -60, -16, -80, 80)).map((p) => ({ ...p, s: R(4.5, 6), ry: R(0, 6) })));
  scatter(k, 'dua', onLand(k, nq(10, 4), 18, 64, -80, 80).map((p) => ({ ...p, s: R(10, 13), ry: R(0, 6) })));
  instances(k, FROND, M({ color: 0x3d6b2f, roughness: 0.85 }), [...onLand(k, nq(70, 25), 14.5, 19, -90, 90, (y) => y > -1 && y < 1.5), ...onLand(k, nq(70, 25), -19, -14.5, -90, 90, (y) => y > -1 && y < 1.5)].map((p) => ({ ...p, y: Math.max(p.y, 0), s: R(0.9, 1.4), ry: R(0, 6) })));
  // rice paddies: flat fields in shades of young and ripening rice, some still flooded
  const fields = [];
  for (const side of [-1, 1]) for (let l = 70; l < 140; l += 9) for (let al = -80; al < 80; al += 12) {
    const q = at(k, side * (l + R(-1, 1)), al + R(-1, 1)), y = gy(q.x, q.z); if (y < 0.3 || y > 3) continue;
    const r = rand(); fields.push({ x: q.x, z: q.z, y: y + 0.08, sx: 8.2, sy: 1, sz: 11, ry: q.rot, c: r < 0.2 ? 0x4a6a6a : r < 0.75 ? 0x6f9a3a : 0xa8a040 });
  }
  instances(k, new THREE.BoxGeometry(1, 0.12, 1), M({ color: 0xffffff, roughness: 0.75 }), fields);
}
// 11 Mũi Cà Mau: mangroves of three kinds, a boardwalk into them, the GPS 0001 marker, fishing boats, nipa palms
{
  const k = 10;
  const mg = onLand(k, nq(60, 24), -60, 60, -80, 50, (y) => y > -0.5 && y < 2.5).filter((p) => Math.hypot(p.x - HERO[k].x, p.z - HERO[k].z) > 14);
  scatter(k, 'duoc', mg.filter((_, i) => i % 3 === 0).map((p) => ({ ...p, s: R(5, 7), ry: R(0, 6) })));
  scatter(k, 'duoc-re', mg.filter((_, i) => i % 3 === 1).map((p) => ({ ...p, s: R(4, 6), ry: R(0, 6) })));
  scatter(k, 'duoc-cao', mg.filter((_, i) => i % 3 === 2).map((p) => ({ ...p, s: R(7, 10), ry: R(0, 6) })));
  road(k, -21, -50, 6, 2.2, 'planks', { lift: 1.1, tile: 3 });
  instances(k, new THREE.CylinderGeometry(0.12, 0.12, 2.4, 5), M({ color: 0x4a3a28 }), along(k, 24, -21, -50, 6, 1).flatMap((p) => [-0.95, 0.95].map((o) => { const q = { x: p.x + Math.cos(p.ry) * o, z: p.z - Math.sin(p.ry) * o }; return { x: q.x, z: q.z, y: Math.max(gy(q.x, q.z), -1) + 0.4, s: 1 }; })));
  { const q = at(k, 24, 22), y = Math.max(gy(q.x, q.z), 0.5); G[k].add(new THREE.Mesh(bake([[tiledBox(1.6, 3.2, 1.6, 2), MY(q.x, y + 1.6, q.z, q.rot)], [tiledBox(2.6, 0.4, 2.6, 2), MY(q.x, y + 0.2, q.z, q.rot)]]), texMat('white', { color: 0xe8e2d6 }))); EXCL.push([q.x, q.z, 4]); }
  scatter(k, 'thuyen-ca', around(k, nq(5, 3), -120, -30, 40, 200, 8).map((p) => ({ ...p, y: -0.4 })), { long: true });
  instances(k, FROND, M({ color: 0x3d6b2f, roughness: 0.85 }), onLand(k, nq(60, 20), -40, 40, -90, 30, (y) => y > -1 && y < 1.2).map((p) => ({ ...p, y: Math.max(p.y, 0), s: R(0.9, 1.4), ry: R(0, 6) })));
}

// ---------------------------------------------------------------- details per stop (second pass): what each place is known for
// 02 Hà Nội: Ba Đình flagpole and the lawn squares of the square
{
  const k = 1, fp = at(k, 30, -18), fy = gy(fp.x, fp.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 24, 10), M({ color: 0xe8e8e0, roughness: 0.5 }));
  pole.position.set(fp.x, fy + 12, fp.z); G[k].add(pole); pole.updateMatrixWorld(true); addFlag(k, pole, fp.rot); EXCL.push([fp.x, fp.z, 4]);
  const lawn = [];
  for (const [a0, a1] of [[-28, -10], [18, 32]]) for (let l = 24; l <= 54; l += 6) for (let al = a0; al < a1; al += 6) { const q = at(k, l, al + 3); lawn.push({ x: q.x, z: q.z, y: gy(q.x, q.z) + 0.05, sx: 5, sy: 1, sz: 5, ry: q.rot }); }
  instances(k, new THREE.BoxGeometry(1, 0.12, 1), texMat('grass', { color: 0xb8d088 }), lawn);
}
// 04 Huế: the citadel wall along the far bank (the Ngọ Môn gate sits in it)
{
  const k = 3, wall = [];
  for (let al = -80; al <= 100; al += 9) {
    if (al > 4 && al < 44) continue;
    const q = at(k, -47 + Math.sin(al * 0.05) * 1.5, al), y = Math.max(gy(q.x, q.z), 0.4);
    wall.push([tiledBox(3.2, 4.5, 9.4, 3), MY(q.x, y + 2.25, q.z, q.rot)]);
    EXCL.push([q.x, q.z, 6]);
  }
  G[k].add(new THREE.Mesh(bake(wall), texMat('stone-wall', { color: 0xa9a294 })));
}
// 05 Hội An: Chùa Cầu stand-in until the Meshy model arrives, bougainvillea on the house fronts, lantern boats
{
  const k = 4;
  if (!AVAILABLE.has('chua-cau')) {
    const c = at(k, 23, 102), y = 1.5, R0 = MY(c.x, y, c.z, c.rot), at0 = (x, yy, z) => R0.clone().multiply(new THREE.Matrix4().makeTranslation(x, yy, z));
    const wood = [[tiledBox(11, 0.6, 3.6, 2), at0(0, 0.3, 0)], [tiledBox(11, 1.9, 0.25, 2), at0(0, 1.5, 1.7)], [tiledBox(11, 1.9, 0.25, 2), at0(0, 1.5, -1.7)]];
    for (let x = -5; x <= 5; x += 2.5) for (const z of [-1.7, 1.7]) wood.push([new THREE.CylinderGeometry(0.14, 0.14, 2.6, 6), at0(x, 1.9, z)]);
    G[k].add(new THREE.Mesh(bake(wood), texMat('painted-wood', { color: 0xc06a4a })));
    G[k].add(new THREE.Mesh(bake([[tiledBox(3.6, 2.8, 4.2, 2), at0(4.4, 1.7, 0)]]), texMat('plaster', { color: 0xe0b860 })));
    G[k].add(new THREE.Mesh(bake([[new THREE.CylinderGeometry(0.01, 3.4, 12, 3, 1).rotateZ(Math.PI / 2).rotateX(Math.PI / 2).scale(1, 0.5, 1), at0(0, 3.7, 0)], [new THREE.CylinderGeometry(0.01, 3, 4.8, 4, 1).rotateY(Math.PI / 4).scale(1, 0.55, 1.3), at0(4.4, 4.6, 0)]]), texMat('roof-moss', { color: 0xb08878, flatShading: true })));
    field(k, [-4, -1.5, 1, 3.5].map((x) => { const v = new THREE.Vector3(x, 2.6, 1.9).applyMatrix4(R0); return { x: v.x, y: v.y, z: v.z, c: 0xff5a2e, s: 0.3, tw: 0.2 }; }), { reflect: true });
    EXCL.push([c.x, c.z, 9]);
  }
  const mag = [0xd8327a, 0xe8559a, 0xc0206a, 0xf07ab0];
  instances(k, new THREE.IcosahedronGeometry(0.32, 0), M({ color: 0xffffff, roughness: 0.9 }), [...Array(nq(260, 90))].map((_, i) => { const q = at(k, 24.8 + R(-0.3, 0.3), R(62, 142)); return { x: q.x, z: q.z, y: gy(q.x, q.z) + R(2, 4.6), s: R(0.7, 1.4), c: mag[i % 4] }; }), { extra: true });
}
// 07 Nha Trang: a white sand beach on the sea side and the cable car over the sea to the island
{
  const k = 6;
  road(k, -21.5, -70, 60, 6.5, 'sand-white', { lift: 0.04, tile: 8 });
  const A = at(k, -26, 70), B = at(k, -210, 160), towers = [], line = [], cab = [];
  const ya = 4, yb = 18, pt = (t) => ({ x: A.x + (B.x - A.x) * t, z: A.z + (B.z - A.z) * t });
  for (let i = 0; i <= 5; i++) { const t = i / 5, p = pt(t), h = 26 + Math.sin(t * Math.PI) * 10; towers.push([new THREE.CylinderGeometry(0.7, 2, h, 4).rotateY(Math.PI / 4), MY(p.x, -2 + h / 2, p.z)]); }
  G[k].add(new THREE.Mesh(bake(towers), M({ color: 0xe6e2da, roughness: 0.6 })));
  for (let i = 0; i < 40; i++) { const t0 = i / 40, t1 = (i + 1) / 40, a = pt(t0), b = pt(t1), h0 = 22 + Math.sin(t0 * Math.PI) * 10 + ya * (1 - t0) + yb * t0 - 18, h1 = 22 + Math.sin(t1 * Math.PI) * 10 + ya * (1 - t1) + yb * t1 - 18; line.push(a.x, h0, a.z, b.x, h1, b.z); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(line, 3)); G[k].add(new THREE.LineSegments(lg, WIRE_MAT));
  for (let i = 1; i < 10; i++) { const t = i / 10, p = pt(t); cab.push({ x: p.x, z: p.z, y: 22 + Math.sin(t * Math.PI) * 10 + ya * (1 - t) + yb * t - 18 - 2.6, s: 2.6, ry: Math.atan2(B.x - A.x, B.z - A.z) }); }
  scatter(k, 'cap-treo', cab, { long: true, far: true, keep: true });
  field(k, towers.map((t) => { const v = new THREE.Vector3().setFromMatrixPosition(t[1]); return { x: v.x, y: v.y * 2 + 2, z: v.z, c: 0xff4040, s: 0.4, tw: 1 }; }), { bodies: false, reflect: false });
}
// 08 Phan Thiết: red dragon fruits on the posts
{
  const k = 7, posts = onLand(k, nq(70, 25), 36, 100, -60, 40, (y) => y > 1 && y < 14);
  instances(k, new THREE.IcosahedronGeometry(0.22, 0), M({ color: 0xd8205a, roughness: 0.6 }), posts.flatMap((p) => [0, 1, 2].map(() => ({ x: p.x + R(-0.9, 0.9), z: p.z + R(-0.9, 0.9), y: p.y + R(1.4, 2), s: R(0.8, 1.2) }))), { extra: true });
}
// 09 Sài Gòn: Ba Son cable-stayed bridge across the river (the camera flies under the deck, the single pylon stands
// on the Thủ Thiêm side beyond the road), Bưu điện stand-in
{
  const k = 8, al = -36, c = at(k, -6, al), deckY = 24, dk = [], cables = [];
  dk.push([tiledBox(96, 1.2, 8, 4), MY(c.x, deckY, c.z, c.rot)]);
  const py = at(k, 40, al), pyTop = 72;
  dk.push([new THREE.CylinderGeometry(0.9, 1.8, pyTop, 6), MY(py.x, pyTop / 2, py.z, py.rot)]);
  for (const [l0, l1] of [[-54, -42], [36, 44]]) { const q = at(k, (l0 + l1) / 2, al); dk.push([tiledBox(8, deckY, 6, 4), MY(q.x, deckY / 2, q.z, q.rot)]); EXCL.push([q.x, q.z, 7]); }
  G[k].add(new THREE.Mesh(bake(dk), texMat('white', { color: 0xdcdcd6 })));
  for (let l = -50; l <= 36; l += 4.5) { for (const s of [-1, 1]) { const q = atf(k, l, al + s * 3.5); cables.push(py.x, pyTop - 4, py.z, q.x, deckY + 0.6, q.z); } }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cables, 3)); G[k].add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0xcfd6d8 })));
  field(k, [...Array(12)].map((_, i) => { const q = at(k, -50 + i * 8.5, al); return { x: q.x, y: deckY + 1.6, z: q.z, c: 0xfff1d6, s: 0.2, tw: 0.1 }; }).concat([{ x: py.x, y: pyTop + 0.5, z: py.z, c: 0xff4040, s: 0.5, tw: 1 }]), { reflect: false });
  if (!AVAILABLE.has('buu-dien-thanh-pho')) {
    const d = at(k, 46, 56), y = Math.max(gy(d.x, d.z), 0.5), R0 = MY(d.x, y, d.z, d.rot - 0.3 + Math.PI / 2), o = (x, yy, z) => R0.clone().multiply(new THREE.Matrix4().makeTranslation(x, yy, z));
    G[k].add(new THREE.Mesh(bake([[tiledBox(24, 9, 9, 3), o(0, 4.5, 0)], [tiledBox(7, 12, 9.4, 3), o(0, 6, 0)]]), texMat('plaster', { color: 0xf0c060 })));
    const win = []; for (let x = -10; x <= 10; x += 2.6) { if (Math.abs(x) < 4) continue; win.push([new THREE.BoxGeometry(1.2, 3.4, 0.3), o(x, 4.4, -4.5)]); }
    win.push([new THREE.BoxGeometry(3, 5.5, 0.3), o(0, 3.4, -4.75)]);
    G[k].add(new THREE.Mesh(bake(win), M({ color: 0x1a2a2c, emissive: 0xffc070, emissiveIntensity: 0.25 })));
    G[k].add(new THREE.Mesh(bake([[tiledBox(24.6, 0.8, 9.6, 3), o(0, 9.4, 0)], [new THREE.CylinderGeometry(0.01, 5, 4, 4, 1).rotateY(Math.PI / 4).scale(1, 0.6, 1.4), o(0, 13.2, 0)]]), M({ color: 0x3a3e40 })));
    const clock = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), new THREE.MeshBasicMaterial({ color: 0xfff6e0 })); clock.applyMatrix4(o(0, 10.4, -4.76).multiply(new THREE.Matrix4().makeRotationY(Math.PI))); G[k].add(clock);
    EXCL.push([d.x, d.z, 14]);
  }
}
// 10 Miền Tây: cây bẹo, the tall poles on market boats hung with what each boat sells
{
  const k = 9, poles = [], fruit = [];
  const fc = [0x3f8a2a, 0xe0a020, 0xc83a1a, 0x7a3a8a, 0xe8d24a];
  [[-7, -4], [9, -24], [-9, 20], [7, 38], [-6, -44]].forEach(([l, al], i) => {
    const q = at(k, l, al); poles.push([new THREE.CylinderGeometry(0.08, 0.12, 7, 5), MY(q.x, 3.3, q.z)]);
    for (let j = 0; j < 7; j++) fruit.push({ x: q.x + R(-0.5, 0.5), z: q.z + R(-0.5, 0.5), y: 5.4 + R(0, 1.4), s: R(0.25, 0.45), c: fc[(i + j) % fc.length] });
  });
  G[k].add(new THREE.Mesh(bake(poles), M({ color: 0xb09a6a })));
  instances(k, new THREE.IcosahedronGeometry(1, 0), M({ color: 0xffffff, roughness: 0.7 }), fruit);
}
// 11 Mũi Cà Mau: Hòn Khoai island out at sea, boat lights
{
  const k = 10, q = at(k, -150, 230);
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, LOW ? 2 : 3).deleteAttribute('normal').deleteAttribute('uv')), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { _v3.fromBufferAttribute(p, i); const n = 1 + (vnoise(_v3.x * 2 + 9, _v3.z * 2 + _v3.y) - 0.5) * 0.5; p.setXYZ(i, _v3.x * n, Math.max(_v3.y * n, -0.2), _v3.z * n); }
  g.computeVertexNormals();
  const isl = new THREE.Mesh(g, natureMaterial({ color: 0x1f3a26, rock: 0x3d403a })); isl.position.set(q.x, -3, q.z); isl.scale.set(46, 26, 30); isl.rotation.y = q.rot; G[k].add(isl);
  field(k, [...Array(nq(10, 5))].map(() => { const b = at(k, -R(40, 160), R(60, 220)); return { x: b.x, y: 1.4, z: b.z, c: 0xe6fbff, s: 0.3, halo: 10, tw: 0.5 }; }), { bodies: false, reflect: true });
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
  const rc = new THREE.CatmullRomCurve3(curve.getSpacedPoints(400).filter((p, i) => i * (LTOT / 400) >= A_STOP[0] - 6 && i * (LTOT / 400) <= A_STOP[10] + 60).map((p) => p.clone().setY(1.6)));
  OV.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 600, 2.2, 6), ribbonMat));
}
const markerMat = glowMaterial(1); markerMat.uniforms.uLamp = { value: 1 }; // the overview markers stay lit by day
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
// back: how far before the landmark the camera slows down; h: height there; side: how far it slides toward the landmark's bank;
// look: how much it turns toward the landmark (kept small: the camera mostly looks straight ahead, into the screen)
const CAMCFG = [
  { back: 84, h: 22, side: 4, look: 0.26 }, { back: 64, h: 10, side: 16, look: 0.18 }, { back: 46, h: 8, side: 2, look: 0.15 }, { back: 60, h: 11, side: 14, look: 0.18 },
  { back: 70, h: 22, side: 16, look: 0.22 }, { back: 64, h: 13, side: 3, look: 0.2 }, { back: 66, h: 15, side: 16, look: 0.2 }, { back: 56, h: 9, side: 14, look: 0.18 },
  { back: 64, h: 10, side: 16, look: 0.18 }, { back: 42, h: 8, side: 2, look: 0.15 }, { back: 50, h: 8.5, side: 4, look: 0.18 },
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
let PHONE = false; // set in resize()
function stopNear(a) {
  let k = 0, bd = 1e9; for (let i = 0; i < 11; i++) { const d = a - ADW[i]; if (Math.abs(d) < Math.abs(bd)) { bd = d; k = i; } }
  const sl = bd < 0 ? 46 : 16;
  return { k, d: bd, wb: Math.exp(-(bd * bd) / 1600), wl: Math.exp(-(bd * bd) / (sl * sl)) };
}
// The camera always looks ahead down the route, so scrolling flies into the screen: each landmark appears small in the
// distance, grows, and passes close by. Near a stop the camera slides toward the landmark's bank (the panel sits on the
// other side). Height and slide are summed over all stops so nothing jumps when the nearest stop changes.
function journeyPose(a, pos, look) {
  const s = stopNear(a);
  let h = 10.5, off = 0;
  for (let k = 0; k < 11; k++) {
    const d = a - ADW[k]; if (Math.abs(d) > 200) continue;
    const w = Math.exp(-(d * d) / 1600);
    h += (CAMCFG[k].h - 10.5) * w; off -= SIDE[k] * CAMCFG[k].side * w;
  }
  pathPoint(a, pos); const i = Math.round(clamp(a / STEP, 0, N));
  pos.x += -TZ[i] * off; pos.z += TX[i] * off; pos.y = h;
  pathPoint(a + 70, look); const j = Math.round(clamp((a + 70) / STEP, 0, N));
  look.x += -TZ[j] * off; look.z += TX[j] * off; look.y = h * 0.62;
  // phones are narrow, so they turn a little more (not at the first/last stop, whose poses anchor the intro and outro)
  const c = CAMCFG[s.k];
  look.lerp(HERO[s.k], s.wl * (PHONE && s.k > 0 && s.k < 10 ? c.look + 0.25 : c.look));
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
    _T.copy(JE.look).lerp(MAP_C, easeIO(clamp((t - 0.3) / 0.7, 0, 1))); // climb first, then pan, so the camera never skims the Sài Gòn towers
    const d = Math.exp(lerp(Math.log(OE.d), Math.log(OV_DIST * (PHONE ? 2 : 1)), easeIO(t))); // phone: keep the whole map above the end panel
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

// ---------------------------------------------------------------- forest
// Thousands of EZ-Tree trees on the hills. Far trees are impostors (two crossed cards from a baked atlas, one draw call per
// terrain chunk); the nearest ones swap to the real meshes, crossfaded with a dither so the change does not pop.
const FOREST = [0.8, 0.3, 0.5, 0.65, 0.6, 0.55, 0.42, 0.12, 0.06, 0, 0]; // density at each stop (Miền Tây has palms, Cà Mau mangroves)
const PINE = [0.55, 0.04, 0, 0.05, 0.05, 0.75, 0.12, 0.1, 0, 0, 0];     // share of pines: Hà Giang, Đà Lạt and the highlands
const TREE_H = [[7, 10.5], [8, 12.5], [8.5, 13.5], [2.4, 4.2]];         // size range per kind (oak, ash, pine, bush)
const FOREST_NEAR = LOW ? 32 : 40, FOREST_CAP = LOW ? 40 : 45, FOREST_FADE = 8;
const TREES = { x: [], y: [], z: [], s: [], r: [], k: [], chunk: [] };
{
  let st = 20261026; const fr = () => { st |= 0; st = (st + 0x6d2b79f5) | 0; let t = Math.imul(st ^ (st >>> 15), 1 | st); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // sightlines from the camera at each stop to its landmark stay clear
  const lines = HERO.map((h, k) => { const c = new THREE.Vector3(), l = new THREE.Vector3(); journeyPose(ADW[k], c, l); return [c.x, c.z, h.x, h.z]; });
  const blocked = (x, z) => {
    for (const [ex, ez, r] of EXCL) if ((x - ex) ** 2 + (z - ez) ** 2 < r * r) return true;
    for (const [ax, az, bx, bz] of lines) {
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
      if (Math.hypot(x - ax - dx * t, z - az - dz * t) < 6 + 0.22 * t * Math.sqrt(L2)) return true;
    }
    return false;
  };
  const SP = LOW ? 4.4 : 3.3, CH = 8, x0 = -200, x1 = 290, z0 = 55, z1 = -1220, zLen = (60 + 1225) / CH;
  for (let z = z0; z > z1; z -= SP) for (let x = x0; x < x1; x += SP) {
    const px = x + (fr() - 0.5) * SP * 0.9, pz = z + (fr() - 0.5) * SP * 0.9, roll = fr(), kr = fr(), sr = fr(), rr = fr();
    const y = terrainHeight(px, pz), a = TH_A, lat = TH_LAT;
    if (TH_IN < 4 || y < 0.9 || Math.abs(lat) < si(CHAN, a) + 7) continue;
    if (roll > si(FOREST, a) * 1.7 * smooth(0.28, 0.62, fbm(px * 0.024 + 9, pz * 0.024))) continue; // clearings
    if (FLAT.some((f) => a > f.a0 - f.e && a < f.a1 + f.e && lat > f.l0 - f.e && lat < f.l1 + f.e)) continue;
    if (blocked(px, pz)) continue;
    const kind = kr < si(PINE, a) ? 2 : kr > 0.8 ? 3 : kr < si(PINE, a) + (1 - si(PINE, a)) * 0.4 ? 0 : 1;
    const [h0, h1] = TREE_H[kind];
    TREES.x.push(px); TREES.y.push(y - 0.15); TREES.z.push(pz); TREES.s.push(lerp(h0, h1, sr) * (y > 40 ? 0.8 : 1)); TREES.r.push(rr * Math.PI * 2); TREES.k.push(kind);
    TREES.chunk.push(clamp(Math.floor((60 - pz) / zLen), 0, CH - 1));
  }
}
const impMat = new THREE.ShaderMaterial({
  fog: true,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { tAtlas: { value: null }, uNear: { value: 0 }, uFade: { value: FOREST_FADE }, uLight: { value: new THREE.Color(0.36, 0.42, 0.46) } }]),
  vertexShader: `attribute float aKind; attribute float aView; uniform float uNear; uniform float uFade; varying vec2 vUv; varying float vFade;
    #include <fog_pars_vertex>
    void main(){
      vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      vFade = smoothstep(uNear - uFade, uNear, distance(base.xz, cameraPosition.xz));
      vUv = vec2((aKind * 2.0 + aView + uv.x) / ${TREE_KINDS.length * 2}.0, uv.y);
      vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
      gl_Position = vFade <= 0.0 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `uniform sampler2D tAtlas; uniform vec3 uLight; varying vec2 vUv; varying float vFade;
    #include <fog_pars_fragment>
    void main(){
      vec4 t = texture2D(tAtlas, vUv);
      float dith = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      if (t.a < 0.5 || dith > vFade) discard;
      gl_FragColor = vec4(t.rgb * uLight, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
impMat.uniforms.tAtlas.value = (() => { const t = loadTex('tree-impostors', { mime: 'image/png', placeholder: 'rgba(0,0,0,0)', srgb: true, repeat: false }); t.anisotropy = 1; return t; })();
const IMPOSTORS = [];
{
  // two unit cards crossing at the trunk: front view (x) and side view (seen from +x, so the image runs along -z)
  const pos = [], uv = [], view = [], idx = [];
  [[1, 0], [0, -1]].forEach(([ax, az], v) => {
    const o = pos.length / 3;
    for (const [u, y] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { pos.push((u - 0.5) * ax, y, (u - 0.5) * az); uv.push(u, y); view.push(v); }
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const card = new THREE.BufferGeometry();
  card.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); card.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  card.setAttribute('aView', new THREE.Float32BufferAttribute(view, 1)); card.setIndex(idx);
  for (let c = 0; c < 8; c++) {
    const ids = []; TREES.chunk.forEach((ch, i) => { if (ch === c) ids.push(i); });
    if (!ids.length) continue;
    const g = card.clone(), kinds = new Float32Array(ids.length);
    const im = new THREE.InstancedMesh(g, impMat, ids.length);
    ids.forEach((i, j) => { kinds[j] = TREES.k[i]; im.setMatrixAt(j, _m4.compose(_v3.set(TREES.x[i], TREES.y[i], TREES.z[i]), _q.setFromAxisAngle(_s3.set(0, 1, 0), TREES.r[i]), _s3.setScalar(TREES.s[i]))); });
    g.setAttribute('aKind', new THREE.InstancedBufferAttribute(kinds, 1));
    im.computeBoundingSphere(); im.userData.ids = ids; scene.add(im); IMPOSTORS.push(im);
  }
}
// the nearest trees as real meshes: one instanced mesh per kind and part (branches, leaves)
const NEAR_TREES = TREE_KINDS.map(() => []);
if (TREE_MESHES) TREE_KINDS.forEach((kind, k) => {
  MODEL_JOBS.push(loadModel('tree-' + kind).then((tpl) => {
    if (!tpl) return;
    tpl.updateMatrixWorld(true);
    tpl.traverse((m) => {
      if (!m.isMesh) return;
      const im = new THREE.InstancedMesh(m.geometry.clone().applyMatrix4(m.matrixWorld), m.material, FOREST_CAP);
      im.count = 0; im.frustumCulled = false; scene.add(im); NEAR_TREES[k].push(im);
    });
    forestDirty = true;
  }));
});
let forestDirty = true; const forestAt = new THREE.Vector3(1e9, 0, 0), forestCand = [];
function updateForest(show) {
  for (const im of IMPOSTORS) im.visible = show && Math.abs(im.boundingSphere.center.z - camera.position.z) < 640;
  for (const list of NEAR_TREES) for (const im of list) im.visible = show;
  if (!show || (!forestDirty && forestAt.distanceToSquared(camera.position) < 1)) return;
  forestDirty = false; forestAt.copy(camera.position);
  forestCand.length = 0;
  const cx = camera.position.x, cz = camera.position.z, R2 = FOREST_NEAR * FOREST_NEAR;
  for (const im of IMPOSTORS) {
    if (Math.abs(im.boundingSphere.center.z - cz) > im.boundingSphere.radius + FOREST_NEAR) continue;
    for (const i of im.userData.ids) { const d = (TREES.x[i] - cx) ** 2 + (TREES.z[i] - cz) ** 2; if (d < R2 && NEAR_TREES[TREES.k[i]].length) forestCand.push(d, i); }
  }
  // keep the closest FOREST_CAP; the impostors take over from the last one kept
  let pairs = []; for (let j = 0; j < forestCand.length; j += 2) pairs.push([forestCand[j], forestCand[j + 1]]);
  if (pairs.length > FOREST_CAP) { pairs.sort((p, q) => p[0] - q[0]); pairs = pairs.slice(0, FOREST_CAP); }
  impMat.uniforms.uNear.value = pairs.length < FOREST_CAP ? FOREST_NEAR : Math.sqrt(pairs[pairs.length - 1][0]);
  if (!NEAR_TREES.some((l) => l.length)) impMat.uniforms.uNear.value = 0;
  const n = NEAR_TREES.map(() => 0);
  for (const [, i] of pairs) {
    const k = TREES.k[i];
    _m4.compose(_v3.set(TREES.x[i], TREES.y[i], TREES.z[i]), _q.setFromAxisAngle(_s3.set(0, 1, 0), TREES.r[i]), _s3.setScalar(TREES.s[i]));
    for (const im of NEAR_TREES[k]) im.setMatrixAt(n[k], _m4);
    n[k]++;
  }
  NEAR_TREES.forEach((list, k) => list.forEach((im) => { im.count = n[k]; im.instanceMatrix.needsUpdate = true; }));
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

// ---------------------------------------------------------------- time of day and weather
// Real Vietnam time and real weather by default: the sun's height is computed for the stop being flown over, and the
// current rain and cloud cover of all 11 places come from Open-Meteo (free, no key). The HUD chips switch to fixed looks.
const STOP_LL = [[23.364, 105.316], [21.028, 105.854], [20.951, 107.08], [16.463, 107.59], [16.054, 108.202], [12.667, 108.038],
  [12.238, 109.197], [10.928, 108.102], [10.776, 106.7], [10.045, 105.747], [8.604, 104.72]];
function sunElevation(ms, lat, lon) {
  const d = new Date(ms), N = (ms - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5;
  const B = ((2 * Math.PI) / 365) * (N - 81), eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
  const decl = ((-23.44 * Math.PI) / 180) * Math.cos(((2 * Math.PI) / 365) * (N + 10));
  const H = (((ms / 36e5) % 24) + lon / 15 + eot / 60 - 12) * 15 * (Math.PI / 180), phi = (lat * Math.PI) / 180;
  return (Math.asin(Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H)) * 180) / Math.PI;
}
const C = (h) => new THREE.Color(h);
// looks by sun elevation (degrees): night, blue hour, sunset, golden hour, day
const LOOKS = [
  { e: -14, top: C(0x050b16), mid: C(0x0f2a3a), hor: C(0x173039), hs: C(0x7f9fc0), hg: C(0x0e1a16), hemi: 0.85, key: C(0xa9c4ff), keyI: 1.7, exp: 1.15, lamp: 1, bloom: 0.7,
    deep: C(0x04121a), shallow: C(0x15403f), wlo: C(0x1f4250), whi: C(0x0b2232), spec: C(0xe8f0ff), sun: C(0x000000) },
  { e: -4, top: C(0x0b1838), mid: C(0x27466e), hor: C(0x6a6c88), hs: C(0x8aa0c8), hg: C(0x1a2018), hemi: 0.95, key: C(0x9fb4e0), keyI: 1.1, exp: 1.12, lamp: 0.9, bloom: 0.6,
    deep: C(0x08182a), shallow: C(0x1b4648), wlo: C(0x56658a), whi: C(0x27466e), spec: C(0xb8c4f0), sun: C(0x3a2030) },
  { e: 1.5, top: C(0x1d3a6e), mid: C(0x55699a), hor: C(0xf09058), hs: C(0xb0b4cc), hg: C(0x3a3020), hemi: 1.25, key: C(0xff9a58), keyI: 2.4, exp: 1.0, lamp: 0.55, bloom: 0.5,
    deep: C(0x0e2230), shallow: C(0x2a5450), wlo: C(0xd0885c), whi: C(0x4a6a9a), spec: C(0xffb070), sun: C(0xff8a40) },
  { e: 12, top: C(0x2c6ab4), mid: C(0x78a6d6), hor: C(0xf0c8a0), hs: C(0xbcd4ee), hg: C(0x4a4430), hemi: 1.55, key: C(0xffd2a0), keyI: 3.0, exp: 0.95, lamp: 0.12, bloom: 0.32,
    deep: C(0x0f3346), shallow: C(0x2f6a62), wlo: C(0xc8d0d8), whi: C(0x6f9ccc), spec: C(0xfff0d0), sun: C(0xffc890) },
  { e: 40, top: C(0x2766be), mid: C(0x6ca2dc), hor: C(0xcde1f0), hs: C(0xcfe3ff), hg: C(0x4d4a36), hemi: 1.85, key: C(0xfff4e2), keyI: 3.4, exp: 0.9, lamp: 0, bloom: 0.22,
    deep: C(0x0d3a52), shallow: C(0x2e7a72), wlo: C(0xb8d4ea), whi: C(0x5f98d4), spec: C(0xffffff), sun: C(0xfff0d8) },
];
const OVERCAST = { day: [C(0x7b8792), C(0x96a2ac), C(0xb0b9c0)], night: [C(0x080d12), C(0x131b21), C(0x1b2429)] };
const ATMO = {
  timeMode: 'real', wxMode: 'real', e: -20, rain: 0, cloud: 0, hemi: 0.85, fogK: 1, flash: 0, nextFlash: 4, envE: 999, envC: -1, envT: 0, clock: '', wx: null,
  look: Object.fromEntries(Object.entries(LOOKS[0]).map(([k, v]) => [k, v.isColor ? v.clone() : v])),
};
// URL overrides for testing: ?time=HH:MM (Vietnam time), ?rain=0..1, ?cloud=0..1. Screenshots default to a clear night.
const Q_TIME = Q.get('time') || (TEST ? '22:00' : null), Q_RAIN = Q.has('rain') ? +Q.get('rain') : TEST ? 0 : null, Q_CLOUD = Q.has('cloud') ? +Q.get('cloud') : null;
const TIME_MODES = { real: null, day: 45, sunset: 1.5, night: -25 };
const WX_MODES = { real: null, clear: [0, 0.1], rain: [0.85, 1] };
function nowMs() {
  if (!Q_TIME) return Date.now();
  const [hh, mm] = Q_TIME.split(':').map(Number), vn = new Date(Date.now() + 7 * 36e5);
  return Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), hh - 7, mm || 0);
}
async function fetchWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${STOP_LL.map((l) => l[0]).join(',')}&longitude=${STOP_LL.map((l) => l[1]).join(',')}&current=precipitation,cloud_cover,weather_code`;
    const j = await (await fetch(url)).json(), list = Array.isArray(j) ? j : [j];
    // an error body ({ error: true, reason }) or a short list (rate limit, outage) keeps the previous weather
    if (list.length !== STOP_LL.length || list.some((x) => !x || x.error || !x.current)) throw new Error(j.reason || 'unexpected weather response');
    ATMO.wx = list.map(({ current: c }) => {
      const wet = (c.weather_code >= 51 && c.weather_code <= 67) || (c.weather_code >= 80 && c.weather_code <= 99);
      return { rain: c.precipitation > 0.05 || wet ? clamp(0.25 + (c.precipitation || 0) / 4, 0.25, 1) : 0, cloud: clamp((c.cloud_cover ?? 0) / 100, 0, 1), storm: c.weather_code >= 95 };
    });
  } catch (e) { console.warn('weather', e); }
}
if (Q_RAIN === null && !TEST) { fetchWeather(); setInterval(fetchWeather, 15 * 60 * 1000); }
window.__setWeather = (list) => { ATMO.wx = list; }; // tests feed fake Open-Meteo results through this

// rain: streaks around the camera, fixed in the world so they do not swim when the camera moves
const RAIN_N = LOW ? 2200 : 6000;
const rainMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: true,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uRain: { value: 0 }, uCol: { value: new THREE.Color(0.7, 0.75, 0.8) } }]),
  vertexShader: `attribute vec3 aSeed; uniform float uTime; uniform float uRain; varying float vA; varying float vX;
    #include <fog_pars_vertex>
    void main(){
      const float BOX = 64.0, HGT = 36.0;
      float speed = 34.0 + aSeed.y * 12.0, len = 0.9 + aSeed.z * 0.8;
      vec3 c;
      c.y = cameraPosition.y - HGT * 0.45 + mod(aSeed.y * HGT * 7.0 - uTime * speed, HGT);
      c.x = cameraPosition.x + mod(aSeed.x * BOX - cameraPosition.x, BOX) - BOX * 0.5;
      c.z = cameraPosition.z + mod(aSeed.z * BOX * 3.1 - cameraPosition.z, BOX) - BOX * 0.5;
      vec3 dir = normalize(vec3(0.12, -1.0, 0.05)), view = normalize(c - cameraPosition);
      vec3 right = normalize(cross(dir, view));
      vec3 p = c + right * position.x * 0.03 - dir * position.y * len;
      float d = distance(c, cameraPosition);
      vA = step(fract(aSeed.x * 13.17 + aSeed.z * 7.73), uRain) * smoothstep(3.0, 7.0, d) * (1.0 - smoothstep(20.0, 34.0, d)); // no fat streaks right at the lens
      vX = position.x * 2.0;
      vec4 mvPosition = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `uniform vec3 uCol; varying float vA; varying float vX;
    #include <fog_pars_fragment>
    void main(){ if (vA <= 0.0) discard; gl_FragColor = vec4(uCol, vA * 0.22 * (1.0 - abs(vX)));
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
rainMat.uniforms.uTime = SH.uTime;
const rain = (() => {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
  const seed = new Float32Array(RAIN_N * 3); for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 3)); g.instanceCount = RAIN_N;
  const m = new THREE.Mesh(g, rainMat); m.frustumCulled = false; m.renderOrder = 5; m.visible = false; scene.add(m); return m;
})();

const _sun = new THREE.Vector3(), _moon = new THREE.Vector3(), _key = new THREE.Vector3(), _c1 = new THREE.Color(), _c2 = new THREE.Color();
let lastLamp = -1;
function updateAtmo(dt, camY) {
  const A = ATMO, k = STATE.s.k;
  // time
  const ms = nowMs(), fixedE = TIME_MODES[A.timeMode];
  A.e = fixedE ?? sunElevation(ms, STOP_LL[k][0], STOP_LL[k][1]);
  const vn = new Date(ms + 7 * 36e5); A.clock = `${String(vn.getUTCHours()).padStart(2, '0')}:${String(vn.getUTCMinutes()).padStart(2, '0')}`;
  // weather: fixed look, URL override or the place being flown over; eased so moving between stops changes it gradually
  let tr = 0, tc = 0, storm = false;
  if (WX_MODES[A.wxMode]) [tr, tc] = WX_MODES[A.wxMode];
  else if (Q_RAIN !== null) { tr = Q_RAIN; tc = Q_CLOUD ?? Math.max(Q_RAIN > 0 ? 0.9 : 0.1, 0); }
  else if (A.wx) { const w = A.wx[k] || A.wx[0]; tr = w.rain; tc = w.cloud; storm = w.storm; }
  if (Q_CLOUD !== null && !WX_MODES[A.wxMode]) tc = Q_CLOUD;
  const ease = 1 - Math.exp(-dt / (TEST ? 0.05 : 2.5));
  A.rain += (tr - A.rain) * ease; A.cloud += (tc - A.cloud) * ease;
  // blend the looks by sun height, then pull towards overcast and rain
  let i = 0; while (i < LOOKS.length - 2 && A.e > LOOKS[i + 1].e) i++;
  const L0 = LOOKS[i], L1 = LOOKS[i + 1], t = smooth(L0.e, L1.e, A.e), L = A.look;
  for (const key in L0) if (key !== 'e') { if (L0[key].isColor) L[key].copy(L0[key]).lerp(L1[key], t); else L[key] = lerp(L0[key], L1[key], t); }
  const dayF = smooth(-6, 10, A.e), oc = A.cloud * 0.85, wet = A.rain;
  const over = (j) => _c1.copy(OVERCAST.night[j]).lerp(OVERCAST.day[j], dayF);
  L.top.lerp(over(0), oc); L.mid.lerp(over(1), oc); L.hor.lerp(over(2), oc);
  L.wlo.lerp(over(2), oc * 0.8); L.whi.lerp(over(1), oc * 0.8); L.deep.multiplyScalar(1 - 0.3 * wet);
  // lightning in heavy night rain
  A.flash = Math.max(0, A.flash - dt * 6);
  if (wet > 0.55 && dayF < 0.5 && !TEST) { A.nextFlash -= dt; if (A.nextFlash < 0) { A.flash = 1; A.nextFlash = (storm ? 3 : 7) + Math.random() * 9; setTimeout(() => { A.flash = 0.8; }, 140); } }
  // sky, fog, background
  const sk = sky.material.uniforms;
  sk.top.value.copy(L.top); sk.mid.value.copy(L.mid); sk.horizon.value.copy(L.hor).lerp(_c2.setRGB(0.8, 0.85, 1), A.flash * 0.5);
  scene.fog.color.copy(L.hor).lerp(L.mid, 0.25); scene.background.copy(scene.fog.color);
  A.fogK = (1 + 0.25 * dayF) * (1 + 1.4 * wet); // a light haze by day gives depth; rain thickens it
  STARS_MAT.opacity = 0.8 * (1 - dayF) * (1 - A.cloud);
  moonGroup.visible = (1 - dayF) * (1 - A.cloud) > 0.03; MOON_HALO.opacity = 0.4 * (1 - A.cloud);
  // sun: low in front of the camera at dawn and dusk (glitter on the water), swinging to the side as it climbs
  const az = lerp(0.45, 2.1, smooth(8, 35, A.e)), el = (Math.max(A.e, -2) * Math.PI) / 180;
  _sun.copy(fwd).applyAxisAngle(_v3.set(0, 1, 0), -az).multiplyScalar(Math.cos(el)).setY(Math.sin(el)).normalize();
  _moon.copy(moonGroup.position).sub(camera.position).normalize();
  // what shines on the water (moon or sun, in front) and what lights the scene (from behind and to the side, so landmarks are lit)
  _key.copy(_moon).lerp(_sun, smooth(-6, 0, A.e)).normalize();
  const lightUp = lerp(420, 60 + 520 * Math.sin(Math.max(el, 0.12)), dayF);
  _v3.copy(fwd).multiplyScalar(-260).addScaledVector(left, 320).setY(lightUp).normalize();
  sk.uSunDir.value.copy(_sun); sk.uSunCol.value.copy(L.sun).multiplyScalar(1 - A.cloud * 0.9); sk.uSunDisc.value = smooth(-1, 2, A.e) * (1 - A.cloud);
  // lights
  HEMI.color.copy(L.hs); HEMI.groundColor.copy(L.hg); A.hemi = L.hemi * (1 + 0.1 * A.cloud);
  moonLight.color.copy(L.key); moonLight.intensity = L.keyI * (1 - 0.75 * A.cloud) + A.flash * 2;
  moonLight.position.copy(camera.position).addScaledVector(_v3, 500); moonLight.target.position.copy(camera.position).addScaledVector(fwd, 60);
  warmFill.intensity = 0.35 * (1 - dayF * 0.7);
  renderer.toneMappingExposure = L.exp + 0.08 * A.cloud;
  if (bloomPass) { bloomPass.strength = L.bloom; bloomPass.threshold = lerp(0.82, 0.92, dayF); }
  // water
  const wu = water.material.uniforms;
  wu.uDeep.value.copy(L.deep); wu.uShallow.value.copy(L.shallow); wu.uSkyLo.value.copy(L.wlo); wu.uSkyHi.value.copy(L.whi);
  wu.uMoonCol.value.copy(L.spec).multiplyScalar((1 - 0.85 * A.cloud) * (1 - 0.5 * wet)); wu.uMoonDir.value.copy(_key); wu.uRain.value = wet;
  // artificial lights fade out by day
  SH.uLamp.value = L.lamp;
  if (Math.abs(L.lamp - lastLamp) > 0.01) {
    lastLamp = L.lamp;
    WINDOW_MAT.emissiveIntensity = 0.85 * lerp(0.1, 1, L.lamp);
    for (const f of FIELDS) if (f.mesh) f.mesh.material.color.setScalar(lerp(0.3, 1, L.lamp));
  }
  impMat.uniforms.uLight.value.copy(L.hs).lerp(_c2.setRGB(1, 1, 1), 0.7).multiplyScalar(0.25 * A.hemi + 0.12 * moonLight.intensity);
  // rain and wet ground
  WET.value = Math.min(1, wet * 1.6);
  rainMat.uniforms.uRain.value = wet; rain.visible = wet > 0.02 && camY < 160;
  rainMat.uniforms.uCol.value.setRGB(0.55, 0.6, 0.66).lerp(_c2.setRGB(0.85, 0.88, 0.92), dayF);
  // the image-based light follows the sky, rebuilt only when it changed enough
  A.envT -= dt;
  if (A.envT <= 0 && (Math.abs(A.e - A.envE) > 2.5 || Math.abs(A.cloud - A.envC) > 0.1)) { A.envE = A.e; A.envC = A.cloud; A.envT = TEST ? 0 : 2; rebuildEnv(); }
  updateSkyChip();
}
const skyChip = $('#sky'), wxChip = $('#wx'), clockEl = $('#clock');
let chipText = '';
function updateSkyChip() {
  const A = ATMO, place = tx('stops')[STATE.s.k], sky = tx('sky');
  const w = A.rain > 0.6 ? sky.heavy : A.rain > 0.12 ? sky.rain : A.cloud > 0.65 ? sky.cloud : A.e > 0 ? sky.sun : sky.clear;
  const txt = `${A.timeMode === 'real' ? A.clock : tx('time')[A.timeMode]} · ${place} · ${w}`;
  if (txt !== chipText && clockEl) { chipText = txt; clockEl.textContent = txt; }
}
const cycle = (obj, cur) => { const ks = Object.keys(obj); return ks[(ks.indexOf(cur) + 1) % ks.length]; };
const chipLabels = () => { if (skyChip) skyChip.textContent = tx('time')[ATMO.timeMode]; if (wxChip) wxChip.textContent = tx('wx')[ATMO.wxMode]; chipText = ''; };
langHook(chipLabels);
skyChip?.addEventListener('click', () => { ATMO.timeMode = cycle(TIME_MODES, ATMO.timeMode); chipLabels(); });
wxChip?.addEventListener('click', () => { ATMO.wxMode = cycle(WX_MODES, ATMO.wxMode); chipLabels(); });

// ---------------------------------------------------------------- UI
const PANELS = $$('.panel').map((el) => ({ el, k: el.dataset.k, o: -1 }));
const DOTS = $$('.rail .dot');
const railFill = $('.rail .fill'), railLabel = $('.rail .now');
const LABELS = STOP_NAMES.map((n, k) => { const el = document.createElement('span'); el.className = 'map-label'; $('#labels').appendChild(el); return { el, p: (() => { const q = at(k, 0, 0); return v3(q.x, 4, q.z); })() }; });
const isPhoneLayout = () => matchMedia('(max-width: 760px)').matches;
// panels move in depth with the flight: small and far while approaching, growing past full size as they slide by
function setPanel(p, w, dir = -1) {
  w = Math.round(w * 50) / 50; if (w === p.o && dir === p.dir) return; p.o = w; p.dir = dir;
  const sc = dir < 0 ? 0.8 + 0.2 * w : 1 + 0.12 * (1 - w);
  p.el.style.opacity = w; p.el.style.transform = `translate3d(0, ${(dir < 0 ? (1 - w) * 10 : 0).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
  p.el.style.visibility = w < 0.02 ? 'hidden' : 'visible'; p.el.classList.toggle('live', w > 0.6);
}
let railCur = -2;
langHook(() => { LABELS.forEach((L, k) => { L.el.textContent = tx('stops')[k]; L.w = 0; }); railCur = -2; });
function updateUI(u) {
  const st = STATE;
  for (const p of PANELS) {
    let w = 0, dir = -1;
    if (p.k === 'intro') { w = 1 - smooth(U_HOLD * 0.4, U_HOLD + 0.012, u); dir = 1; }
    else if (p.k === 'end') w = st.phase === 'end' ? smooth(0.55, 0.85, st.tE) : 0;
    else {
      const k = +p.k;
      if (st.phase === 'journey') { const d = st.a - ADW[k]; w = d < 0 ? 1 - smooth(14, 40, -d) : 1 - smooth(10, 30, d); dir = d < 0 ? -1 : 1; }
      else if (st.phase === 'intro' && k === 0) w = smooth(0.72, 1, st.tI);
      else if (st.phase === 'end' && k === 10) { w = 1 - smooth(0, 0.3, st.tE); dir = 1; }
    }
    setPanel(p, w, dir);
  }
  const cur = st.phase === 'intro' ? (st.tI > 0.7 ? 0 : -1) : st.phase === 'end' ? 11 : st.s.k;
  if (cur !== railCur) {
    railCur = cur;
    DOTS.forEach((d, i) => { d.classList.toggle('past', i < cur); d.classList.toggle('cur', i === cur); d.setAttribute('aria-current', i === cur ? 'step' : 'false'); });
    if (cur >= 0 && cur <= 10) { railLabel.textContent = `${String(cur + 1).padStart(2, '0')} ${tx('stops')[cur]}`; railLabel.style.left = `${(cur / 10) * 100}%`; railLabel.dataset.edge = cur === 0 ? 'start' : cur === 10 ? 'end' : ''; }
    else railLabel.textContent = '';
  }
  railFill.style.transform = `scaleX(${clamp((u - U_INTRO) / (U_END - U_INTRO), 0, 1).toFixed(4)})`;
}
// map labels fade out where they would sit behind the intro text (phones: the map runs under it)
const introP = PANELS.find((p) => p.k === 'intro');
let introBox = null;
const measureIntro = () => { introBox = introP ? introP.el.getBoundingClientRect() : null; };
LANG_HOOKS.push(() => { introBox = null; });
window.addEventListener('resize', () => { introBox = null; });
function updateLabels(ov) {
  const show = ov > 0.05;
  if (show && !introBox) measureIntro();
  for (const L of LABELS) {
    if (!show) { if (L.el.style.opacity !== '0') L.el.style.opacity = '0'; continue; }
    _v3.copy(L.p).project(camera);
    const x = (_v3.x * 0.5 + 0.5) * VW, y = (-_v3.y * 0.5 + 0.5) * VH;
    if (!L.w) L.w = L.el.offsetWidth;
    const lx = x + 14 + L.w > VW - 8 ? x - 14 - L.w : x + 14; // flip to the left near the right edge
    const hid = introBox && introP.o > 0 && y > introBox.top - 12 && lx < introBox.right && lx + L.w > introBox.left ? introP.o : 0;
    L.el.style.opacity = (ov * (1 - hid)).toFixed(2); L.el.style.transform = `translate3d(${lx.toFixed(1)}px, ${(y - 9).toFixed(1)}px, 0)`;
  }
}
const loadingEl = $('#loading');
function updateLoading() {
  if (!loadingEl) return;
  if (modelsDone >= modelsTotal()) { loadingEl.hidden = true; return; }
  loadingEl.hidden = false; loadingEl.textContent = tx('loading')(modelsDone, modelsTotal());
}
langHook(updateLoading);

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
  playBtn.querySelector('.lbl').textContent = tx(on ? 'pause' : 'play');
  playBtn.classList.toggle('on', on);
  if (on) { if (readU() > 0.995) { writeU(0); curU = 0; } targetU = readU(); }
}
langHook(() => { playBtn.querySelector('.lbl').textContent = tx(auto ? 'pause' : 'play'); });
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
  if (act === 'credits') {
    const box = $('#credits');
    if (!box.dataset.filled) {
      box.dataset.filled = '1';
      box.querySelector('ul').innerHTML = CREDITS.map((c) => `<li><a class="link" href="${c.url}" target="_blank" rel="noopener">${c.name.replace(/</g, '&lt;')}</a> · ${c.author.replace(/</g, '&lt;')}</li>`).join('');
    }
    box.hidden = !box.hidden;
  }
  if (act === 'copy') {
    const email = 'longnminhse@gmail.com', done = () => { b.textContent = tx('copied'); setTimeout(() => { b.textContent = tx('copy'); }, 1800); };
    const fallback = () => { const el = b.closest('.panel').querySelector('.email'); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = tx('selected'); };
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
  VW = w; VH = h; PHONE = isPhoneLayout(); for (const L of LABELS) L.w = 0;
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
try { const u = sessionStorage.getItem('lnm-u'); if (u !== null) { sessionStorage.removeItem('lnm-u'); writeU(clamp(+u || 0, 0, 1)); } } catch (e) { /* storage blocked */ }

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
const VIS_R = () => (lightMode ? 300 : LOW ? 360 : 440);
let HOLD = false; // screenshots: once a test frame is set up, the loop stops redrawing so the capture is not starved
function frame(now) {
  requestAnimationFrame(frame);
  if (HOLD) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (auto) { targetU = Math.min(1, targetU + dt / AUTO_SECONDS); writeU(targetU); if (targetU >= 1) setAuto(false); }
  else targetU = readU();
  const tau = 0.28 + Math.min(1.2, Math.abs(targetU - curU) * 9);
  curU += (targetU - curU) * (1 - Math.exp(-dt / tau));
  if (Math.abs(targetU - curU) < 1e-6) curU = targetU;
  step(curU, dt);
  frames++; fpsT += dt;
  if (fpsT >= 1) {
    const fps = Math.round(frames / fpsT); fpsEl.textContent = tx('fps')(fps);
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
  const tx = 0, ty = phone ? (STATE.phase === 'end' ? lerp(0.22, 0.3, smooth(0.5, 0.85, STATE.tE)) : 0.22 * Math.max(wp, 0.6)) : 0;
  shiftX += (tx - shiftX) * (1 - Math.exp(-dt / 0.35)); shiftY += (ty - shiftY) * (1 - Math.exp(-dt / 0.35));
  const ax = Math.abs(shiftX);
  if (ax > 0.002 || shiftY > 0.002) {
    const fw = VW * (1 + ax), fh = VH * (1 + shiftY);
    camera.setViewOffset(fw, fh, shiftX > 0 ? VW * ax : 0, VH * shiftY, VW, VH);
  } else camera.clearViewOffset();
  SH.uScale.value = (renderer.getPixelRatio() * VH * (1 + shiftY)) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  // atmosphere follows altitude
  scene.fog.density = lerp(0.0042, 0.00016, smooth(25, 420, camY)) * ATMO.fogK;
  sky.position.copy(camera.position);
  camera.getWorldDirection(fwd); fwd.y = 0; if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1); fwd.normalize();
  left.set(fwd.z, 0, -fwd.x);
  moonGroup.position.copy(camera.position).addScaledVector(fwd, 2600).addScaledVector(left, 700).add(_v3.set(0, 900, 0));
  updateAtmo(dt, camY);
  // lights on the current landmark
  const s = STATE.s, k = s.k, near = STATE.phase === 'journey' ? s.wb : STATE.phase === 'intro' ? smooth(0.6, 1, STATE.tI) : 1 - smooth(0, 0.4, STATE.tE);
  heroLight.intensity = 2.6 * near * lerp(0.25, 1, SH.uLamp.value); heroLight.target.position.copy(HERO[k]);
  heroLight.position.copy(camera.position).add(_v3.set(0, 12, 0)).addScaledVector(fwd, -10);
  warmLight.intensity = 140 * near * lerp(0.2, 1, SH.uLamp.value); warmLight.position.copy(WARM[k]);
  // overview layer
  ribbonMat.uniforms.uAlpha.value = ov; water.material.uniforms.uGlintAmt.value = 1 - smooth(40, 260, camY); HEMI.intensity = ATMO.hemi * lerp(1, 2.1, ov) + ATMO.flash * 3; markerMat.uniforms.uAlpha.value = ov; coastMat.opacity = 0.4 * ov;
  ribbonMat.uniforms.uLit.value = STATE.phase === 'end' ? smooth(0.15, 0.85, STATE.tE) * 0.985 : STATE.phase === 'journey' ? STATE.ujour * 0.985 : 0;
  OV.visible = ov > 0.01; markers.pts.visible = ov > 0.01;
  SH.uBoost.value = lerp(1, 2.6, ov);
  // visibility: only nearby stops and terrain are drawn during the flight
  const low = camY < 320, vr = VIS_R();
  for (let i = 0; i < 11; i++) { const d = Math.hypot(camera.position.x - GCENTER[i].x, camera.position.z - GCENTER[i].y); G[i].visible = low && d < vr; SG[i].visible = d < SG_R(); }
  for (const m of TERRAIN) m.visible = !low || Math.abs(m.userData.zc - camera.position.z) < 640;
  updateForest(low);
  for (const f of FIELDS) if (f.dyn && (f.k < 0 || G[f.k].visible)) fieldUpdate(f, T);
  for (const a of ANIM) if (G[a.k].visible) a.fn(T);
  updateUI(u); updateLabels(ov);
  if (bloomOn && composer) composer.render(); else renderer.render(scene, camera);
}
applyLight();
requestAnimationFrame(frame);

// test hooks
window.__fly = {
  ready: Promise.all([...MODEL_JOBS, ...TEX_JOBS]),
  atmo: () => ({ e: +ATMO.e.toFixed(1), rain: +ATMO.rain.toFixed(2), cloud: +ATMO.cloud.toFixed(2), clock: ATMO.clock, stop: STATE.s.k, phase: STATE.phase, wx: ATMO.wx ? ATMO.wx.length : 0 }),
  setTime(mode) { ATMO.timeMode = mode; }, setWx(mode) { ATMO.wxMode = mode; },
  trees: () => ({ total: TREES.x.length, near: NEAR_TREES.map((l) => l[0]?.count ?? 0), uNear: impMat.uniforms.uNear.value }),
  shot(u, t = 10) { HOLD = true; curU = targetU = u; T = t; writeU(u); step(u, 0.016); step(u, 0.5); step(u, 0.5); step(u, 0.5); step(u, 0.5); },
  uOfStop, info: () => { renderer.render(scene, camera); return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tier: TIER, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }; },
  U: { U_HOLD, U_INTRO, U_END },
  // who costs what in the current frame: visible meshes grouped by geometry, with draw calls and triangles
  budget() {
    const rows = {}, f = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    scene.traverseVisible((o) => {
      if (!(o.isMesh || o.isPoints || o.isLine)) return;
      if (o.frustumCulled && o.geometry.boundingSphere && !f.intersectsObject(o)) return;
      const tris = o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3, n = o.isInstancedMesh ? o.count : 1;
      let g = o, k = '?'; while (g) { const i = G.indexOf(g); if (i >= 0) { k = i; break; } if (g === OV) { k = 'ov'; break; } g = g.parent; }
      const key = `${k} ${o.isInstancedMesh ? 'inst' : o.type} ${o.geometry.uuid.slice(0, 4)} ${o.material.name || o.material.type}`;
      rows[key] ??= { key, calls: 0, tris: 0 }; rows[key].calls++; rows[key].tris += tris * n;
    });
    return Object.values(rows).sort((a, b) => b.tris - a.tris);
  },
};
