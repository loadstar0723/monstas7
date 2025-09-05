const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// MONSTA 로고를 SVG로 생성
const createMonstaLogo = (size) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="#000000"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="url(#gradient)" opacity="0.2"/>
      <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size*0.25}px" font-weight="bold" fill="url(#gradient)" text-anchor="middle" dominant-baseline="middle">M</text>
      <circle cx="${size/2}" cy="${size/2}" r="${size*0.38}" fill="none" stroke="url(#gradient)" stroke-width="${size*0.02}"/>
    </svg>
  `;
  return Buffer.from(svg);
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const size of sizes) {
    const svgBuffer = createMonstaLogo(size);
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .png()
        .toFile(outputPath);
      console.log(`✅ 생성됨: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 실패: icon-${size}x${size}.png`, error);
    }
  }

  // Favicon 생성
  try {
    const faviconSvg = createMonstaLogo(32);
    await sharp(faviconSvg)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✅ 생성됨: favicon.ico');
  } catch (error) {
    console.error('❌ 실패: favicon.ico', error);
  }

  // 스크린샷 더미 이미지 생성 (실제 스크린샷으로 교체 필요)
  const screenshotSvg = `
    <svg width="540" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="540" height="720" fill="#000000"/>
      <text x="270" y="360" font-family="Arial" font-size="24" fill="#8B5CF6" text-anchor="middle">MONSTA Screenshot</text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(screenshotSvg))
      .png()
      .toFile(path.join(publicDir, 'screenshot1.png'));
    await sharp(Buffer.from(screenshotSvg))
      .png()
      .toFile(path.join(publicDir, 'screenshot2.png'));
    console.log('✅ 생성됨: 스크린샷 이미지');
  } catch (error) {
    console.error('❌ 실패: 스크린샷 이미지', error);
  }
}

generateIcons().catch(console.error);