import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import FeaturedProducts from '../components/FeaturedProducts';
import Craftsmanship from '../components/Craftsmanship';
import Heritage from '../components/Heritage';
import CuratedSets from '../components/CuratedSets';
import Consultation from '../components/Consultation';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import Lenis from '@studio-freight/lenis';

const Home = () => {
  useEffect(() => {
    const container = document.querySelector('.snap-container');
    const content = document.querySelector('.snap-content');
    
    // Initialize Lenis on the container — tuned for cinematic luxury scrolling
    const lenis = new Lenis({
      wrapper: container,
      content: content,
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.8,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => {
      const reveals = document.querySelectorAll('.scroll-reveal');
      reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 100;
        if (revealTop < windowHeight - revealPoint) {
          reveal.classList.add('active');
          if (reveal.classList.contains('shimmer-gold')) {
            reveal.classList.add('heading-shimmer-active');
          }
        }
      });

      const parallaxes = document.querySelectorAll('[data-parallax-speed]');
      parallaxes.forEach(el => {
        const speed = el.getAttribute('data-parallax-speed');
        const rect = el.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - rect.top) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    };

    // Throttled scroll handler — avoids running DOM reads every frame
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    if (container) {
      container.addEventListener('scroll', throttledScroll, { passive: true });
    }
    // Trigger once on load
    handleScroll();

    // Intersection Observer for Section Reveals
    // IMPORTANT: root must be the snap-container since it's the scroll container, not the viewport
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { 
      root: container,
      threshold: 0.01,
      rootMargin: "0px 0px -50px 0px"
    });

    const snapSections = document.querySelectorAll('.snap-section');
    // Make the first section (Hero) visible immediately since it's above the fold
    if (snapSections.length > 0) {
      snapSections[0].classList.add('visible');
    }
    snapSections.forEach(section => observer.observe(section));

    return () => {
      if (container) {
        container.removeEventListener('scroll', throttledScroll);
      }
      lenis.destroy();
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="snap-container w-full h-[100dvh] overflow-y-auto overflow-x-hidden">
      <div className="snap-content relative flex min-h-screen w-full flex-col font-display text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="snap-section"><Hero /></div>
        <div className="snap-section"><Gallery /></div>
        <div className="snap-section"><FeaturedProducts /></div>
        <div className="snap-section"><Craftsmanship /></div>
        <div className="snap-section"><Heritage /></div>
        <div className="snap-section"><CuratedSets /></div>
        <div className="snap-section"><Consultation /></div>
        <div className="snap-section"><TestimonialsSection /></div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
