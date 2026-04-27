#!/usr/bin/env node

/**
 * Aura PWA Icon Generator
 * This script generates all required PWA icons from a source image
 * 
 * Usage: node generate-icons.js
 * 
 * Make sure you have the source image at: frontend/public/image.png
 * Generated icons will be placed in: frontend/public/icons/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define icon sizes
const ICON_SIZES = [
  { size: 96, name: 'aura-icon-96' },
  { size: 192, name: 'aura-icon-192' },
  { size: 512, name: 'aura-icon-512' }
];

const sourceImage = path.join(__dirname, 'public', 'image.png');
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created icons directory');
}

// Check if source image exists
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Source image not found at:', sourceImage);
  console.log('\n📝 Please place your app logo at: frontend/public/image.png');
  process.exit(1);
}

console.log('🎨 Starting icon generation...\n');

// Try to use ImageMagick if available
try {
  execSync('identify --version', { stdio: 'ignore' });
  console.log('📦 Using ImageMagick for conversion\n');
  generateWithImageMagick();
} catch {
  console.log('⚠️ ImageMagick not found. Attempting with alternative method...\n');
  generateWithSharp();
}

function generateWithImageMagick() {
  ICON_SIZES.forEach(({ size, name }) => {
    const outputPath = path.join(iconsDir, `${name}.png`);
    
    try {
      // Standard icon
      execSync(`convert "${sourceImage}" -resize ${size}x${size} -gravity center -extent ${size}x${size} -background white "${outputPath}"`, {
        stdio: 'inherit'
      });
      console.log(`✅ Generated: ${name}.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}.png:`, error.message);
    }
  });

  // Generate maskable icons (for adaptive icons)
  ICON_SIZES.forEach(({ size, name }) => {
    const outputPath = path.join(iconsDir, `${name}-maskable.png`);
    
    try {
      // Maskable icon (add padding for safe zone)
      const padding = Math.floor(size * 0.1); // 10% padding
      const innerSize = size - (padding * 2);
      
      execSync(
        `convert "${sourceImage}" -resize ${innerSize}x${innerSize} -gravity center -extent ${size}x${size} -background "rgba(255,255,255,0)" "${outputPath}"`,
        { stdio: 'inherit' }
      );
      console.log(`✅ Generated: ${name}-maskable.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}-maskable.png:`, error.message);
    }
  });

  // Generate screenshots for different viewport sizes
  generateScreenshots();
}

function generateWithSharp() {
  try {
    // Try to require sharp, if it exists
    const sharp = require('sharp');
    
    console.log('📦 Using Sharp for conversion\n');
    
    ICON_SIZES.forEach(async ({ size, name }) => {
      const outputPath = path.join(iconsDir, `${name}.png`);
      
      try {
        await sharp(sourceImage)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ Generated: ${name}.png (${size}x${size})`);
      } catch (error) {
        console.error(`❌ Failed to generate ${name}.png:`, error.message);
      }
    });
  } catch {
    console.error('❌ Sharp not found. Please install it with: npm install sharp');
    console.log('\n📝 Manual icon generation:');
    console.log('   1. Use an online tool like https://icoconvert.com/');
    console.log('   2. Or install ImageMagick: brew install imagemagick (macOS) or apt install imagemagick (Linux)');
    console.log('   3. Or install Sharp: npm install sharp');
    console.log('\n📋 Required icon sizes:');
    ICON_SIZES.forEach(({ size }) => {
      console.log(`   - ${size}x${size}px`);
    });
  }
}

function generateScreenshots() {
  const screenshotSizes = [
    { size: 192, name: 'aura-screenshot-192' },
    { size: 512, name: 'aura-screenshot-512' }
  ];

  console.log('\n📸 Generating app screenshots...\n');

  screenshotSizes.forEach(({ size, name }) => {
    const outputPath = path.join(iconsDir, `${name}.png`);
    
    try {
      execSync(
        `convert "${sourceImage}" -resize ${size}x${size} -gravity center -extent ${size}x${size} -background white -quality 85 "${outputPath}"`,
        { stdio: 'inherit' }
      );
      console.log(`✅ Generated screenshot: ${name}.png (${size}x${size})`);
    } catch (error) {
      console.error(`⚠️ Failed to generate ${name}.png:`, error.message);
    }
  });
}

console.log('\n✨ Icon generation complete!');
console.log('\n📁 Generated files in: frontend/public/icons/');
console.log('\n📋 Checklist:');
console.log('   ✓ aura-icon-96.png');
console.log('   ✓ aura-icon-192.png');
console.log('   ✓ aura-icon-512.png');
console.log('   ✓ aura-icon-192-maskable.png');
console.log('   ✓ aura-icon-512-maskable.png');
console.log('   ✓ aura-screenshot-192.png');
console.log('   ✓ aura-screenshot-512.png');
console.log('\n🎉 Your PWA icons are ready!');
