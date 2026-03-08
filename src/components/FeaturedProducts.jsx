import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import DiscountBadge from './promos/DiscountBadge';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("featured", "==", true),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(fetched);
      } catch (error) {
        console.error("Error fetching featured pieces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleCardClick = (e, productId) => {
    // Navigate unless a button was clicked
    if (!e.target.closest('button')) {
      navigate(`/shop/${productId}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); // prevent navigation
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleView = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/shop/${productId}`);
  }

  return (
    <section className="bg-background-dark py-24 px-6 md:px-12 lg:px-20 section-spacing">
      <div className="mx-auto max-w-[1440px]">
        
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 shimmer-gold">Handpicked for You</h2>
          <p className="text-primary/60 uppercase tracking-[0.3em] text-[10px] md:text-xs">Featured Pieces</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {loading ? (
            // Skeleton Loader
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card-premium rounded-xl overflow-hidden min-h-[300px]">
                <div className="w-full h-48 bg-white/5 animate-pulse"></div>
                <div className="p-3">
                  <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-white/5 animate-pulse rounded"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div 
                key={product.id} 
                onClick={(e) => handleCardClick(e, product.id)}
                className={`glass-card-premium rounded-xl overflow-hidden scroll-reveal stagger-${(index % 3) + 1} cursor-pointer group flex flex-col`}
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-black/50 border-b border-primary/20">
                  {/* Primary Image */}
                  <img 
                    src={product.images?.[0] || ""} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:opacity-0"
                    loading="lazy"
                  />
                  {/* Secondary Image (Hover) */}
                  <img 
                    src={product.images?.[1] || product.images?.[0] || ""} 
                    alt={`${product.name} alternate view`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                    loading="lazy"
                  />
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
                        'bg-primary text-black font-bold' // Bestseller
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Rating Pill (Top Right) */}
                  {product.rating && (
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[12px]">star</span>
                      <span className="text-white text-[10px] font-bold">{product.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Hover Buttons */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex-1 bg-primary text-black font-bold text-xs py-1.5 px-3 uppercase tracking-widest rounded shadow-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                      Add to Cart
                    </button>
                    <button 
                      onClick={(e) => handleView(e, product.id)}
                      className="w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-md border border-primary/30 text-primary rounded hover:bg-primary/20 transition-colors"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-3 flex-1 flex flex-col justify-between group-hover:bg-primary/5 transition-colors duration-500">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-white mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-primary/70 text-[10px] font-medium uppercase tracking-widest line-clamp-1">
                      {product.material} <span className="text-white/30 truncate">|</span> {product.gemstone}
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
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center w-full text-white/50">
              No featured pieces found. Please run the seed script.
            </div>
          )}

        </div>
        
        {/* View All Button */}
        <div className="mt-16 text-center scroll-reveal">
           <Link to="/shop" className="inline-block text-[10px] md:text-sm font-bold text-primary border-b border-primary/30 pb-1 hover:border-primary transition-all">
             View Complete Catalog
           </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
