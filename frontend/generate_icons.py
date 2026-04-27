#!/usr/bin/env python3
"""
Aura PWA Icon Generator
Generates all required PWA icons from source image.png
Usage: python generate_icons.py
"""

import os
from PIL import Image

def generate_icons():
    """Generate all required icon sizes"""
    
    # Paths
    source_image = os.path.join('public', 'image.png')
    icons_dir = os.path.join('public', 'icons')
    
    # Create icons directory
    os.makedirs(icons_dir, exist_ok=True)
    print('✅ Icons directory ready\n')
    
    # Check source image
    if not os.path.exists(source_image):
        print(f'❌ Source image not found at: {source_image}')
        print('📝 Please ensure image.png exists in the public/ folder')
        return False
    
    print(f'📦 Opening source image: {source_image}')
    img = Image.open(source_image)
    print(f'   Image size: {img.size}, Mode: {img.mode}\n')
    
    # Icon sizes
    sizes = [96, 192, 512]
    
    try:
        # Generate standard icons with white background
        print('🎨 Generating standard icons...')
        for size in sizes:
            background = Image.new('RGB', (size, size), (255, 255, 255))
            img_copy = img.convert('RGBA')
            img_copy.thumbnail((size, size), Image.Resampling.LANCZOS)
            
            offset = (
                (size - img_copy.width) // 2,
                (size - img_copy.height) // 2
            )
            
            background.paste(img_copy, offset, img_copy)
            output_path = os.path.join(icons_dir, f'aura-icon-{size}.png')
            background.save(output_path, 'PNG')
            print(f'   ✅ aura-icon-{size}.png')
        
        # Generate maskable icons (transparent background, safe zone)
        print('\n🎨 Generating maskable icons (adaptive for Android)...')
        for size in sizes:
            background = Image.new('RGBA', (size, size), (255, 255, 255, 0))
            img_copy = img.convert('RGBA')
            
            # Safe zone: 80% of icon size (20% margin for adaptive display)
            safe_size = int(size * 0.8)
            img_copy.thumbnail((safe_size, safe_size), Image.Resampling.LANCZOS)
            
            offset = (
                (size - img_copy.width) // 2,
                (size - img_copy.height) // 2
            )
            
            background.paste(img_copy, offset, img_copy)
            output_path = os.path.join(icons_dir, f'aura-icon-{size}-maskable.png')
            background.save(output_path, 'PNG')
            print(f'   ✅ aura-icon-{size}-maskable.png')
        
        # Generate screenshots
        print('\n📸 Generating app screenshots...')
        for size in [192, 512]:
            background = Image.new('RGB', (size, size), (255, 255, 255))
            img_copy = img.convert('RGBA')
            img_copy.thumbnail((size, size), Image.Resampling.LANCZOS)
            
            offset = (
                (size - img_copy.width) // 2,
                (size - img_copy.height) // 2
            )
            
            background.paste(img_copy, offset, img_copy)
            output_path = os.path.join(icons_dir, f'aura-screenshot-{size}.png')
            background.save(output_path, 'PNG', quality=85)
            print(f'   ✅ aura-screenshot-{size}.png')
        
        print('\n✨ All icons generated successfully!')
        print(f'\n📁 Generated files in: {icons_dir}/')
        print('\n📋 Files created:')
        print('   • aura-icon-96.png')
        print('   • aura-icon-192.png')
        print('   • aura-icon-512.png')
        print('   • aura-icon-96-maskable.png')
        print('   • aura-icon-192-maskable.png')
        print('   • aura-icon-512-maskable.png')
        print('   • aura-screenshot-192.png')
        print('   • aura-screenshot-512.png')
        
        print('\n🚀 Next steps:')
        print('   1. npm run build')
        print('   2. npm run preview')
        print('   3. Test on different devices')
        print('   4. Deploy to production with HTTPS')
        
        return True
    
    except Exception as e:
        print(f'\n❌ Error generating icons: {e}')
        print('\n📝 Make sure you have PIL/Pillow installed:')
        print('   pip install Pillow')
        return False

if __name__ == '__main__':
    success = generate_icons()
    exit(0 if success else 1)
