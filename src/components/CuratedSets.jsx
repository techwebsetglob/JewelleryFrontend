import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import DiscountBadge from './promos/DiscountBadge';

const CuratedSets = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", "sets"),
          limit(2)
        );
        const snapshot = await getDocs(q);
        const fetchedSets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSets(fetchedSets);
      } catch (error) {
        console.error("Error fetching sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  return (
    <section className="bg-background-dark section-spacing px-6 lg:px-20 border-t border-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2"></div>
      <div className="mx-auto max-w-[1440px] relative z-10">
        
        <div className="text-center mb-16 md:mb-24 scroll-reveal flex items-center justify-between flex-col md:flex-row gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-primary mb-2 md:mb-4 shimmer-gold">Curated Sets</h2>
            <p className="text-primary/60 uppercase tracking-[0.5em] text-[10px] md:text-sm">Harmony in Design</p>
          </div>
          <Link to="/shop?category=sets" className="btn-lux-primary px-8 py-3 rounded-sm text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-black border border-primary transition-all">
            Shop All Sets
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {loading ? (
            [1, 2].map((n) => (
              <div key={n} className={`glass-card-premium p-4 ${n === 2 ? 'mt-8 md:mt-24' : ''}`}>
                <div className="w-full aspect-video rounded-lg bg-white/5 animate-pulse"></div>
                <div className="py-8 px-4">
                  <div className="h-8 w-1/2 bg-white/5 animate-pulse rounded"></div>
                  <div className="h-4 w-1/3 bg-white/5 animate-pulse rounded mt-4"></div>
                </div>
              </div>
            ))
          ) : sets.length > 0 ? (
            sets.map((setObj, index) => (
              <Link 
                key={setObj.id} 
                to={`/shop/${setObj.id}`} 
                className={`glass-card-premium p-4 group scroll-reveal stagger-${index + 1} animate-float tilt-card block cursor-pointer ${index === 1 ? 'mt-8 md:mt-24' : ''}`}
              >
                <div className="overflow-hidden rounded-lg relative">
                  <img 
                    alt={setObj.name} 
                    className="w-full aspect-video object-cover transition-transform duration-1000 group-hover:scale-105" 
                    src={setObj.images?.[0]}
                    loading="lazy" 
                  />
                  
                  {/* Dynamic Promo Badge */}
                  <DiscountBadge product={setObj} />
                  
                  {/* Badge */}
                  {setObj.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg ${
                        setObj.badge === 'Sale' ? 'bg-red-500/90 text-white' :
                        setObj.badge === 'New' ? 'bg-white text-black font-bold' :
                        setObj.badge === 'Limited' ? 'bg-amber-700/90 text-white' :
                        'bg-primary text-black font-bold' // Bestseller
                      }`}>
                        {setObj.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Rating Pill (Top Right) */}
                  {setObj.rating > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[12px]">star</span>
                      <span className="text-white text-[10px] font-bold">{setObj.rating.toFixed(1)}</span>
                      <span className="text-slate-100/50 text-[10px]">({setObj.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
                <div className="py-6 md:py-8 px-4 flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl text-white scroll-reveal">{setObj.name}</h3>
                    <p className="text-primary/50 text-[10px] md:text-xs uppercase tracking-widest mt-2 scroll-reveal text-balance">
                      {setObj.includes || "Curated Collection"}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl opacity-0 group-hover:opacity-100 transition-opacity">arrow_right_alt</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 py-20 text-center w-full text-white/50">
              No curated sets found. Please run the seed script.
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default CuratedSets;
