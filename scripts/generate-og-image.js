#!/usr/bin/env node

/**
 * Generate og-image.jpg (1200×630) from logo and brand colors
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

async function generateOgImage() {
  try {
    const sharp = require('sharp');

    // Brand colors
    const bgColor = { r: 26, g: 26, b: 26 }; // #1a1a1a (jet)
    const accentColor = { r: 220, g: 38, b: 38 }; // #dc2626 (red)
    const textColor = 'white';

    // Create SVG base
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#grad)" />

        <!-- Accent bar -->
        <rect x="0" y="0" width="1200" height="8" fill="#dc2626" />

        <!-- Main content area -->
        <g transform="translate(100, 80)">
          <!-- Logo area placeholder (will be replaced with actual logo) -->
          <rect x="0" y="0" width="200" height="200" fill="#2a2a2a" rx="8" />
        </g>

        <!-- Text content -->
        <g transform="translate(350, 120)">
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="white" letter-spacing="-2">
            Western Wheelcraft
          </text>
          <text x="0" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="40" fill="#999" letter-spacing="-0.5">
            BC's Wheel Refinishing Experts
          </text>
          <line x1="0" y1="140" x2="500" y2="140" stroke="#dc2626" stroke-width="3" />
          <text x="0" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#ccc">
            Premium Finishing • Fast Turnaround • Guaranteed Quality
          </text>
        </g>
      </svg>
    `;

    // Create og-image by rendering the SVG
    const buffer = Buffer.from(svg.trim());
    const outputPath = path.join(__dirname, '../public/og-image.jpg');

    await sharp(buffer, { density: 150 })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log('✅ og-image.jpg generated:', outputPath);
  } catch (error) {
    console.error('❌ Failed to generate og-image:', error.message);
    if (!require('module').builtinModules.includes('sharp')) {
      console.log('💡 Run: npm install --save-dev sharp');
    }
    process.exit(1);
  }
}

generateOgImage();
