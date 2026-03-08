import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import DiscountBadge from '../components/promos/DiscountBadge';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  
  const location = useLocation();

  useEffect(() => {
    // Check URL parameters for category filters (e.g. from CuratedSets `?category=sets`)
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [location]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = products.filter(product => {
    if (activeCategory === "all") return true;
    return product.category === activeCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      default:
        // "featured" or default newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    }
  });

  const categories = ["all", "rings", "necklaces", "bracelets", "earrings", "sets"];

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 pb-20 animate-fade-in">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-4 shimmer-gold">
            Our <span className="italic">Collection</span>
          </h1>
          <p className="text-primary/60 uppercase tracking-widest text-xs md:text-sm">
            Discover eternal elegance
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-primary/20 pb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${
                  activeCategory === category 
                    ? "bg-primary text-background-dark font-bold" 
                    : "glass-card-premium text-primary hover:bg-white/5 border border-primary/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative glass-card-premium border border-primary/20 rounded-full px-4 py-2 flex items-center">
            <span className="text-primary/60 text-xs uppercase mr-2 tracking-widest hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-primary text-xs uppercase tracking-wider outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="featured" className="bg-background-dark">Featured</option>
              <option value="price_asc" className="bg-background-dark">Price: Low to High</option>
              <option value="price_desc" className="bg-background-dark">Price: High to Low</option>
              <option value="newest" className="bg-background-dark">Newest Arrivals</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-primary/60 pointer-events-none text-sm">expand_more</span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="animate-pulse flex flex-col gap-4">
                <div className="bg-white/5 aspect-[3/4] rounded-xl w-full"></div>
                <div className="h-4 bg-white/5 w-3/4 rounded"></div>
                <div className="h-4 bg-white/5 w-1/4 rounded"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 glass-card-premium rounded-xl border border-primary/10">
            <span className="material-symbols-outlined text-4xl text-primary/40 mb-4 block">diamond</span>
            <h3 className="font-serif text-2xl text-primary mb-2">No Pieces Found</h3>
            <p className="text-primary/60 text-sm">Try adjusting your filters to discover more items.</p>
            <button 
              onClick={() => setActiveCategory("all")}
              className="mt-6 text-xs uppercase tracking-widest text-primary border-b border-primary pb-1"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <div key={product.id} className="glass-card-premium rounded-xl overflow-hidden cursor-pointer group flex flex-col tilt-card">
                {/* Image Section */}
                <Link to={`/shop/${product.id}`} className="relative h-48 w-full overflow-hidden bg-black/50 border-b border-primary/20 block">
                  {/* Primary Image */}
                  <img 
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:opacity-0" 
                    alt={product.name} 
                    src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/500`}
                    loading="lazy"
                  />
                  {/* Secondary Image (Hover) */}
                  <img 
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105" 
                    alt={`${product.name} alternate view`}
                    src={product.images?.[1] || product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/500`}
                    loading="lazy"
                  />
                  
                  {/* Dot indicators for multiple images */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                      {product.images.slice(0, 4).map((_, i) => (
                        <div 
                           key={i} 
                           className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                             i === 0 ? 'bg-primary group-hover:bg-white/40' : 
                             i === 1 ? 'bg-white/40 group-hover:bg-primary' : 
                             'bg-white/40'
                           }`} 
                        />
                      ))}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  
                  {/* Dynamic Promo Badge */}
                  <DiscountBadge product={product} />
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg ${
                        product.badge === 'Sale' ? 'bg-red-500/90 text-white' :
                        product.badge === 'New' ? 'bg-white text-black font-bold' :
                        product.badge === 'Limited' ? 'bg-amber-700/90 text-white' :
                        'bg-primary text-black font-bold'
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Rating Pill */}
                  {product.rating > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[12px]">star</span>
                      <span className="text-white text-[10px] font-bold">{product.rating.toFixed(1)}</span>
                      <span className="text-slate-100/50 text-[10px]">({product.reviewCount || 0})</span>
                    </div>
                  )}

                  {/* Hover "View Details" */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                     <span className="text-white text-xs uppercase tracking-widest border-b border-white/50 pb-1">View Details</span>
                  </div>
                </Link>

                {/* Info Section */}
                <div className="p-3 flex-1 flex flex-col justify-between group-hover:bg-primary/5 transition-colors duration-500">
                  <div>
                    <Link to={`/shop/${product.id}`} className="font-serif text-sm font-semibold text-white mb-1 line-clamp-2 hover:text-primary transition-colors block">{product.name}</Link>
                    <p className="text-primary/70 text-[10px] font-medium uppercase tracking-widest line-clamp-1">
                      {product.material} {product.gemstone && product.gemstone !== "None" && <><span className="text-white/30">|</span> {product.gemstone}</>}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between pt-2 mt-2">
                    <div className="flex flex-col">
                      {product.originalPrice && (
                        <span className="text-[10px] text-slate-100/40 line-through mb-0.5">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-primary font-serif font-bold text-sm">
                        ${product.price ? product.price.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
