import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <main className="relative flex min-h-[120vh] w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img className="h-full w-full object-cover" alt="Cinematic background of molten gold being crafted" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChguw5Q5oZ9sgUuWQAo25v9XDL_96wpBbpLHcUzmDqmQ6tvfg28aKaki08l8uaow5XCvGc96MDAeAe4q4q1hhQBIX8FMaMBXL8tYfg8wWwaeph1jDhE4vMbbJWdKhRTuSKOFdtVxLHUu5U47rZIMFsxapP3WTjocalQYo0Eqpd7UpKzWllnpt0bfG-_Hgrf7ncQTuqRZbz3ire87eirpB6CM0085qtfPzeUGL9wXmEM8eByOXmezk16QVPlE5iw6wiG4qWxoldp9NZ" />
        <div className="hero-gradient-overlay absolute inset-0 z-20"></div>
      </div>

      <div className="float-element absolute left-[10%] top-[20%] z-30 opacity-20 md:opacity-40 animate-float-advanced" data-parallax-speed="0.15">
        <div className="h-20 w-20 md:h-32 md:w-32 rounded-full border-[0.5px] border-primary/50 blur-[2px] transform rotate-45"></div>
      </div>
      <div className="float-element absolute right-[15%] bottom-[25%] z-30 opacity-15 md:opacity-30 animate-float-advanced" data-parallax-speed="0.15">
        <div className="h-32 w-32 md:h-48 md:w-48 rounded-full border-[1px] border-primary/40 blur-[1px]"></div>
      </div>
      <div className="float-element absolute left-[20%] bottom-[15%] z-30 opacity-25 md:opacity-50 animate-float-advanced" data-parallax-speed="0.15">
        <span className="material-symbols-outlined text-primary text-4xl md:text-6xl opacity-20 rotate-12 blur-[1px]">pentagon</span>
      </div>

      <div className="relative z-40 flex flex-col items-center gap-8 px-6 text-center max-w-4xl mt-16 md:mt-0">
        <div className="flex flex-col gap-4">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-primary/80">Est. 1924 • Geneve</span>
          <h1 className="shimmer-gold font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-tight animate-fade-up">
            Timeless <br className="hidden sm:block" /> <span className="italic">Radiance</span>
          </h1>
          <p className="mx-auto max-w-xl text-base md:text-xl font-light leading-relaxed text-slate-100/90 scroll-reveal px-4" style={{ transitionDelay: '0.2s' }}>
            Experience the pinnacle of craftsmanship with our exclusive gold and diamond collection, forged in the heart of excellence.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 max-w-sm sm:max-w-none mx-auto">
          <Link to="/shop" className="btn-lux-primary group relative flex w-full sm:w-auto items-center justify-center rounded-full px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs btn-text-lux uppercase text-black transition-all scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <span>Explore Collection</span>
          </Link>
          <a href="/#consultation" className="btn-lux-secondary group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white/5 px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs btn-text-lux uppercase text-white backdrop-blur-md transition-all">
            <span>Book Private Session</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>

    </main>
  );
};

export default Hero;
