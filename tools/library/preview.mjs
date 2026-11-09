// Contact sheet of downloaded library models. Usage (from tools/): node library/preview.mjs <dir under assets/library> <out.png>
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
const tools = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const repo = path.join(tools, '..');
const [dir, out] = process.argv.slice(2);
const base = path.join(repo, 'assets/library', dir);
const files = [];
for (const g of fs.readdirSync(base).filter((g) => fs.statSync(path.join(base, g)).isDirectory()).sort()) {
  for (const f of fs.readdirSync(path.join(base, g)).sort()) {
    const p = path.join(base, g, f);
    const file = fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((x) => path.join(p, x)).find((x) => x.endsWith('.gltf')) : p.endsWith('.glb') ? p : null;
    const bytes = fs.statSync(p).isDirectory() ? fs.readdirSync(p).reduce((n, x) => n + fs.statSync(path.join(p, x)).size, 0) : fs.statSync(p).size;
    // over 40 MB (multi-million-triangle scans) crashes the software renderer used here, so those are listed but not drawn
    if (file) files.push({ label: `${g}/${f.replace(/-[0-9a-f]{8}\.glb$/, '')}`, url: bytes > 40e6 ? null : 'http://lib.local/' + path.relative(repo, file) });
  }
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1320, height: 900 } });
await page.route('http://lib.local/**', (r) => { const p = decodeURIComponent(new URL(r.request().url()).pathname); r.fulfill({ path: path.join(repo, p), contentType: p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : undefined }); });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto('http://lib.local/tools/library/preview.html#' + encodeURIComponent(JSON.stringify(files.map((f) => ({ url: f.url })))));
await page.waitForFunction(() => window.done, null, { timeout: 1800000 });
const res = await page.evaluate(() => window.result);
const png = await page.locator('#c').screenshot({ timeout: 300000 });
await browser.close();
// labels drawn with sharp/SVG under each cell
const C = 220, cols = 6, meta = await sharp(png).metadata();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = `<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">${files.map((f, i) => {
  const x = (i % cols) * C + 4, y = Math.floor(i / cols) * (C + 18) + C + 13, r = res[i];
  const tag = !f.url ? 'quá nặng để xem trước' : r.err ? 'ERR' : Math.round(r.tris / 1000) + 'k';
  return `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="11" fill="${r.err || !f.url ? '#ffb080' : '#e8e8e8'}">${esc(f.label.slice(0, 30))} ${tag}</text>`;
}).join('')}</svg>`;
await sharp(png).composite([{ input: Buffer.from(svg) }]).toFile(out);
for (const [i, r] of res.entries()) if (r.err) console.log('ERR', files[i].label, r.err);
console.log(files.length, 'models');
