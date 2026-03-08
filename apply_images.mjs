import fs from 'fs';

let rawData = fs.readFileSync('fetched_images.json', 'utf16le');
if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
const data = JSON.parse(rawData);

let seed = fs.readFileSync('src/utils/seedProducts.js', 'utf8');

// We know the exact structure of seedProducts.js having 12 products in this order:
// RINGS (5), NECKLACES (4), BRACELETS (3), EARRINGS (4), SETS (3) -> Wait, my previous seedProducts had 12 products total.
// RINGS: Celestial, Eternal, Rose, Midnight, Diamond Eternity, Sapphire Royale -> 6 Rings? 
// Let's count them in the previous view. 
// RINGS: 6, NECKLACES: 4, BRACELETS: 3, EARRINGS: 4, SETS: 3. Total = 20 products!
// I need to use the arrays from `data` sequentially.

const categories = [
  ...Array(6).fill('rings'),
  ...Array(4).fill('necklaces'),
  ...Array(3).fill('bracelets'),
  ...Array(4).fill('earrings'),
  ...Array(3).fill('sets'),
];

let globalIdx = 0;
let categoryCounters = { rings: 0, necklaces: 0, bracelets: 0, earrings: 0, sets: 0 };

seed = seed.replace(/images:\s*\[([\s\S]*?)\]/g, (match) => {
  const cat = categories[globalIdx];
  const urls = data[cat];
  const offset = categoryCounters[cat] * 4;
  const productImages = urls.slice(offset, offset + 4);
  
  categoryCounters[cat]++;
  globalIdx++;

  // In case Unsplash didn't return enough images, fallback to Picsum
  while (productImages.length < 4) {
    productImages.push(`https://picsum.photos/seed/${cat}${globalIdx}${productImages.length}/800/1000`);
  }

  return `images: [\n` + productImages.map(url => `      '${url}',`).join('\n') + `\n    ]`;
});

fs.writeFileSync('src/utils/seedProducts.js', seed);
console.log('Successfully updated seedProducts.js with new Unsplash images!');
