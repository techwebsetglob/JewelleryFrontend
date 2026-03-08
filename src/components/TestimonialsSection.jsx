import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import StarRating from './reviews/StarRating';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Find 5-star reviews. 
        // We fetch the most recent 20, sort by helpful client-side to get top 6.
        const q = query(
          collection(db, 'reviews'),
          where('rating', '==', 5),
          where('reported', '==', false),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by helpful length descending
        fetched.sort((a, b) => {
          const aHelp = a.helpful?.length || 0;
          const bHelp = b.helpful?.length || 0;
          return bHelp - aHelp; // descending
        });

        const topReviews = fetched.slice(0, 6);

        // Fetch product names for these reviews
        const withProducts = await Promise.all(topReviews.map(async (rev) => {
          try {
            const prodRef = await getDocs(query(collection(db, 'products'), where('__name__', '==', rev.productId)));
            if (!prodRef.empty) {
               rev.productName = prodRef.docs[0].data().name;
            } else {
               rev.productName = "Aurum Piece";
            }
          } catch (e) {
             rev.productName = "Aurum Piece";
          }
          return rev;
        }));

        setTestimonials(withProducts);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const slideCount = testimonials.length;

  // Auto-rotate
  useEffect(() => {
    if (slideCount === 0 || isHovered) return;
    
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, 4000);

    return () => clearInterval(timerRef.current);
  }, [slideCount, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="bg-background-dark py-24 border-t border-primary/20 section-spacing overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
        
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 shimmer-gold">Words from Clients</h2>
          <p className="text-primary/60 uppercase tracking-[0.3em] text-[10px] md:text-xs">Experiences with Aurum</p>
        </div>

        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Controls */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-10 h-10 rounded-full border border-primary/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-primary hover:bg-white hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-10 h-10 rounded-full border border-primary/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-primary hover:bg-white hover:text-black transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden px-4 md:px-0 py-4">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (window.innerWidth < 1024 ? 100 : 33.333)}%)` }}
            >
              {testimonials.map((review, idx) => {
                const bodyPreview = review.body?.length > 120 ? review.body.slice(0, 120) + '...' : review.body;
                
                return (
                  <div key={idx} className="w-full lg:w-1/3 shrink-0 px-4">
                    <div className="glass-card-premium border border-primary/20 rounded-2xl p-8 h-full flex flex-col items-center text-center group hover:bg-white/[0.03] transition-colors relative">
                      
                      <div className="absolute top-4 right-4 text-primary/10">
                        <span className="material-symbols-outlined text-5xl">format_quote</span>
                      </div>

                      <div className="w-16 h-16 mb-4 rounded-full overflow-hidden bg-white/5 border border-primary/30 flex items-center justify-center shrink-0">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-2xl text-primary">{getInitials(review.userName)}</span>
                        )}
                      </div>
                      
                      <StarRating value={review.rating} size="sm" className="mb-6 justify-center" />
                      
                      <p className="text-sm text-slate-100/80 leading-relaxed font-light mb-8 italic flex-1">
                        "{bodyPreview}"
                      </p>

                      <div className="mt-auto w-full pt-6 border-t border-primary/10">
                        <p className="text-white text-sm font-medium mb-1">{review.userName}</p>
                        <Link to={`/shop/${review.productId}`} className="text-[10px] uppercase tracking-widest text-primary/70 hover:text-primary transition-colors border-b border-transparent hover:border-primary/50">
                          {review.productName}
                        </Link>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/60'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
