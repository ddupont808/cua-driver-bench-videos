"""encode.py NAME POSTER_SECONDS OUTFILE_BASENAME [OUTDIR]
frames: renders/frames/NAME/f_%05d.png (60 fps) + renders/NAME.wav -> OUTDIR/BASENAME.mp4 (5 Mbps H.264, AAC) and BASENAME.jpg.
The poster is a settled frame that also replaces frame 0 (duration and audio sync unchanged)."""
import sys, shutil, subprocess
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
name, ps, base = sys.argv[1], float(sys.argv[2]), sys.argv[3]
out = Path(sys.argv[4]) if len(sys.argv) > 4 else ROOT / 'renders' / 'out'
out.mkdir(parents=True, exist_ok=True)
F = ROOT / 'renders' / 'frames' / name
src = F / f'f_{int(round(ps * 60)):05d}.png'
Image.open(src).convert('RGB').save(out / f'{base}.jpg', quality=95)
f0 = F / 'f_00000.png'; keep = F / 'f_00000_original.png'
if not keep.exists(): shutil.copy(f0, keep)
shutil.copy(src, f0)
try:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '60', '-i', str(F / 'f_%05d.png'), '-i', str(ROOT / 'renders' / f'{name}.wav'),
                    '-c:v', 'libx264', '-preset', 'slow', '-b:v', '5M', '-maxrate', '7M', '-bufsize', '10M', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
                    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-movflags', '+faststart', '-shortest', str(out / f'{base}.mp4')], check=True)
finally:
    shutil.copy(keep, f0)
print('wrote', out / f'{base}.mp4')
