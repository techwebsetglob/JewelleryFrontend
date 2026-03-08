import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../security/validate';
import { sanitizeObject } from '../security/sanitize';

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '65%' };
  if (score <= 4) return { label: 'Strong', color: 'bg-green-500', width: '85%' };
  return { label: 'Very Strong', color: 'bg-emerald-400', width: '100%' };
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lockTimer = useRef(null);

  const from = new URLSearchParams(location.search).get('redirect') || '/';

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (locked) return;

    // 1. Zod validation
    const result = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Sanitize
    const cleanData = sanitizeObject({ name: result.data.name, email: result.data.email });

    setLoading(true);
    try {
      await register(cleanData.email, password, cleanData.name);
      navigate(from, { replace: true });
    } catch (err) {
      // Generic messages to avoid information leakage
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('Unable to create account. Please try a different email or sign in.');
      } else {
        setError('Account creation failed. Please try again.');
      }
      // Clear passwords on failure
      setPassword('');
      setConfirmPassword('');
      // Lock for 2 seconds
      setLocked(true);
      clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => setLocked(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 pb-20 flex items-center justify-center animate-fade-in relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card-premium p-8 md:p-12 rounded-2xl relative z-10 border border-primary/20">
        
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-3xl text-primary mb-2">diamond</span>
          <h1 className="font-serif text-3xl text-white mb-2">Join Aurum</h1>
          <p className="text-[10px] uppercase tracking-widest text-primary/60">Unlock exclusive collections</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded mb-6 text-center tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all placeholder-white/20"
              placeholder="e.g. Eleanor Vance"
            />
            {fieldErrors.name && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.name}</p>}
          </div>

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
            {fieldErrors.email && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.email}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all placeholder-white/20"
              placeholder="••••••••"
            />
            {/* Password Strength Indicator */}
            {password && (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }}></div>
                </div>
                <span className={`text-[10px] tracking-widest uppercase ${
                  strength.label === 'Weak' ? 'text-red-400' : 
                  strength.label === 'Fair' ? 'text-orange-400' :
                  strength.label === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>{strength.label}</span>
              </div>
            )}
            {fieldErrors.password && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.password}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all placeholder-white/20"
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading || locked}
            className="btn-lux-primary w-full py-4 mt-4 rounded-lg text-xs uppercase tracking-[0.2em] font-bold text-black transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : locked ? "Please wait..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-100/60 mt-8">
          Already a member?{' '}
          <Link to={`/login${location.search}`} className="text-primary hover:text-white transition-colors border-b border-primary/30 pb-0.5 ml-1">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
