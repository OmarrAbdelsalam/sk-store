/**
 * Extract dominant color from an image
 */
export async function extractDominantColor(imageFile: File): Promise<{ hex: string; name: string; nameEn: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Resize image for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Count color frequencies
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Skip very dark or very light pixels (likely shadows or highlights)
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;

        // Round to nearest 10 to group similar colors
        const rRounded = Math.round(r / 10) * 10;
        const gRounded = Math.round(g / 10) * 10;
        const bRounded = Math.round(b / 10) * 10;

        const colorKey = `${rRounded},${gRounded},${bRounded}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }

      // Find most frequent color
      let maxCount = 0;
      let dominantColor = '0,0,0';

      for (const [color, count] of colorMap.entries()) {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = color;
        }
      }

      const [r, g, b] = dominantColor.split(',').map(Number);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const colorInfo = getColorName(r, g, b);

      resolve({ hex, name: colorInfo.name, nameEn: colorInfo.nameEn });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Get color name from RGB values
 */
function getColorName(r: number, g: number, b: number): { name: string; nameEn: string } {
  const colors = [
    { name: 'أحمر', nameEn: 'Red', r: 255, g: 0, b: 0 },
    { name: 'أزرق', nameEn: 'Blue', r: 0, g: 0, b: 255 },
    { name: 'أخضر', nameEn: 'Green', r: 0, g: 255, b: 0 },
    { name: 'أصفر', nameEn: 'Yellow', r: 255, g: 255, b: 0 },
    { name: 'برتقالي', nameEn: 'Orange', r: 255, g: 165, b: 0 },
    { name: 'بنفسجي', nameEn: 'Purple', r: 128, g: 0, b: 128 },
    { name: 'وردي', nameEn: 'Pink', r: 255, g: 192, b: 203 },
    { name: 'بني', nameEn: 'Brown', r: 165, g: 42, b: 42 },
    { name: 'رمادي', nameEn: 'Gray', r: 128, g: 128, b: 128 },
    { name: 'أسود', nameEn: 'Black', r: 0, g: 0, b: 0 },
    { name: 'أبيض', nameEn: 'White', r: 255, g: 255, b: 255 },
    { name: 'بيج', nameEn: 'Beige', r: 245, g: 245, b: 220 },
    { name: 'كحلي', nameEn: 'Navy', r: 0, g: 0, b: 128 },
    { name: 'فيروزي', nameEn: 'Turquoise', r: 64, g: 224, b: 208 },
    { name: 'سماوي', nameEn: 'Sky Blue', r: 135, g: 206, b: 235 },
    { name: 'زيتي', nameEn: 'Olive', r: 128, g: 128, b: 0 },
    { name: 'خمري', nameEn: 'Maroon', r: 128, g: 0, b: 0 },
  ];

  let minDistance = Infinity;
  let closestColor = colors[0];

  for (const color of colors) {
    const distance = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return { name: closestColor.name, nameEn: closestColor.nameEn };
}
