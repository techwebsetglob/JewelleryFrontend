import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { consultationSchema } from '../security/validate';
import { sanitizeObject } from '../security/sanitize';

const Consultation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // 1. Zod validation
    const result = consultationSchema.safeParse(formData);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Sanitize before writing to Firestore
    const cleanData = sanitizeObject(result.data);

    setLoading(true);
    
    try {
      await addDoc(collection(db, "consultations"), {
        ...cleanData,
        timestamp: new Date()
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting form: ", err);
      setError("An error occurred while submitting your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consultation" className="bg-background-dark section-spacing px-6 lg:px-20 border-t border-primary/5 relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="scroll-reveal">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-primary mb-6 md:mb-8 shimmer-gold scroll-reveal">Private <br/><span className="italic">Consultation</span></h2>
            <p className="text-slate-100/60 text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-md scroll-reveal">Embark on a journey of bespoke creation. Our master jewelers are available for private appointments to bring your vision to life.</p>
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                <div>
                  <h4 className="text-slate-100 font-bold uppercase tracking-widest text-sm mb-2 scroll-reveal">Mumbai Flagship</h4>
                  <p className="text-slate-100/40 text-sm leading-relaxed scroll-reveal">The Grand Atrium, Altamount Road<br/>Mumbai, Maharashtra 400026</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                <div>
                  <h4 className="text-slate-100 font-bold uppercase tracking-widest text-sm mb-2 scroll-reveal">Concierge Services</h4>
                  <p className="text-slate-100/40 text-sm scroll-reveal">concierge.mumbai@aurum.luxury</p>
                </div>
              </div>
            </div>
          </div>
          <div className="scroll-reveal stagger-2">
            <div className="glass-card-premium p-6 md:p-10 rounded-xl relative overflow-hidden">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] animate-fade-up">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl">check</span>
                  </div>
                  <h3 className="font-serif text-3xl text-primary mb-4">Request Received</h3>
                  <p className="text-slate-100/60 leading-relaxed max-w-sm mb-8">
                    Thank you, {formData.name.split(' ')[0]}. Our concierge desk will contact you shortly to arrange your private session.
                  </p>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setFormData({ name: '', email: '', message: '' });
                    }}
                    className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-primary/60 ml-4">Name</label>
                      <input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-white/5 border border-primary/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors" 
                        placeholder="Alexander Sterling" 
                        type="text" 
                      />
                      {fieldErrors.name && <p className="text-red-400 text-[10px] ml-4">{fieldErrors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-primary/60 ml-4">Email</label>
                      <input 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-white/5 border border-primary/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors" 
                        placeholder="alex@example.com" 
                        type="email" 
                      />
                      {fieldErrors.email && <p className="text-red-400 text-[10px] ml-4">{fieldErrors.email}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-primary/60 ml-4">Message</label>
                    <textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="bg-white/5 border border-primary/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors" 
                      placeholder="Tell us about your masterpiece vision..." 
                      rows={4}
                    ></textarea>
                    {fieldErrors.message && <p className="text-red-400 text-[10px] ml-4">{fieldErrors.message}</p>}
                  </div>
                  
                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  
                  <button 
                    disabled={loading}
                    className={`btn-lux-primary w-full text-black btn-text-lux uppercase py-5 rounded-full text-[10px] transition-all flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                    type="submit"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    ) : (
                      "Request Invitation"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Consultation;
