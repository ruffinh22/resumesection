#!/usr/bin/env python3
"""
Script pour convertir le logo SVG en PNG
"""

import os
import subprocess
from pathlib import Path

# Chemins
svg_path = '/home/lidruf/resumesection/frontend/public/church-logo-compact.svg'
png_path = '/home/lidruf/resumesection/frontend/public/church-logo-compact.png'

# Vérifier que le SVG existe
if not os.path.exists(svg_path):
    print(f"❌ SVG non trouvé: {svg_path}")
    exit(1)

# Essayer avec ImageMagick (convert)
try:
    result = subprocess.run([
        'convert',
        '-density', '150',
        '-background', 'none',
        svg_path,
        '-resize', '200x200',
        png_path
    ], capture_output=True, text=True, timeout=10)
    
    if result.returncode == 0 and os.path.exists(png_path):
        print(f"✅ Logo converti avec succès: {png_path}")
        print(f"   Taille: {os.path.getsize(png_path)} bytes")
        exit(0)
    else:
        print(f"❌ Erreur ImageMagick: {result.stderr}")
except FileNotFoundError:
    print("⚠️  ImageMagick (convert) non installé")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Essayer avec Inkscape
try:
    result = subprocess.run([
        'inkscape',
        '--export-type=png',
        '--export-width=200',
        '--export-height=200',
        f'--export-filename={png_path}',
        svg_path
    ], capture_output=True, text=True, timeout=10)
    
    if result.returncode == 0 and os.path.exists(png_path):
        print(f"✅ Logo converti avec succès: {png_path}")
        print(f"   Taille: {os.path.getsize(png_path)} bytes")
        exit(0)
    else:
        print(f"❌ Erreur Inkscape: {result.stderr}")
except FileNotFoundError:
    print("⚠️  Inkscape non installé")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Essayer avec Pillow + cairosvg
try:
    from PIL import Image
    import cairosvg
    import io
    
    png_buf = io.BytesIO()
    cairosvg.svg2png(url=svg_path, write_to=png_buf, output_width=200, output_height=200)
    png_buf.seek(0)
    
    with open(png_path, 'wb') as f:
        f.write(png_buf.getvalue())
    
    print(f"✅ Logo converti avec succès: {png_path}")
    print(f"   Taille: {os.path.getsize(png_path)} bytes")
    exit(0)
except ImportError:
    print("⚠️  cairosvg ou Pillow non installés")
except Exception as e:
    print(f"❌ Erreur cairosvg: {e}")

print("❌ Impossible de convertir le logo SVG")
print("Installez ImageMagick: sudo apt install imagemagick")
print("Ou Inkscape: sudo apt install inkscape")
print("Ou cairosvg: pip install cairosvg")
