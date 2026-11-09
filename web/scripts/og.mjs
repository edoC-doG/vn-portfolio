// Captures the link-preview images public/og-vi.jpg and public/og-en.jpg (1200 x 630) from a running site:
// the overview of the glowing map at night with the intro text. Re-run after changing the intro or the map.
// Usage: npm run build && npm start, then in another shell: node scripts/og.mjs [http://localhost:3000]
// Needs Playwright with a Chromium (the repo's tools/ folder has it: cd ../tools && npm install).
import path from 'path';
import { chromium } from '../../tools/node_modules/playwright/index.mjs';

const base = process.argv[2] || 'http://localhost:3000';
const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public');
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
for (const lang of ['vi', 'en']) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`${base}/${lang}?test&tier=mid&time=20:30&rain=0`);
  await page.waitForFunction(() => window.__fly, null, { timeout: 120000 });
  await page.evaluate(() => window.__fly.ready);
  // the first frames after loading are not settled: shoot the overview twice and keep the second
  for (let i = 0; i < 2; i++) { await page.evaluate(() => window.__fly.shot(0)); await page.waitForTimeout(600); }
  await page.evaluate(() => { for (const el of document.querySelectorAll('.hud, .rail')) el.style.visibility = 'hidden'; });
  await page.screenshot({ path: path.join(out, `og-${lang}.jpg`), type: 'jpeg', quality: 86 });
  await page.close();
  console.log('wrote', `public/og-${lang}.jpg`);
}
await browser.close();
