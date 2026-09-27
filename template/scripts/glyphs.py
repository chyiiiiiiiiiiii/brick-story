"""Rasterise every textWall("...") used in src/scenes into brick bitmaps -> src/data/glyphs.json."""
import json, pathlib, re, sys
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path(__file__).resolve().parent.parent
FONTS = {  # name -> [(path, index)], first existing wins
    "futura": [("/System/Library/Fonts/Supplemental/Futura.ttc", 2), ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0)],
    "helvetica": [("/System/Library/Fonts/HelveticaNeue.ttc", 1), ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0)],
    "heiti": [("/System/Library/Fonts/STHeiti Medium.ttc", 0), ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 0)],
}
CALL = re.compile(r'textWall\(\s*"([^"]+)"([^;]*?)\)\s*[,;\]\)]', re.S)


def font(name):
    for path, idx in FONTS.get(name, FONTS["futura"]):
        if pathlib.Path(path).exists():
            return ImageFont.truetype(path, 400, index=idx)
    sys.exit(f"no font file found for {name}")


def raster(text, fname, rows, thresh=0.42):
    f = font(fname)
    x0, y0, x1, y1 = f.getbbox(text)
    img = Image.new("L", (int(x1 - x0 + 40 + 30 * len(text)), int(y1 - y0 + 40)), 0)
    d = ImageDraw.Draw(img)
    x = 20 - x0
    for ch in text:
        d.text((x, 20 - y0), ch, font=f, fill=255)
        x += f.getlength(ch) + 30
    img = img.crop(img.getbbox())
    cols = max(1, round(img.width / img.height * rows * (0.96 / 0.8)))  # bricks are taller than they are wide
    small = img.resize((cols, rows), Image.BOX)
    return ["".join("#" if small.getpixel((c, r)) / 255 > thresh else "." for c in range(cols)) for r in range(rows)]


out = {}
for f in sorted((root / "src/scenes").glob("*.tsx")):
    for m in CALL.finditer(f.read_text()):
        text, rest = m.group(1), m.group(2)
        rows = int(re.search(r"rows:\s*(\d+)", rest).group(1)) if "rows:" in rest else 9
        fname = re.search(r'font:\s*"(\w+)"', rest).group(1) if "font:" in rest else "futura"
        out[f"{text}|{rows}|{fname}"] = raster(text, fname, rows)
(root / "src/data/glyphs.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
for k, v in out.items():
    print(f"{k}: {len(v[0])} studs wide")
