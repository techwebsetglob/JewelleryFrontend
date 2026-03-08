import React from 'react';

const Heritage = () => {
  return (
    <section className="bg-background-dark section-spacing px-6 lg:px-20 border-t border-primary/5 relative">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center mb-16 md:mb-32 scroll-reveal">
          <h2 className="font-serif text-5xl lg:text-8xl text-primary shimmer-gold scroll-reveal">Our Heritage</h2>
          <p className="text-primary/60 uppercase tracking-[0.5em] text-xs md:text-sm mt-4 scroll-reveal">A Century of Brilliance</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary/10 -translate-x-1/2 shadow-[0_0_15px_rgba(212,175,127,0.3)] hidden md:block"></div>
          <div className="space-y-12 md:space-y-0 relative">
            <div className="flex flex-col md:flex-row items-center md:justify-start w-full md:mb-24">
              <div className="w-full md:w-5/12 scroll-reveal stagger-1">
                <div className="glass-card-premium p-6 md:p-8 rounded-xl relative">
                  <span className="font-serif text-4xl text-primary italic mb-4 block">1990</span>
                  <h4 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-widest scroll-reveal">The Founding</h4>
                  <p className="text-slate-100/60 leading-relaxed scroll-reveal">The AURUM atelier opens its doors in Geneva, founded on the principle of uncompromising craftsmanship and rare gemstone acquisition. Our debut 'Ethereal' signature collection set a new global standard for artisanal gold work.</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_#D4AF7F] hidden md:block"></div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:justify-end w-full md:mb-24">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_#D4AF7F] hidden md:block"></div>
              <div className="w-full md:w-5/12 scroll-reveal stagger-2">
                <div className="glass-card-premium p-6 md:p-8 rounded-xl md:text-right">
                  <span className="font-serif text-3xl md:text-4xl text-primary italic mb-4 block">2005</span>
                  <h4 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-widest scroll-reveal">Global Expansion</h4>
                  <p className="text-slate-100/60 leading-relaxed scroll-reveal">Opening of flagship boutiques in Paris, London, and New York, bringing the unique Swiss-gold aesthetic to the world stage. These years marked our rise to international acclaim, receiving multiple honors for design innovation in high jewelry.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:justify-start w-full md:mb-24">
              <div className="w-full md:w-5/12 scroll-reveal stagger-1">
                <div className="glass-card-premium p-6 md:p-8 rounded-xl">
                  <span className="font-serif text-3xl md:text-4xl text-primary italic mb-4 block">2015</span>
                  <h4 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-widest scroll-reveal">Award Winning Designs</h4>
                  <p className="text-slate-100/60 leading-relaxed scroll-reveal">Receiving the prestigious Grand Prix d'Horlogerie for excellence in high jewelry integration and technical mastery. This era saw the introduction of our patented 'Royal Gemstone' setting technique, redefining brilliance.</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_#D4AF7F] hidden md:block"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:justify-end w-full">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_#D4AF7F] hidden md:block"></div>
              <div className="w-full md:w-5/12 scroll-reveal stagger-3">
                <div className="glass-card-premium p-6 md:p-8 rounded-xl border-primary/40 md:text-right">
                  <span className="font-serif text-3xl md:text-4xl text-primary italic mb-4 block">2026</span>
                  <h4 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-widest scroll-reveal">The Future</h4>
                  <p className="text-slate-100/60 leading-relaxed scroll-reveal">Launching the 'Eternal Digital' collection, pioneering the fusion of blockchain-verified provenance with physical masterpiece jewelry. We continue our unwavering commitment to ethical sourcing while defining the future of digital-physical luxury.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heritage;
