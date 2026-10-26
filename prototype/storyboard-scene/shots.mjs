import { chromium } from 'playwright';
const [mode, outDir, only] = process.argv.slice(2);
const size = mode === 'phone' ? { w: 860, h: 1864 } : { w: 1600, h: 900 };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
page.on('pageerror', e => console.log('ERR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.goto(`http://127.0.0.1:8765/prototype/storyboard-scene/index.html?w=${size.w}&h=${size.h}`);
await page.waitForFunction(() => window.__ready, null, { timeout: 120000 });
await page.evaluate(() => window.__ready);
const ids = await page.evaluate(() => window.__STOPS.map(s => s.id));
const list = only ? only.split(',') : ['intro', ...ids];
for (const id of list) {
  const t0 = Date.now();
  await page.evaluate(([id, mode]) => {
    const THREE = window.__THREE, S = window.__STOPS, placed = window.__placed;
    if (id === 'intro') {
      const shot = mode === 'phone'
        ? { cam: [20, 1150, -120], target: [0, 0, -560], side: 'none', fov: 62, fog: 0.0004, intro: true }
        : { cam: [70, 230, 170], target: [10, 0, -420], side: 'none', fov: 50, fog: 0.0019, intro: true };
      window.__shoot(shot); return;
    }
    const o = placed[id]; const box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const h = sz.y, rx = window.__pathXAt(c.z + 40);
    let left = c.x < rx;
    const OV = { 'hue': [[30, 6, 46], 'left'], 'da-nang': [[-30, -2, 46], 'right'], 'ha-long': [[-18, 5, 32], 'right'], 'nha-trang': [[-40, 4, 52], 'right'], 'mien-tay': [[12, 4, 17], 'left'], 'ca-mau': [[-17, 3, 23], 'right'] };
    if (mode !== 'phone' && OV[id]) {
      const [[dx, dy, dz], sd] = OV[id];
      window.__shoot({ cam: [c.x + dx, Math.max(4, c.y + dy), c.z + dz], target: [c.x, c.y + h * 0.05, c.z], side: sd, fov: 38, shift: 0.42, heroAt: [c.x, c.y, c.z] });
      return;
    }
    if (mode === 'phone') {
      const OVP = { 'da-nang': [-24, 16, 125], 'ca-mau': [-14, 3, 34], 'sai-gon': [-26, 4, 58] };
      const dist = Math.max(sz.x, h, sz.z) * 2.3 + 14;
      const off = OVP[id] || [(left ? 1 : -1) * dist * 0.3, h * 0.3 + 3, dist];
      const cam = [c.x + off[0], Math.max(4, c.y + off[1]), c.z + off[2]];
      window.__shoot({ cam, target: [c.x, c.y + h * 0.1, c.z], side: 'top', fov: 48, shift: 0.5, heroAt: [c.x, c.y, c.z] });
    } else {
      const dist = Math.max(sz.x, h, sz.z) * 1.35 + 12;
      const cam = [rx + (left ? 6 : -6), Math.max(6, c.y * 0.6 + 4), c.z + dist];
      window.__shoot({ cam, target: [c.x, c.y + h * 0.05, c.z], side: left ? 'left' : 'right', fov: 38, shift: 0.42, heroAt: [c.x, c.y, c.z] });
    }
  }, [id, mode]);
  await page.screenshot({ path: `${outDir}/${mode}-${id}.png` });
  console.log(id, Date.now() - t0, 'ms');
}
await browser.close();
