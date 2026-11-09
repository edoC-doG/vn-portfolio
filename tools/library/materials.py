# Makes the 512 px colour textures used by code-built structures (roads, walls, roofs, piers) from the asset library.
# Output: assets/textures/mat-<name>.jpg. Needs assets/library (python3 tools/library/fetch.py).
# Usage (from the repo root): python3 tools/library/materials.py
import glob
import os
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LIB = os.path.join(ROOT, 'assets', 'library', 'textures')
OUT = os.path.join(ROOT, 'assets', 'textures')
MATS = {
    'asphalt': 'road/asphalt_01', 'pavers': 'road/concrete_pavers', 'brick-floor': 'road/square_brick_paving',
    'concrete': 'road/concrete_floor_02', 'plaster': 'wall/painted_plaster_wall', 'plaster-old': 'wall/damaged_plaster',
    'white': 'wall/white_plaster_02', 'earth-wall': 'wall/clay_plaster', 'stone-wall': 'wall/broken_wall',
    'roof-tile': 'roof/roof_09', 'roof-moss': 'roof/roof_07', 'tin': 'roof/rusty_corrugated_iron', 'thatch': 'roof/thatch_roof_angled',
    'planks': 'wood/weathered_planks', 'painted-wood': 'wood/blue_painted_planks', 'red-soil': 'ground/red_laterite_soil_stones', 'sand-red': 'sand/red_sand', 'sand-white': 'sand/aerial_beach_01', 'grass': 'grass/Grass004', 'grass-dark': 'grass/Grass001',
}
for name, src in MATS.items():
    files = [f for f in glob.glob(os.path.join(LIB, src, '*')) if any(t in os.path.basename(f).lower() for t in ('diff', 'color'))]
    assert files, src
    Image.open(files[0]).convert('RGB').resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, f'mat-{name}.jpg'), quality=84, optimize=True)
    print('mat-' + name, os.path.getsize(os.path.join(OUT, f'mat-{name}.jpg')) // 1024, 'KB')
