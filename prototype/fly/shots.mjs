import { chromium } from '../../tools/node_modules/playwright/index.mjs'; // run `npm install` in tools/ first
import fs from 'fs';
const [mode = 'desktop', list = ''] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = mode === 'phone'
  ? await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  : await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.186\.1\/(.*)/, (route) => {
  const p = route.request().url().split('three@0.186.1/')[1];
  route.fulfill({ path: new URL('../../tools/node_modules/three/' + p, import.meta.url).pathname, contentType: 'text/javascript' });
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const errs = []; page.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
const t0 = Date.now();
await page.goto('http://127.0.0.1:8770/_local.html?test' + (mode === 'phone' ? '' : '&tier=mid'));
await page.waitForFunction(() => window.__fly, null, { timeout: 120000 });
await page.evaluate(() => window.__fly.ready);
console.log('ready in', ((Date.now() - t0) / 1000).toFixed(1), 's');
const U = await page.evaluate(() => window.__fly.U);
const stops = await page.evaluate(() => [...Array(11)].map((_, k) => window.__fly.uOfStop(k)));
const all = {
  overview: 0, dive1: U.U_HOLD + (U.U_INTRO - U.U_HOLD) * 0.35, dive2: U.U_HOLD + (U.U_INTRO - U.U_HOLD) * 0.7,
  ...Object.fromEntries(stops.map((u, k) => ['s' + String(k + 1).padStart(2, '0'), u])),
  dragon: (stops[4] + stops[5]) / 2 - 0.004, hoian: (stops[4] + stops[5]) / 2 + 0.006, between: (stops[7] + stops[8]) / 2,
  rise: U.U_END + (1 - U.U_END) * 0.45, end: 1,
};
const want = list ? list.split(',') : Object.keys(all);
fs.mkdirSync('shots', { recursive: true });
await page.evaluate((u) => window.__fly.shot(u), all[want[0]]); await page.waitForTimeout(500); // warm-up: the first frame after loading is not settled yet
for (const name of want) {
  const u = all[name];
  const t1 = Date.now();
  await page.evaluate((u) => window.__fly.shot(u), u);
  await page.waitForTimeout(400); // let the rail label's CSS transition settle
  await page.screenshot({ path: `shots/${mode}-${name}.png` });
  const info = await page.evaluate(() => ({ ...window.__fly.info(), ...(window.__fly.trees ? window.__fly.trees() : {}) }));
  console.log(name, u.toFixed(4), JSON.stringify(info), ((Date.now() - t1) / 1000).toFixed(1) + 's');
}
console.log([...new Set(errs)].slice(0, 20).join('\n'));
await browser.close();
