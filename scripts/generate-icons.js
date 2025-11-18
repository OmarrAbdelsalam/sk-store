متام// Script to generate icons from logo
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

console.log('📝 Icon Generation Instructions:');
console.log('');
console.log('Please use an online tool or image editor to create the following icons from yhouse-logo.png:');
console.log('');
console.log('Required icons:');
console.log('1. favicon.ico (16x16, 32x32, 48x48) - Place in /public/');
console.log('2. icon-192.png (192x192) - Place in /public/');
console.log('3. icon-512.png (512x512) - Place in /public/');
console.log('4. apple-icon.png (180x180) - Place in /public/');
console.log('');
console.log('Recommended tools:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://favicon.io/');
console.log('- https://www.favicon-generator.org/');
console.log('');
console.log('Or use ImageMagick/Sharp locally:');
console.log('npm install sharp');
console.log('');

// Check if sharp is available
try {
  const sharp = require('sharp');
  console.log('✅ Sharp is installed! Generating icons...\n');
  
  const logoPath = path.join(__dirname, '../public/yhouse-logo.png');
  const publicPath = path.join(__dirname, '../public');

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-icon.png', size: 180 },
  ];

  Promise.all(
    sizes.map(({ name, size }) =>
      sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(publicPath, name))
        .then(() => console.log(`✅ Generated ${name}`))
    )
  )
    .then(() => {
      console.log('\n✅ All icons generated successfully!');
      console.log('⚠️  Note: favicon.ico needs to be generated separately using a favicon generator tool.');
    })
    .catch((err) => {
      console.error('❌ Error generating icons:', err);
    });

} catch (err) {
  console.log('⚠️  Sharp not installed. Install it with: npm install sharp');
  console.log('Or use online tools mentioned above.');
}
