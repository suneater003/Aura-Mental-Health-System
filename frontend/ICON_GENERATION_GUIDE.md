# 🎨 Aura PWA Icon Generation Guide

Your app logo (`image.png`) needs to be converted into multiple icon sizes for PWA support. Follow one of the methods below:

## 📋 Required Icon Sizes

- `aura-icon-96.png` (96×96px) - For app shortcuts
- `aura-icon-192.png` (192×192px) - Standard app icon
- `aura-icon-512.png` (512×512px) - Large app icon
- `aura-icon-192-maskable.png` (192×192px) - Adaptive icon (safe zone)
- `aura-icon-512-maskable.png` (512×512px) - Adaptive icon (safe zone)
- `aura-screenshot-192.png` (192×192px) - App screenshot
- `aura-screenshot-512.png` (512×512px) - App screenshot

---

## **Option 1: Automated Script (Recommended)**

### Prerequisites
Choose ONE of these tools:

#### A. ImageMagick (Best for Linux/macOS)
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (using choco)
choco install imagemagick
```

#### B. Sharp (Node.js)
```bash
cd frontend
npm install sharp
```

### Run the Generator
```bash
cd frontend
node generate-icons.js
```

This will automatically create all required icons in `frontend/public/icons/`

---

## **Option 2: Online Icon Generator (Fastest)**

1. Visit: https://icoconvert.com/
2. Upload your `image.png`
3. Select "PNG" format
4. Download icons for sizes: 96px, 192px, 512px
5. Save them to `frontend/public/icons/` with these exact names:
   - `aura-icon-96.png`
   - `aura-icon-192.png`
   - `aura-icon-512.png`

---

## **Option 3: Manual ImageMagick Commands**

```bash
cd frontend

# Create icons directory
mkdir -p public/icons

# Generate standard icons
convert public/image.png -resize 96x96 -gravity center -extent 96x96 -background white public/icons/aura-icon-96.png
convert public/image.png -resize 192x192 -gravity center -extent 192x192 -background white public/icons/aura-icon-192.png
convert public/image.png -resize 512x512 -gravity center -extent 512x512 -background white public/icons/aura-icon-512.png

# Generate maskable icons (for adaptive icons on Android)
convert public/image.png -resize 172x172 -gravity center -extent 192x192 -background "rgba(255,255,255,0)" public/icons/aura-icon-192-maskable.png
convert public/image.png -resize 460x460 -gravity center -extent 512x512 -background "rgba(255,255,255,0)" public/icons/aura-icon-512-maskable.png

# Generate screenshots
convert public/image.png -resize 192x192 -gravity center -extent 192x192 -background white -quality 85 public/icons/aura-screenshot-192.png
convert public/image.png -resize 512x512 -gravity center -extent 512x512 -background white -quality 85 public/icons/aura-screenshot-512.png
```

---

## **Option 4: Python PIL/Pillow Script**

Create a file `generate_icons.py`:

```python
#!/usr/bin/env python3
from PIL import Image
import os

# Create icons directory
os.makedirs('public/icons', exist_ok=True)

# Open source image
img = Image.open('public/image.png')

# Icon sizes
sizes = [96, 192, 512]

# Generate standard icons
for size in sizes:
    # Create a white background
    background = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    
    # Resize image maintaining aspect ratio
    img_copy = img.copy()
    img_copy.thumbnail((size, size), Image.Resampling.LANCZOS)
    
    # Calculate position to center the image
    offset = ((size - img_copy.width) // 2, (size - img_copy.height) // 2)
    
    # Paste onto background
    background.paste(img_copy, offset, img_copy if img_copy.mode == 'RGBA' else None)
    background.convert('RGB').save(f'public/icons/aura-icon-{size}.png')
    print(f'✅ Generated: aura-icon-{size}.png')

# Generate maskable icons
for size in sizes:
    inner_size = int(size * 0.9)  # 90% of full size for safe zone
    
    background = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    img_copy = img.copy()
    img_copy.thumbnail((inner_size, inner_size), Image.Resampling.LANCZOS)
    
    offset = ((size - img_copy.width) // 2, (size - img_copy.height) // 2)
    background.paste(img_copy, offset, img_copy if img_copy.mode == 'RGBA' else None)
    background.save(f'public/icons/aura-icon-{size}-maskable.png')
    print(f'✅ Generated: aura-icon-{size}-maskable.png')

print('\n✨ All icons generated successfully!')
```

Run it:
```bash
cd frontend
python3 generate_icons.py
```

---

## **Verification Checklist**

After generating icons, verify:

```bash
cd frontend/public/icons
ls -la

# Should show:
# aura-icon-96.png
# aura-icon-192.png
# aura-icon-512.png
# aura-icon-192-maskable.png
# aura-icon-512-maskable.png
# aura-screenshot-192.png
# aura-screenshot-512.png
```

---

## **Troubleshooting**

### "command not found: convert"
- Install ImageMagick (see Prerequisites above)
- Or use Option 1B (Sharp) or Option 2 (Online tool)

### Icons look blurry
- Your source image might be low quality
- Try using a higher resolution source image
- Or adjust the resize algorithm in the script

### Maskable icons not working
- Ensure padding/safe zone is properly applied (10-20% margin)
- Test on Android devices for best results

### Icons not showing in PWA
- Verify file paths in `vite.config.js` match actual files
- Clear browser cache and rebuild: `npm run build`
- Check DevTools Application → Manifest for icon URLs

---

## **Next Steps**

Once you have generated all icons:

1. ✅ Icons are in `frontend/public/icons/`
2. 🔨 Build the app: `npm run build`
3. 📱 Test PWA installation on different devices
4. 🚀 Deploy to production

---

**Need help?** Check the generated icons:
- All should be 96×96, 192×192, or 512×512 pixels
- Standard icons have white backgrounds
- Maskable icons have transparent backgrounds with proper safe zones
