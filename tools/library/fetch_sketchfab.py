# Downloads the Sketchfab models listed in tools/library/sketchfab.json as .glb into assets/library/sketchfab/<group>/.
# Needs a Sketchfab API token (sketchfab.com → Settings → Password & API) in the SKETCHFAB_TOKEN environment variable;
# the token is only sent to the Sketchfab API, never written anywhere. Files already on disk are skipped.
# Usage (from the repo root): SKETCHFAB_TOKEN=... python3 tools/library/fetch_sketchfab.py [--priority]
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'library', 'sketchfab')
TOKEN = os.environ.get('SKETCHFAB_TOKEN')
if not TOKEN:
    sys.exit('Set SKETCHFAB_TOKEN to your Sketchfab API token (sketchfab.com → Settings → Password & API).')
MODELS = json.load(open(os.path.join(HERE, 'sketchfab.json'), encoding='utf-8'))
if '--priority' in sys.argv:
    MODELS = [m for m in MODELS if m['priority']]


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:40]


def path_of(m):
    return os.path.join(OUT, m['group'], f"{slug(m['name'])}-{m['uid'][:8]}.glb")


def download(m):
    p = path_of(m)
    if os.path.exists(p):
        return f'skip {os.path.relpath(p, OUT)}'
    for attempt in range(4):
        try:
            # the signed link expires after a few minutes, so ask for it right before downloading
            req = urllib.request.Request(f"https://api.sketchfab.com/v3/models/{m['uid']}/download", headers={'Authorization': f'Token {TOKEN}'})
            with urllib.request.urlopen(req, timeout=60) as r:
                info = json.load(r)
            fmt = 'glb' if 'glb' in info else 'gltf'
            with urllib.request.urlopen(info[fmt]['url'], timeout=600) as r:
                data = r.read()
            os.makedirs(os.path.dirname(p), exist_ok=True)
            if fmt == 'gltf':  # zipped glTF when no .glb is offered
                p = p[:-4] + '.zip'
            with open(p + '.part', 'wb') as f:
                f.write(data)
            os.replace(p + '.part', p)
            return f'ok   {os.path.relpath(p, OUT)} {len(data) / 1e6:.1f} MB'
        except urllib.error.HTTPError as e:
            if e.code == 429:  # rate limited
                time.sleep(20 * (attempt + 1))
                continue
            if attempt == 3 or e.code in (401, 403, 404):
                raise RuntimeError(f'HTTP {e.code}')
            time.sleep(3)
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(3)
    raise RuntimeError('rate limited')


failed = []
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(download, m): m for m in MODELS}
    for f in futs:
        m = futs[f]
        try:
            print(f.result(), flush=True)
        except Exception as e:
            failed.append(m['uid'])
            print('ERR ', m['group'], m['name'], m['url'], e, flush=True)

lines = ['# Model Sketchfab (CC Attribution: phải ghi tên tác giả khi dùng)', '', '| Nhóm | Model | Tác giả | Giấy phép | Link |', '|---|---|---|---|---|']
lines += [f"| {m['group']} | {m['name']} | {m['author']} | {m['license']} | {m['url']} |" for m in MODELS]
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'CREDITS.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'done: {len(MODELS) - len(failed)} ok, {len(failed)} failed')
sys.exit(1 if failed else 0)
