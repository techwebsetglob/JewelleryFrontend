import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../security/validate';
import { sanitizeObject } from '../security/sanitize';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lockTimer = useRef(null);

  // Redirect to where they were trying to go, or home
  const from = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent rapid retries
    if (locked) return;

    // 1. Zod validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const firstError = result.error.errors[0];
      setError(firstError.message);
      return;
    }

    // 2. Sanitize
    const cleanData = sanitizeObject(result.data);

    setLoading(true);
    try {
      await login(cleanData.email, cleanData.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Generic error — never reveal which field is wrong
      setError('Invalid email or password.');
      // Clear password on failure
      setPassword('');
      // Lock submit for 2 seconds
      setLocked(true);
      clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => setLocked(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 flex items-center justify-center animate-fade-in relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card-premium p-8 md:p-12 rounded-2xl relative z-10 border border-primary/20">
        
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-3xl text-primary mb-2">diamond</span>
          <h1 className="font-serif text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-[10px] uppercase tracking-widest text-primary/60">Sign in to your Aurum account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded mb-6 text-center tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all placeholder-white/20"
              placeholder="client@aurum.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Password</label>
              <Link to="#" className="text-[10px] text-primary/80 hover:text-primary transition-colors">Forgot?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all placeholder-white/20"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || locked}
            className="btn-lux-primary w-full py-4 mt-2 rounded-lg text-xs uppercase tracking-[0.2em] font-bold text-black transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : locked ? "Please wait..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-[1px] bg-primary/10"></div>
          <span className="text-[10px] uppercase tracking-widest text-primary/40">Or</span>
          <div className="flex-1 h-[1px] bg-primary/10"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white/5 border border-primary/20 hover:bg-white/10 transition-colors py-3 rounded-lg flex items-center justify-center gap-3 text-sm text-white disabled:opacity-70"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Continue with Google
        </button>

        <p className="text-center text-xs text-slate-100/60 mt-8">
          Don't have an account?{' '}
          <Link to={`/register${location.search}`} className="text-primary hover:text-white transition-colors border-b border-primary/30 pb-0.5 ml-1">
            Create One
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
