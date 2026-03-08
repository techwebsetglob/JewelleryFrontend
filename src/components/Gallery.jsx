import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import DiscountBadge from './promos/DiscountBadge';

const Gallery = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("featured", "==", true),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured gallery products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="bg-background-dark py-16 md:py-24 px-6 md:px-12 lg:px-20 border-t border-primary/10 section-spacing">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-16 gap-4 border-b md:border-none border-primary/10 pb-6 md:pb-0">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary lg:text-5xl shimmer-gold scroll-reveal">Curated Masterpieces</h2>
            <p className="text-primary/60 uppercase tracking-widest text-[10px] md:text-xs scroll-reveal">Exquisite. Rare. Eternal.</p>
          </div>
          <Link to="/shop" className="text-[10px] md:text-sm font-bold text-primary border-b border-primary/30 pb-1 hover:border-primary transition-all self-start md:self-auto">View All Collections</Link>
        </div>
        
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-6 md:px-0 -mx-6 md:mx-0 pt-4">
          
          {loading ? (
            // Skeleton Loading State
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="min-w-[75vw] sm:min-w-[280px] flex-1 flex-col gap-4 md:gap-6 lg:min-w-[300px] snap-center md:snap-align-none">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/5 animate-pulse"></div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-6 w-3/4 bg-white/5 animate-pulse rounded"></div>
                  <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded mt-2"></div>
                </div>
              </div>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <Link key={product.id} to={`/shop/${product.id}`} className={`group flex min-w-[75vw] sm:min-w-[280px] flex-1 flex-col gap-4 md:gap-6 lg:min-w-[300px] scroll-reveal stagger-${(index % 4) + 1} tilt-card snap-center md:snap-align-none cursor-pointer`}>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl transition-all duration-700 hover:scale-[1.02]">
                  {/* Primary Image */}
                  <img 
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:opacity-0" 
                    alt={product.name} 
                    src={product.images?.[0] || ""} 
                    loading="lazy"
                  />
                  {/* Secondary Image (Hover) */}
                  <img 
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" 
                    alt={`${product.name} alternate view`}
                    src={product.images?.[1] || product.images?.[0] || ""} 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  
                  {/* Dynamic Promo Badge */}
                  <DiscountBadge product={product} />
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg ${
                        product.badge === 'Sale' ? 'bg-red-500/90 text-white' :
                        product.badge === 'New' ? 'bg-white text-black font-bold' :
                        product.badge === 'Limited' ? 'bg-amber-700/90 text-white' :
                        'bg-primary text-black font-bold' // Bestseller
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Rating Pill (Top Right) */}
                  {product.rating > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[12px]">star</span>
                      <span className="text-white text-[10px] font-bold">{product.rating.toFixed(1)}</span>
                      <span className="text-slate-100/50 text-[10px]">({product.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-xl text-slate-100 scroll-reveal truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-primary/70 text-[10px] font-medium uppercase tracking-widest scroll-reveal truncate max-w-[70%]">
                      {product.material} & {product.gemstone}
                    </p>
                    <p className="text-primary font-serif">${product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center w-full text-white/50">
              No featured products found. Did you seed the database?
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Gallery;
