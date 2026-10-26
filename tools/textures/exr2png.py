# Converts a Poly Haven EXR map (normal, roughness) to an 8-bit PNG so sharp can read it.
# Usage: python3 exr2png.py in.exr out.png   (needs: pip install OpenEXR numpy pillow)
import sys
import numpy as np
import OpenEXR
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
with OpenEXR.File(src) as f:
    ch = f.channels()
    a = ch['RGB'].pixels if 'RGB' in ch else np.dstack([ch[c].pixels for c in 'RGB'])
a = np.clip(np.asarray(a, dtype=np.float32), 0.0, 1.0)  # normal maps are stored as plain 0..1 values, no sRGB curve
Image.fromarray((a * 255.0 + 0.5).astype(np.uint8)).save(dst)
