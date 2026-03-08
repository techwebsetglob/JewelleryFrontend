import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full px-6 py-4 lg:px-20 transition-all duration-300 glass-nav">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12 w-full lg:w-auto justify-between lg:justify-start">
          {/* Mobile Menu Button - Left aligned on mobile */}
          <button 
            className="lg:hidden text-primary focus:outline-none z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Logo - Centered on mobile, absolute positioned */}
          <div className="flex items-center gap-2 text-primary lg:relative lg:translate-x-0 absolute left-1/2 -translate-x-1/2 lg:left-auto">
            <Link to="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl">diamond</span>
              <h2 className="font-serif text-xl md:text-2xl font-bold tracking-widest text-primary shimmer-gold scroll-reveal active">AURUM</h2>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/shop" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-100 hover:text-primary transition-colors nav-link-effect">Shop</Link>
            <a href="/#gallery" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-100 hover:text-primary transition-colors nav-link-effect">Collections</a>
            <a href="/#heritage" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-100 hover:text-primary transition-colors nav-link-effect">Heritage</a>
            <a href="/#consultation" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-100 hover:text-primary transition-colors nav-link-effect">Bespoke</a>
            <Link to="/track" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-100 hover:text-primary transition-colors nav-link-effect">Track Order</Link>
          </nav>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4 md:gap-6 z-50 relative">
          <div className="relative hidden xl:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 text-sm">search</span>
            <input className="h-10 w-48 rounded-full border border-primary/20 bg-black/60 pl-10 text-xs text-white placeholder-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Search Masterpieces" type="text" />
          </div>
          
          <button 
            onClick={toggleCart}
            className="relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black/60 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            {currentUser ? (
              <div 
                className="h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-full border border-primary/40 cursor-pointer hidden sm:block"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {currentUser.photoURL ? (
                  <img className="h-full w-full object-cover" alt="Profile" src={currentUser.photoURL} />
                ) : (
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex btn-lux-primary h-10 items-center justify-center rounded-lg px-6 text-[10px] btn-text-lux uppercase text-emerald-deep transition-all">
                Sign In
              </Link>
            )}

            {/* Auth Dropdown */}
            {isUserMenuOpen && currentUser && (
              <div className="absolute right-0 mt-4 w-48 glass-card-premium border border-primary/20 rounded-xl overflow-hidden py-2" onMouseLeave={() => setIsUserMenuOpen(false)}>
                <Link to="/account" className="block px-4 py-3 text-xs text-slate-100 hover:text-primary hover:bg-white/5 transition-colors uppercase tracking-widest text-center" onClick={() => setIsUserMenuOpen(false)}>My Account</Link>
                <div className="w-full h-[1px] bg-primary/20 my-1"></div>
                <button onClick={handleLogout} className="block w-full px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors uppercase tracking-widest text-center">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Full Screen Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 top-0 pt-24 bg-black/95 backdrop-blur-xl transition-all duration-400 ease-in-out z-40 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <nav className="flex flex-col items-center justify-center h-full pb-32 gap-8 text-center">
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-100/90 hover:text-primary transition-colors hover:scale-110 transform">Shop</Link>
          <a href="/#gallery" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-100/90 hover:text-primary transition-colors hover:scale-110 transform">Collections</a>
          <a href="/#heritage" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-100/90 hover:text-primary transition-colors hover:scale-110 transform">Heritage</a>
          <a href="/#consultation" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-100/90 hover:text-primary transition-colors hover:scale-110 transform">Bespoke</a>
          <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-primary hover:text-white transition-colors hover:scale-110 transform">Track Order</Link>
          <div className="w-12 h-[1px] bg-primary/30 my-4"></div>
          {currentUser ? (
            <>
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-primary hover:scale-110 transform transition-all">My Account</Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }} 
                className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 hover:scale-110 transform transition-all"
              >
                Logout
              </button>
            </>
          ) : (
             <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.3em] text-primary hover:scale-110 transform transition-all">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
