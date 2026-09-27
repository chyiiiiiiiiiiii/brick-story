"""story.ending.photo -> public/ending.jpg + brick-mosaic colour grids in src/data/mosaic.json."""
import json, pathlib
from PIL import Image, ImageOps

root = pathlib.Path(__file__).resolve().parent.parent
story = json.loads((root / "story.json").read_text())
photo = (story.get("ending") or {}).get("photo")
grids = {}
if photo:
    im = ImageOps.exif_transpose(Image.open(root / photo)).convert("RGB")
    s = min(im.size)
    im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width - s) // 2 + s, (im.height - s) // 2 + s)).resize((1024, 1024), Image.LANCZOS)
    im.save(root / "public/ending.jpg", quality=92)
    for n in (14, 24, 40, 64):
        small = im.resize((n, n), Image.BOX)
        grids[str(n)] = ["#%02x%02x%02x" % small.getpixel((x, y)) for y in range(n) for x in range(n)]
    print("mosaic from", photo)
(root / "src/data/mosaic.json").write_text(json.dumps(grids))
