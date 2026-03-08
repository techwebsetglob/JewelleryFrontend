import React from 'react';

const Craftsmanship = () => {
  return (
    <>
      <section className="bg-background-dark section-spacing px-6 lg:px-20 border-t border-primary/5">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2 scroll-reveal w-full">
              <div className="relative">
                <img alt="Artisanal Process" className="w-full h-[400px] md:h-[700px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-1000" data-parallax-speed="0.05" loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjoBAXXFu_9mF_67XxRHwiUAEa8DyCyvN5-cRoRfF80dny8bapn8DNZrom7QfeI5BDFeqSfxO7qllG-nFYcHxOLu64MPVfLGBNRQVr2oT61CC0br8HqcJWcSNAlKc7w8HrF2nujchuerA-Br87pQk-VVHFWREIAGwtqlRvJY_2lXFMSWlCXEXAZGCG51H8C2imw9Q9zkbAlJ0HqgFNc5lO9Q6WmEk3cCmQIMG13KoY2HNdBM98jFVNinItZd2-rwt2Q3jPJLvA_7H4" />
                <div className="absolute -bottom-8 right-0 md:-bottom-10 md:-right-10 w-48 sm:w-52 md:w-64 h-auto md:h-80 glass-card-premium p-4 md:p-8 scroll-reveal stagger-2 animate-float">
                  <span className="text-primary text-2xl md:text-4xl font-serif italic">1924</span>
                  <p className="text-[10px] md:text-sm text-slate-100/60 mt-2 md:mt-4 uppercase tracking-widest leading-relaxed md:leading-loose scroll-reveal">Born in Geneve, perfected over a century of silent dedication to the craft.</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex flex-col gap-8 md:gap-12 scroll-reveal stagger-3 mt-12 lg:mt-0">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-8xl text-slate-100 leading-tight shimmer-gold scroll-reveal">The Art of <br/><span className="text-primary">Precision</span></h2>
              <div className="space-y-12">
                <div className="group">
                  <div className="flex items-center gap-6 mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl">verified</span>
                    <h4 className="text-2xl font-serif text-slate-100 scroll-reveal">Ethical Sourcing</h4>
                  </div>
                  <p className="text-slate-100/50 text-lg leading-relaxed border-l border-primary/20 pl-6 scroll-reveal">Only the finest conflict-free diamonds, certified by global ethical standards, ensuring every sparkle carries a clean conscience.</p>
                </div>
                <div className="group">
                  <div className="flex items-center gap-6 mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl">precision_manufacturing</span>
                    <h4 className="text-2xl font-serif text-slate-100 scroll-reveal">Master Goldsmiths</h4>
                  </div>
                  <p className="text-slate-100/50 text-lg leading-relaxed border-l border-primary/20 pl-6 scroll-reveal">Decades of expertise in every weld, combining ancient techniques passed through generations with modern technical precision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-dark py-24 px-6 lg:px-20 border-t border-primary/5">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-slate-100 lg:text-6xl shimmer-gold scroll-reveal">The Art of <br/>Precision</h2>
                <p className="text-base md:text-lg font-light text-slate-100/70 max-w-md scroll-reveal">Every piece tells a story of heritage and relentless precision, crafted by masters of the forge.</p>
              </div>
              <div className="space-y-8">
                <div className="flex gap-6 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">verified</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 mb-1 scroll-reveal">Ethical Sourcing</h4>
                    <p className="text-sm text-slate-100/60 leading-relaxed scroll-reveal">Only the finest conflict-free diamonds, certified by global ethical standards.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 mb-1 scroll-reveal">Master Goldsmiths</h4>
                    <p className="text-sm text-slate-100/60 leading-relaxed scroll-reveal">Decades of expertise in every weld, combining ancient techniques with modern tech.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 mb-1 scroll-reveal">Lifetime Warranty</h4>
                    <p className="text-sm text-slate-100/60 leading-relaxed scroll-reveal">A promise of eternal brilliance and maintenance for generations to come.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-4 mt-8 lg:mt-0">
              <div className="space-y-2 md:space-y-4">
                <img className="rounded-xl w-full h-[200px] md:h-[300px] object-cover" alt="Jeweler at work table with tools" loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjoBAXXFu_9mF_67XxRHwiUAEa8DyCyvN5-cRoRfF80dny8bapn8DNZrom7QfeI5BDFeqSfxO7qllG-nFYcHxOLu64MPVfLGBNRQVr2oT61CC0br8HqcJWcSNAlKc7w8HrF2nujchuerA-Br87pQk-VVHFWREIAGwtqlRvJY_2lXFMSWlCXEXAZGCG51H8C2imw9Q9zkbAlJ0HqgFNc5lO9Q6WmEk3cCmQIMG13KoY2HNdBM98jFVNinItZd2-rwt2Q3jPJLvA_7H4" />
                <img className="rounded-xl w-full h-[150px] md:h-[200px] object-cover" alt="Close up of a gold ring being polished" loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjJk9bsNpq7vt3QWfN8J075NOytgQsyAgDLLS44T_KWkyvwX9Hw12ZBTFkJ77fN66HI__KAJxHV9wnqhatBXQeiGnRHvpZzD2q5LGZQla_S6Hs1GODKvE_JUy7YwmU8WKVeox20g6tn-55yhrA71IQZk4c61YJ6vaBnWbdxLCOQWiRmBiJjAT63cF4b66XKafEAXHcD7T7Eevnf4ukXW33sO7C_lPy4lMh5kzUVemLprmvjmKNHFzMK4I1Z57O5l2vlRGz-T5YXfqz" />
              </div>
              <div className="pt-8 md:pt-12 space-y-2 md:space-y-4">
                <img className="rounded-xl w-full h-[150px] md:h-[200px] object-cover" alt="Sparkling loose diamonds on a velvet cloth" loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1CDQqg-qfOmuydZ-kh_0on-jGrZh4iV5tM3aME21qulQr9Qg1OztcQohIzqXPAsa_xZtHPaJdLnI-3oqBKlA9ToidO8HUabmZLkiYBWO673nB9EGFmhXjKeNMsWNxScZXPXv5v15ujdEpTCc8N2x3vimZRcGzzmEhdU-f1LE7SY2UbFrWfbzsh1oBL11iQ6DzjULp6527FL6i3gQ96cVawfoawmSHI4F8t7g5kc-J1pIPrBMktw8RrQAtTLDW7mQ12iA7ULTBWjSB" />
                <img className="rounded-xl w-full h-[200px] md:h-[300px] object-cover" alt="Beautifully designed golden necklace" loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDVNTAwm9cp10g5aXkWlnSiLaKrIWSvRqIdGrIFQh-EsSZ9_4ohTX11DirXTmHX-T2_xcHgTHGqTWjrMKhSIrxgyQTrgZmHYNIlN4Hwn4ikyg88_s1pNk9elHTBkh0G2SLV77olBZRgUOcmDUj_SGPKGqgIHjDVaAvJYy9kKU-nB-Z8hIu4HQIIwE5GUk18PGv_gK9DHTRUVwgjofEWlh6uBY-KRZtQAZe6rtib4pNfNHThw3EWZjad6KSH_le5vthEqCxKl9dsgFJ" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Craftsmanship;
