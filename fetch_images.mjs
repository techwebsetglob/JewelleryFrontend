import https from 'https';
import fs from 'fs';

const fetchImages = (query) => new Promise((resolve) => {
  https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        resolve(json.results.map(r => r.urls.regular));
      } catch (e) {
        resolve([]);
      }
    });
  }).on('error', () => resolve([]));
});

async function run() {
  const rings = await fetchImages('diamond ring jewelry');
  const necklaces = await fetchImages('gold necklace jewelry');
  const bracelets = await fetchImages('diamond bracelet jewelry');
  const earrings = await fetchImages('diamond earrings jewelry');
  const sets = await fetchImages('luxury jewelry set');

  console.log(JSON.stringify({ rings, necklaces, bracelets, earrings, sets }, null, 2));
}

run();
