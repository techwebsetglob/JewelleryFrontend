import { collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const products = [

  // ════════════════════════════════
  // 💍 RINGS
  // ════════════════════════════════

  {
    id: 'celestial-halo-ring',
    name: 'Celestial Halo Ring',
    category: 'rings',
    price: 4800,
    currency: 'USD',
    material: '18k White Gold',
    gemstone: 'Diamond (2ct Oval)',
    description: 'A breathtaking oval diamond surrounded by a celestial halo of pavé-set brilliants. Crafted in 18k white gold with hand-milgrain detailing on the band.',
    details: ['2ct oval center diamond', 'Pavé diamond halo', '18k white gold setting', 'Hand-milgrain band detail', 'Available in sizes 4–10'],
    images: [
      'https://plus.unsplash.com/premium_photo-1668285448242-3ba5568c2308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1662434923232-0164224dbdb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1605102062083-ae61a51393f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201688905-697730d24490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 8, featured: true, badge: 'Bestseller', rating: 4.9, reviewCount: 124,
  },

  {
    id: 'eternal-solitaire',
    name: 'Eternal Solitaire',
    category: 'rings',
    price: 6200,
    currency: 'USD',
    material: 'Platinum',
    gemstone: 'Diamond (1.5ct Round)',
    description: 'The pinnacle of diamond solitaire design. A 1.5ct round brilliant diamond elevated on a slim platinum band — timeless, perfect, eternal.',
    details: ['1.5ct round brilliant diamond', 'GIA certified stone', 'Platinum 950 band', 'Four-prong crown setting', 'Comfort fit band'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276169830-7bd1678b0c15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201688908-a4e75b6444e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201690245-fa87a9c6598e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201689079-179203c0be2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 5, featured: true, badge: null, rating: 5.0, reviewCount: 89,
  },

  {
    id: 'rose-aurora-band',
    name: 'Rose Aurora Band',
    category: 'rings',
    price: 2400,
    currency: 'USD',
    material: '18k Rose Gold',
    gemstone: 'Pink Sapphire',
    description: 'A romantic rose gold band adorned with a row of blush pink sapphires. The warm gold and delicate stones create an aurora of soft, feminine luxury.',
    details: ['7 oval pink sapphires', '18k rose gold band', 'Total sapphire weight 1.4ct', 'Polished finish', 'Available sizes 4–9'],
    images: [
      'https://plus.unsplash.com/premium_photo-1678749105251-b15e8fd164bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8ZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjkxNDEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201689583-3d3e6f4154f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629201690244-feabee5ca7ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1648564585735-19491888545c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 12, featured: true, badge: 'New', rating: 4.8, reviewCount: 56,
  },

  {
    id: 'midnight-emerald-ring',
    name: 'Midnight Emerald Ring',
    category: 'rings',
    price: 3900,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'Emerald (1.2ct)',
    description: 'Deep forest green Colombian emerald set in a bold yellow gold bezel. A statement of confidence and timeless sophistication.',
    details: ['1.2ct Colombian emerald', 'Deep green AAA grade', '18k yellow gold bezel', 'Diamond side stones', 'Certificate of authenticity'],
    images: [
      'https://plus.unsplash.com/premium_photo-1678749105286-9970ba61a724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTN8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695238856436-caaa0e926030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1662434921251-a6eba45ac40c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1669859129504-b5bd6f844ade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 6, featured: false, badge: 'Limited', rating: 4.7, reviewCount: 43,
  },

  {
    id: 'diamond-eternity-band',
    name: 'Diamond Eternity Band',
    category: 'rings',
    price: 5500,
    currency: 'USD',
    material: 'Platinum',
    gemstone: 'Diamond (Full Pavé)',
    description: 'A full circle of hand-set pavé diamonds in platinum. Representing endless love and infinite elegance — perfect as a wedding or anniversary band.',
    details: ['Full pavé diamond setting', '2.8ct total diamond weight', 'Platinum 950', 'Hand-set brilliants', 'Stackable design'],
    images: [
      'https://plus.unsplash.com/premium_photo-1678185086231-1cb3b362e86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTd8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1669859097642-b8dca596fd14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTh8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1669859130036-e84fed5b19c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTl8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1729751291840-3da5d4b56e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MjB8fGRpYW1vbmQlMjByaW5nJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 9, featured: false, badge: 'Bestseller', rating: 4.9, reviewCount: 201,
  },

  {
    id: 'sapphire-royale-ring',
    name: 'Sapphire Royale Ring',
    category: 'rings',
    price: 4200,
    currency: 'USD',
    material: '18k White Gold',
    gemstone: 'Blue Sapphire (1.8ct)',
    description: 'A Kashmir blue sapphire of extraordinary depth, cradled in a diamond-encrusted white gold halo. Inspired by royal jewelry traditions.',
    details: ['1.8ct Kashmir blue sapphire', 'Diamond halo surround', '18k white gold', 'Vintage-inspired milgrain', 'GIA sapphire report'],
    images: [
      'https://picsum.photos/seed/rings60/800/1000',
      'https://picsum.photos/seed/rings61/800/1000',
      'https://picsum.photos/seed/rings62/800/1000',
      'https://picsum.photos/seed/rings63/800/1000',
    ],
    inStock: true, stockCount: 7, featured: false, badge: 'Limited', rating: 4.8, reviewCount: 67,
  },

  // ════════════════════════════════
  // 📿 NECKLACES
  // ════════════════════════════════

  {
    id: 'diamond-tennis-necklace',
    name: 'Diamond Tennis Necklace',
    category: 'necklaces',
    price: 12500,
    currency: 'USD',
    material: 'Platinum',
    gemstone: 'Diamond (5ct total)',
    description: 'Fifty perfectly matched round brilliant diamonds set in platinum, creating a river of light around the neck. The ultimate statement of luxury.',
    details: ['5ct total diamond weight', '50 matched round brilliants', 'Platinum setting', '16-inch length + 2-inch extender', 'Safety clasp'],
    images: [
      'https://plus.unsplash.com/premium_photo-1661657759493-f21eb0d67e27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1611012756377-05e2e4269fa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115518-26f90aa61b97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1729518969102-affdd3ae6d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 3, featured: true, badge: 'Bestseller', rating: 5.0, reviewCount: 78,
  },

  {
    id: 'golden-star-pendant',
    name: 'Golden Star Pendant',
    category: 'necklaces',
    price: 1800,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'Diamond (0.5ct)',
    description: 'A six-pointed star pendant set with a brilliant 0.5ct diamond at its heart. Suspended on a delicate 18k gold chain — celestial, personal, luminous.',
    details: ['0.5ct center diamond', '18k yellow gold star', '18-inch chain included', 'Lobster clasp', 'Gift box included'],
    images: [
      'https://plus.unsplash.com/premium_photo-1661645433820-24c8604e4db5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1672646856394-ec0dd6a4ccec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 15, featured: true, badge: null, rating: 4.7, reviewCount: 112,
  },

  {
    id: 'sapphire-drop-pendant',
    name: 'Sapphire Drop Pendant',
    category: 'necklaces',
    price: 3400,
    currency: 'USD',
    material: '18k White Gold',
    gemstone: 'Blue Sapphire',
    description: 'A teardrop sapphire suspended in a diamond-set white gold frame. The deep blue stone catches light with extraordinary depth and brilliance.',
    details: ['Teardrop blue sapphire', 'Diamond frame setting', '18k white gold', '16-inch chain', 'Ceylon origin sapphire'],
    images: [
      'https://plus.unsplash.com/premium_photo-1661645449568-b470fda2e990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8Z29sZCUyMG5lY2tsYWNlJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1767921783351-b026a735f708?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1625792508300-0e1f913a3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1662434923031-b9bf1b6c10e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 8, featured: true, badge: 'Limited', rating: 4.9, reviewCount: 44,
  },

  {
    id: 'emerald-vine-necklace',
    name: 'Emerald Vine Necklace',
    category: 'necklaces',
    price: 4100,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'Emerald (0.9ct)',
    description: 'Inspired by garden vines, this necklace features a Colombian emerald nestled in an organic yellow gold setting with diamond-set leaf motifs.',
    details: ['0.9ct Colombian emerald', 'Leaf motif setting', '18k yellow gold', 'Diamond accents 0.3ct', '17-inch adjustable chain'],
    images: [
      'https://plus.unsplash.com/premium_photo-1764601209279-4fc9556a5c0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTN8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1672646858147-2f9ddb140191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1761210875101-1273b9ae5600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1767391255584-763f98ced9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fGdvbGQlMjBuZWNrbGFjZSUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 6, featured: false, badge: 'New', rating: 4.6, reviewCount: 29,
  },

  // ════════════════════════════════
  // 💛 BRACELETS
  // ════════════════════════════════

  {
    id: 'diamond-tennis-bracelet',
    name: 'Diamond Tennis Bracelet',
    category: 'bracelets',
    price: 9800,
    currency: 'USD',
    material: 'Platinum',
    gemstone: 'Diamond (4ct)',
    description: 'The iconic tennis bracelet reimagined — forty perfectly matched round brilliants in a seamless platinum setting. Grace and power on your wrist.',
    details: ['4ct total diamond weight', '40 matched round brilliants', 'Platinum 950', '7-inch length', 'Double lock safety clasp'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276170069-36fa70186f7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1689743801114-230453abfceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1663568675454-ecd65012d8f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1689397136362-dce64e557fcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 4, featured: true, badge: 'Bestseller', rating: 5.0, reviewCount: 156,
  },

  {
    id: 'gold-rope-bracelet',
    name: 'Gold Rope Bracelet',
    category: 'bracelets',
    price: 2200,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'None',
    description: 'A classically twisted rope bracelet in solid 18k yellow gold. Substantial, gleaming, and endlessly wearable — the foundation of any fine jewelry collection.',
    details: ['Solid 18k yellow gold', 'Rope twist design', '6.5mm width', '7.5-inch length', 'Box clasp with safety'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276169830-7bd1678b0c15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1770722272510-ef28c6f57541?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1763029513623-37d488cb97b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1564408000522-05af709fdd09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 20, featured: true, badge: null, rating: 4.7, reviewCount: 88,
  },

  {
    id: 'emerald-cuff',
    name: 'Emerald Statement Cuff',
    category: 'bracelets',
    price: 5200,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'Emerald',
    description: 'A bold sculptural cuff set with channel-set Colombian emeralds. This is jewelry as art — commanding, architectural, and utterly unforgettable.',
    details: ['Colombian emeralds 3ct total', 'Channel set design', '18k yellow gold cuff', 'Open cuff adjustable', 'Fits most wrist sizes'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276167992-6c9d6ab95a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8ZGlhbW9uZCUyMGJyYWNlbGV0JTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1750233894882-f22006b9fb44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fGRpYW1vbmQlMjBicmFjZWxldCUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1750233894512-79a2a8455e4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fGRpYW1vbmQlMjBicmFjZWxldCUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1750233894887-8d57739e8dd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fGRpYW1vbmQlMjBicmFjZWxldCUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 5, featured: false, badge: null, rating: 4.8, reviewCount: 37,
  },

  // ════════════════════════════════
  // 👂 EARRINGS
  // ════════════════════════════════

  {
    id: 'diamond-drop-earrings',
    name: 'Diamond Drop Earrings',
    category: 'earrings',
    price: 7400,
    currency: 'USD',
    material: 'Platinum',
    gemstone: 'Diamond (1.5ct each)',
    description: 'Cascading pear-shaped diamonds in a platinum setting, designed to catch every movement with maximum brilliance. Evening glamour perfected.',
    details: ['1.5ct pear diamond each', 'Platinum drops', 'Push-back closures', '1.5-inch drop length', 'GIA certified stones'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276170610-8d9264aaccd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771173652661-8245a9d94095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1770722272510-ef28c6f57541?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 6, featured: true, badge: 'Bestseller', rating: 4.9, reviewCount: 93,
  },

  {
    id: 'pearl-stud-classics',
    name: 'Pearl Stud Classics',
    category: 'earrings',
    price: 1800,
    currency: 'USD',
    material: '18k White Gold',
    gemstone: 'South Sea Pearls',
    description: 'Perfectly matched South Sea pearl studs in 18k white gold. The most elegant earrings ever conceived — timeless from the first wearing to the last.',
    details: ['10mm South Sea pearls', 'AAA lustre grade', '18k white gold posts', 'Butterfly push backs', 'Matched pair certificate'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276170598-8ad7feaf918e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1769151591224-2eee6793b885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1628872354761-c289e269092f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1590156118368-607652ab307a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 14, featured: true, badge: null, rating: 4.8, reviewCount: 147,
  },

  {
    id: 'sapphire-halo-studs',
    name: 'Sapphire Halo Studs',
    category: 'earrings',
    price: 3200,
    currency: 'USD',
    material: '18k White Gold',
    gemstone: 'Blue Sapphire',
    description: 'Ceylon blue sapphires encircled by micro-pavé diamond halos in white gold. The perfect balance of color and brilliance in stud form.',
    details: ['Ceylon blue sapphires 1.2ct total', 'Diamond halo 0.4ct total', '18k white gold', 'Screw back closures', 'GIA sapphire report'],
    images: [
      'https://plus.unsplash.com/premium_photo-1681276169830-7bd1678b0c15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8ZGlhbW9uZCUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwwfHx8fDE3NzI5MTQxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1761479258392-011cb2090063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115659-06a6cb5787eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1735480165343-96034e9528f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 10, featured: true, badge: 'Limited', rating: 4.9, reviewCount: 61,
  },

  {
    id: 'emerald-chandelier-earrings',
    name: 'Emerald Chandelier Earrings',
    category: 'earrings',
    price: 4900,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'Emerald',
    description: 'Multi-tiered chandelier earrings with Colombian emeralds and diamond accents. Each movement creates a cascade of green fire and white brilliance.',
    details: ['Colombian emeralds 2.4ct total', 'Diamond accents 0.6ct', '18k yellow gold', '2.5-inch drop', 'Push back closures'],
    images: [
      'https://plus.unsplash.com/premium_photo-1664790560090-cf22cb30437a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTN8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1590156118437-baa48141e3be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1693212793204-bcea856c75fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1770757587030-5c2c889fc36d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fGRpYW1vbmQlMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MHx8fHwxNzcyOTE0MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 4, featured: false, badge: 'New', rating: 4.7, reviewCount: 28,
  },

  // ════════════════════════════════
  // 💎 SETS
  // ════════════════════════════════

  {
    id: 'bridal-solitaire-suite',
    name: 'Bridal Solitaire Suite',
    category: 'sets',
    price: 18500,
    currency: 'USD',
    material: 'Platinum + Diamond',
    gemstone: 'Diamond',
    description: 'The complete bridal suite — solitaire ring, diamond pendant, and stud earrings in perfectly matched platinum and round brilliant diamonds.',
    details: ['Ring: 2ct round solitaire', 'Pendant: 0.5ct diamond', 'Earrings: 0.3ct each stud', 'All GIA certified', 'Presented in AURUM bridal box'],
    images: [
      'https://plus.unsplash.com/premium_photo-1740020266751-138ca2429cca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1765031069580-1ee9543c288f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 3, featured: true, badge: 'Bestseller', rating: 5.0, reviewCount: 52,
  },

  {
    id: 'golden-hour-set',
    name: 'Golden Hour Set',
    category: 'sets',
    price: 6800,
    currency: 'USD',
    material: '18k Yellow Gold',
    gemstone: 'None',
    description: 'Three pieces of pure 18k yellow gold — a chain necklace, rope bracelet, and hoop earrings — unified by warm, glowing craftsmanship.',
    details: ['Necklace: 18-inch gold chain', 'Bracelet: 7.5-inch rope', 'Earrings: 25mm hoops', 'All 18k yellow gold', 'Coordinated gift packaging'],
    images: [
      'https://plus.unsplash.com/premium_photo-1740020241476-be2394113f0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1770722272510-ef28c6f57541?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995116142-c626a962a682?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115867-4ef47c98824e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 8, featured: true, badge: null, rating: 4.8, reviewCount: 74,
  },

  {
    id: 'sapphire-royale-suite',
    name: 'Sapphire Royale Suite',
    category: 'sets',
    price: 11200,
    currency: 'USD',
    material: '18k White Gold + Sapphire',
    gemstone: 'Blue Sapphire',
    description: 'A coordinated suite of blue sapphire and diamond jewelry — ring, pendant, and earrings in 18k white gold. Inspired by royal jewelry collections.',
    details: ['Ring: 1.8ct sapphire halo', 'Pendant: 0.9ct sapphire drop', 'Earrings: 0.6ct sapphire studs', 'All Ceylon sapphires', 'Royal blue presentation box'],
    images: [
      'https://plus.unsplash.com/premium_photo-1664790560090-cf22cb30437a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8bHV4dXJ5JTIwamV3ZWxyeSUyMHNldHxlbnwwfHx8fDE3NzI5MTQxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1767391255584-763f98ced9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fGx1eHVyeSUyMGpld2VscnklMjBzZXR8ZW58MHx8fHwxNzcyOTE0MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995119744-6454f091303f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fGx1eHVyeSUyMGpld2VscnklMjBzZXR8ZW58MHx8fHwxNzcyOTE0MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758995115659-06a6cb5787eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fGx1eHVyeSUyMGpld2VscnklMjBzZXR8ZW58MHx8fHwxNzcyOTE0MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    inStock: true, stockCount: 4, featured: true, badge: 'Limited', rating: 4.9, reviewCount: 31,
  },

]

export const seedProducts = async () => {
  try {
    // Check if already seeded to prevent duplicate overwrites
    const existing = await getDocs(collection(db, 'products'))
    if (!existing.empty) {
      console.log(`[Seed] ${existing.size} products already exist. Skipping.`)
      return { success: false, message: 'Already seeded' }
    }

    // Batch write all products
    const batch = writeBatch(db)
    products.forEach(product => {
      const ref = doc(collection(db, 'products'), product.id)
      batch.set(ref, { ...product, createdAt: serverTimestamp() })
    })
    await batch.commit()

    console.log(`[Seed] ✅ ${products.length} products seeded successfully`)
    return { success: true, count: products.length }
  } catch (err) {
    console.error('[Seed] ❌ Failed:', err)
    return { success: false, error: err.message }
  }
}
