import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/reviews/ReviewSection';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const nextImage = () => {
    if (product?.images?.length) {
      setActiveImage(i => (i + 1) % product.images.length);
    }
  };
  const prevImage = () => {
    if (product?.images?.length) {
      setActiveImage(i => (i - 1 + product.images.length) % product.images.length);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      setAddedToCart(false);
      setActiveImage(0);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          
          // Fetch related
          if (productData.category) {
            const q = query(
              collection(db, "products"), 
              where("category", "==", productData.category)
            );
            const relatedSnap = await getDocs(q);
            let related = relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id);
              
            // Randomize array
            related.sort(() => 0.5 - Math.random());
            setRelatedProducts(related.slice(0, 4)); // Get 4 random products
          }
        } else {
          setError("Piece not found.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/500`,
        category: product.category
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/500`,
        category: product.category
      });
      
      if (!currentUser) {
        navigate('/login?redirect=/checkout');
      } else {
        navigate('/checkout');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 animate-pulse flex flex-col md:flex-row gap-12 max-w-[1440px] mx-auto">
        <div className="w-full md:w-1/2 flex gap-4">
           {/* Thumbnails skeleton */}
           <div className="hidden md:flex flex-col gap-4 w-20 shrink-0">
             <div className="w-full aspect-[4/5] bg-white/5 rounded-lg"></div>
             <div className="w-full aspect-[4/5] bg-white/5 rounded-lg"></div>
           </div>
           {/* Main image skeleton */}
           <div className="flex-1 aspect-[4/5] bg-white/5 rounded-2xl"></div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-6 pt-10">
           <div className="h-10 bg-white/5 w-3/4 rounded"></div>
           <div className="h-6 bg-white/5 w-1/4 rounded"></div>
           <div className="h-32 bg-white/5 w-full rounded mt-8"></div>
           <div className="h-12 bg-white/5 w-full rounded mt-8"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background-dark pt-40 px-6 text-center">
        <h1 className="font-serif text-4xl text-primary mb-4">{error}</h1>
        <Link to="/shop" className="text-primary hover:text-white transition-colors border-b border-primary/30 pb-1">Return to Collection</Link>
      </div>
    );
  }

  // Stock logic
  let stockText = "In Stock";
  let stockColor = "text-green-400";
  if (!product.inStock) {
    stockText = "Currently Unavailable";
    stockColor = "text-red-400";
  } else if (product.stockCount && product.stockCount < 5) {
    stockText = `Only ${product.stockCount} left`;
    stockColor = "text-amber-500";
  }

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 pb-24 animate-fade-in relative z-10">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/50 mb-8 sm:mb-12">
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-primary truncate">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 mb-32">
          
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 h-fit md:sticky md:top-32">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl aspect-square"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,127,0.15)' }}>
              
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 items-start">
                {/* Badge */}
                {product.badge && (
                  <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg ${
                    product.badge === 'Sale' ? 'bg-red-500/90 text-white' :
                    product.badge === 'New' ? 'bg-white text-black font-bold' :
                    product.badge === 'Limited' ? 'bg-amber-700/90 text-white' :
                    'bg-primary text-black font-bold' // Bestseller
                  }`}>
                    {product.badge}
                  </span>
                )}
                {/* Rating */}
                {product.rating > 0 && (
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[14px]">star</span>
                    <span className="text-white text-xs font-bold">{product.rating.toFixed(1)}</span>
                    <span className="text-slate-100/50 text-[10px] ml-1">({product.reviewCount})</span>
                  </div>
                )}
              </div>

              <img
                src={product.images?.[activeImage] || `https://picsum.photos/seed/${product.id}/600/800`}
                alt={`${product.name} - view ${activeImage + 1}`}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{ transform: 'scale(1.01)' }}
              />

              {/* Navigation arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all z-10"
                          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,127,0.3)' }}>
                    <ChevronLeft size={18} className="text-[#D4AF7F]" />
                  </button>
                  <button onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all z-10"
                          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,127,0.3)' }}>
                    <ChevronRight size={18} className="text-[#D4AF7F]" />
                  </button>

                  {/* Image counter pill */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs text-[#D4AF7F] z-10 w-auto"
                       style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,127,0.2)' }}>
                    {activeImage + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative overflow-hidden rounded-xl aspect-square transition-all duration-200 hover:scale-105"
                    style={{
                      border: activeImage === i
                        ? '2px solid #D4AF7F'
                        : '2px solid rgba(212,175,127,0.15)',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                      style={{ opacity: activeImage === i ? 1 : 0.6, transition: 'opacity 0.2s' }}
                    />
                    {/* View label */}
                    <div className="absolute bottom-0 left-0 right-0 py-1 text-center"
                         style={{ background: 'rgba(0,0,0,0.6)', fontSize: '9px', color: '#D4AF7F', letterSpacing: '1px' }}>
                      {['HERO', 'DETAIL', 'STYLE', 'PACK'][i] || `VIEW ${i + 1}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            
            {/* Spec Chips (Material & Gemstone) */}
            <div className="flex flex-wrap gap-2 mb-4">
               {product.material && (
                 <span className="text-[10px] uppercase tracking-widest text-primary/80 border border-primary/30 px-3 py-1 rounded-full bg-primary/5">
                   {product.material}
                 </span>
               )}
               {product.gemstone && product.gemstone !== "None" && product.gemstone !== "Mixed" && (
                 <span className="text-[10px] uppercase tracking-widest text-primary/80 border border-primary/30 px-3 py-1 rounded-full bg-primary/5">
                   {product.gemstone}
                 </span>
               )}
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl md:text-6xl text-white mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="font-serif text-3xl lg:text-4xl text-primary shimmer-gold">${product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-lg text-slate-100/40 line-through mb-1">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="w-full h-[1px] bg-gradient-to-r from-primary/30 to-transparent mb-8"></div>
            
            <p className="text-slate-100/80 font-light leading-relaxed mb-8 text-sm md:text-base">
              {product.description}
            </p>

            {/* Checklist Details */}
            {product.details && product.details.length > 0 && (
              <ul className="flex flex-col gap-3 mb-10 text-sm text-slate-100/70 font-light">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2 mb-8">
               <span className="text-[10px] uppercase tracking-widest text-primary/50">Availability</span>
               <span className={`text-sm font-bold ${stockColor}`}>
                 {stockText}
               </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-4 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold transition-all rounded-sm flex items-center justify-center gap-2 ${
                  addedToCart 
                    ? 'bg-green-600/20 text-green-400 border border-green-500' 
                    : !product.inStock 
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                      : 'bg-transparent border border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                {addedToCart ? (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span>
                    Added
                  </>
                ) : !product.inStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    Add to Cart
                  </>
                )}
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`flex-[1.5] py-4 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold transition-all rounded-sm flex items-center justify-center gap-2 ${
                  !product.inStock 
                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    : 'btn-lux-primary text-black'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                {product.inStock ? `Buy at $${product.price?.toLocaleString()}` : 'Unavailable'}
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* You May Also Like (Related Products) */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-primary/10 pt-24">
            <h2 className="font-serif text-3xl md:text-4xl text-primary text-center mb-16 shimmer-gold">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(related => (
                <Link to={`/shop/${related.id}`} key={related.id} className="group flex flex-col gap-4 tilt-card cursor-pointer">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-primary/10 bg-black/40">
                    <img 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={related.name} 
                      src={related.images?.[0] || `https://picsum.photos/seed/${related.id}/400/500`} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="flex flex-col gap-1 px-2">
                     <p className="text-primary/70 text-[10px] uppercase tracking-widest line-clamp-1">{related.material}</p>
                     <div className="flex justify-between items-start gap-2">
                       <h3 className="font-serif text-lg text-slate-100 group-hover:text-primary transition-colors flex-1 line-clamp-1">{related.name}</h3>
                       <span className="text-primary font-serif font-bold whitespace-nowrap">${related.price?.toLocaleString()}</span>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
