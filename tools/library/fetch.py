# Fetches the asset library listed in tools/library/library.json into assets/library/ (not committed).
#   textures: 1K colour + OpenGL normal map (Poly Haven JPG, or the Color/NormalGL files of an ambientCG 1K-JPG zip)
#   models:   Poly Haven glTF at 1K textures, with its .bin and texture files
# Files already on disk are skipped, so it can be re-run. Writes assets/library/CREDITS.md.
# Usage (from the repo root): python3 tools/library/fetch.py [--only textures|models]
import io
import json
import os
import sys
import time
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'library')
LIB = json.load(open(os.path.join(HERE, 'library.json'), encoding='utf-8'))
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
UA = {'User-Agent': 'vn-portfolio-asset-fetch'}


def get(url, tries=4):
    for t in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except Exception as e:
            if t == tries - 1:
                raise RuntimeError(f'{url}: {e}')
            time.sleep(2 ** t)


def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)


def ph_files(asset_id):
    return json.loads(get(f'https://api.polyhaven.com/files/{asset_id}'))


def texture(group, item):
    d = os.path.join(OUT, 'textures', group, item['id'])
    if item['src'] == 'polyhaven':
        files = ph_files(item['id'])
        for key in ('Diffuse', 'nor_gl'):
            url = files[key]['1k']['jpg']['url']
            p = os.path.join(d, url.rsplit('/', 1)[1])
            if not os.path.exists(p):
                save(p, get(url))
    elif item['src'] == 'ambientcg':
        if not any(f.endswith('_Color.jpg') for f in (os.listdir(d) if os.path.isdir(d) else [])):
            z = zipfile.ZipFile(io.BytesIO(get(f'https://ambientcg.com/get?file={item["id"]}_1K-JPG.zip')))
            for n in z.namelist():
                if n.endswith('_Color.jpg') or n.endswith('_NormalGL.jpg'):
                    save(os.path.join(d, os.path.basename(n)), z.read(n))
    return f'{group}/{item["id"]}'


def model(group, item):
    d = os.path.join(OUT, 'models', group, item['id'])
    g = ph_files(item['id'])['gltf']['1k']['gltf']
    todo = [(g['url'], os.path.join(d, g['url'].rsplit('/', 1)[1]))]
    todo += [(v['url'], os.path.join(d, rel)) for rel, v in g.get('include', {}).items()]
    for url, p in todo:
        if not os.path.exists(p):
            save(p, get(url))
    return f'{group}/{item["id"]}'


def page(item):
    return f'https://polyhaven.com/a/{item["id"]}' if item['src'] == 'polyhaven' else f'https://ambientcg.com/view?id={item["id"]}'


jobs = []
if ONLY in (None, 'textures'):
    jobs += [(texture, g, it) for g, items in LIB['textures'].items() for it in items]
if ONLY in (None, 'models'):
    jobs += [(model, g, it) for g, items in LIB['models'].items() for it in items]
failed = []
with ThreadPoolExecutor(max_workers=6) as ex:
    futs = {ex.submit(fn, g, it): (g, it) for fn, g, it in jobs}
    for f in futs:
        g, it = futs[f]
        try:
            print('ok ', f.result(), flush=True)
        except Exception as e:
            failed.append(it['id'])
            print('ERR', g, it['id'], e, flush=True)

lines = ['# Thư viện asset (CC0)', '', 'Tải bằng `python3 tools/library/fetch.py`. Mọi asset ở đây là CC0: dùng tự do, không bắt buộc ghi công.', '']
for kind in ('textures', 'models'):
    lines += [f'## {kind}', '', '| Nhóm | Asset | Nguồn | Dùng cho |', '|---|---|---|---|']
    for g, items in LIB[kind].items():
        lines += [f'| {g} | {it["id"]} | {page(it)} | {it["use"]} |' for it in items]
    lines.append('')
save(os.path.join(OUT, 'CREDITS.md'), '\n'.join(lines).encode('utf-8'))
print(f'done: {len(jobs) - len(failed)} ok, {len(failed)} failed {failed}')
sys.exit(1 if failed else 0)
