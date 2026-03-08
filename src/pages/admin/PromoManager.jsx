import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PromoManager = () => {
  const { currentUser } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxDiscountAmount: '',
    applicableCategories: 'all',
    applicableProductIds: 'all',
    usageLimit: '',
    perUserLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'promoCodes'));
      if (snap.empty) {
        await seedDefaultPromos();
      } else {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // sort by created date mostly
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setPromos(data);
      }
    } catch (err) {
      console.error("Error fetching promos:", err);
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultPromos = async () => {
    const defaultCodes = [
      { code: "WELCOME10", type: "percentage", value: 10, minOrderValue: 0, maxDiscountAmount: null, usageLimit: null, perUserLimit: 1, applicableCategories: 'all', startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
      { code: "AURUM20", type: "percentage", value: 20, minOrderValue: 400, maxDiscountAmount: 200, usageLimit: 100, perUserLimit: 1, applicableCategories: 'all', startDate: new Date(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
      { code: "FREESHIP", type: "freeShipping", value: 0, minOrderValue: 100, maxDiscountAmount: null, usageLimit: null, perUserLimit: 3, applicableCategories: 'all', startDate: new Date(), expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true },
      { code: "SAVE50", type: "fixed", value: 50, minOrderValue: 300, maxDiscountAmount: null, usageLimit: 50, perUserLimit: 1, applicableCategories: 'all', startDate: new Date(), expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true },
      { code: "RINGS15", type: "percentage", value: 15, minOrderValue: 0, maxDiscountAmount: null, usageLimit: null, perUserLimit: 2, applicableCategories: ['rings'], startDate: new Date(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
    ];

    try {
      for (const promo of defaultCodes) {
        await setDoc(doc(db, 'promoCodes', promo.code), {
          ...promo,
          usageCount: 0,
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid || 'admin'
        });
      }
      toast.success("Seeded default promo codes.");
      
      const snap = await getDocs(collection(db, 'promoCodes'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPromos(data);
    } catch (err) {
      console.error("Error seeding promos:", err);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, [currentUser]);

  const toggleStatus = async (promo) => {
    try {
      await updateDoc(doc(db, 'promoCodes', promo.code), {
        isActive: !promo.isActive
      });
      setPromos(promos.map(p => p.code === promo.code ? { ...p, isActive: !p.isActive } : p));
      toast.success(`Promo code ${!promo.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status");
    }
  };

  const deletePromo = async (code) => {
    if (!window.confirm(`Are you sure you want to delete ${code}?`)) return;
    try {
      await deleteDoc(doc(db, 'promoCodes', code));
      setPromos(promos.filter(p => p.code !== code));
      toast.success("Promo code deleted");
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Failed to delete promo code");
    }
  };

  const handleEditClick = (promo) => {
    const start = promo.startDate?.toDate ? promo.startDate.toDate() : new Date(promo.startDate);
    const expiry = promo.expiryDate?.toDate ? promo.expiryDate.toDate() : new Date(promo.expiryDate);
    
    // adjust timezone offset to local time string for standard datetime-local input
    const toLocalISOString = (d) => {
        const tzoffset = d.getTimezoneOffset() * 60000;
        return new Date(d - tzoffset).toISOString().slice(0, 16);
    };

    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value || 0,
      minOrderValue: promo.minOrderValue || 0,
      maxDiscountAmount: promo.maxDiscountAmount || '',
      applicableCategories: Array.isArray(promo.applicableCategories) ? promo.applicableCategories.join(',') : 'all',
      applicableProductIds: Array.isArray(promo.applicableProductIds) ? promo.applicableProductIds.join(',') : 'all',
      usageLimit: promo.usageLimit || '',
      perUserLimit: promo.perUserLimit || 1,
      startDate: toLocalISOString(start),
      expiryDate: toLocalISOString(expiry),
      isActive: promo.isActive
    });
    setCurrentPromo(promo);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxDiscountAmount: '',
      applicableCategories: 'all',
      applicableProductIds: 'all',
      usageLimit: '',
      perUserLimit: 1,
      startDate: new Date().toISOString().slice(0, 16),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isActive: true
    });
    setCurrentPromo(null);
    setIsEditing(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const code = formData.code.trim().toUpperCase();
    if (!code || !code.match(/^[A-Z0-9-]+$/)) {
      toast.error("Code must be alphanumeric with hyphens");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.expiryDate);

    if (end <= start) {
      toast.error("Expiry date must be after start date");
      return;
    }

    try {
      const isNew = !currentPromo;
      if (isNew) {
         // check uniqueness
         const ex = await getDoc(doc(db, 'promoCodes', code));
         if (ex.exists()) {
           toast.error("Code already exists!");
           return;
         }
      }

      let categories = formData.applicableCategories;
      if (categories !== 'all') {
         categories = categories.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      }

      let products = formData.applicableProductIds;
      if (products !== 'all') {
         products = products.split(',').map(s => s.trim()).filter(s => s);
      }

      const payload = {
        code,
        type: formData.type,
        value: formData.type === 'freeShipping' ? 0 : Number(formData.value),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscountAmount: formData.type === 'percentage' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        applicableCategories: categories,
        applicableProductIds: products,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: Number(formData.perUserLimit) || 1,
        startDate: start,
        expiryDate: end,
        isActive: formData.isActive
      };

      if (isNew) {
        payload.usageCount = 0;
        payload.createdAt = serverTimestamp();
        payload.createdBy = currentUser?.uid;
      }

      await setDoc(doc(db, 'promoCodes', code), payload, { merge: true });
      
      toast.success(isNew ? "Promo Code created" : "Promo Code updated");
      setIsEditing(false);
      fetchPromos();
    } catch (err) {
      console.error("Error saving promo:", err);
      toast.error("Failed to save promo code");
    }
  };

  const getStatusColor = (promo) => {
    if (!promo.isActive) return 'text-red-400 bg-red-400/10 border-red-400/20';
    const now = new Date();
    const end = promo.expiryDate?.toDate ? promo.expiryDate.toDate() : new Date(promo.expiryDate);
    const start = promo.startDate?.toDate ? promo.startDate.toDate() : new Date(promo.startDate);
    if (now > end) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (now < start) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-green-400 bg-green-400/10 border-green-500/20';
  };

  const getStatusText = (promo) => {
    if (!promo.isActive) return 'Inactive';
    const now = new Date();
    const end = promo.expiryDate?.toDate ? promo.expiryDate.toDate() : new Date(promo.expiryDate);
    const start = promo.startDate?.toDate ? promo.startDate.toDate() : new Date(promo.startDate);
    if (now > end) return 'Expired';
    if (now < start) return 'Scheduled';
    return 'Active';
  };

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-12 pb-20 animate-fade-in relative overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-10">
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-serif text-4xl text-primary mb-2">Promo Codes</h1>
            <p className="text-slate-100/60 uppercase tracking-widest text-[10px]">Manage store discounts and rules</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="btn-lux-primary px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Promo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-primary">
             <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
          </div>
        ) : (
          <div className="glass-card-premium border border-primary/20 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/20 bg-black/40 text-[10px] uppercase tracking-widest text-primary/60">
                  <th className="p-4 font-normal">Code</th>
                  <th className="p-4 font-normal">Type</th>
                  <th className="p-4 font-normal">Value</th>
                  <th className="p-4 font-normal">Used</th>
                  <th className="p-4 font-normal">Limit</th>
                  <th className="p-4 font-normal">Expiry</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-100/50 text-sm">No promo codes found.</td>
                  </tr>
                )}
                {promos.map(promo => {
                  const end = promo.expiryDate?.toDate ? promo.expiryDate.toDate() : new Date(promo.expiryDate);
                  return (
                    <tr key={promo.code} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                      <td className="p-4 font-bold tracking-widest text-primary">{promo.code}</td>
                      <td className="p-4 text-slate-100/80 capitalize">{promo.type.replace(/([A-Z])/g, ' $1').trim()}</td>
                      <td className="p-4 text-white">
                        {promo.type === 'percentage' ? `${promo.value}%` : 
                         promo.type === 'fixed' ? `$${promo.value}` : 
                         promo.type === 'freeShipping' ? 'Free Shipping' : 'BOGO'}
                      </td>
                      <td className="p-4 text-slate-100/80">{promo.usageCount}</td>
                      <td className="p-4 text-slate-100/80">{promo.usageLimit || '∞'} ({promo.perUserLimit}/user)</td>
                      <td className="p-4 text-slate-100/80 text-xs">{end.toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border ${getStatusColor(promo)}`}>
                          {getStatusText(promo)}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(promo)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 text-primary/60 hover:text-primary transition-all flex items-center justify-center border border-white/10"
                          title={promo.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span className="material-symbols-outlined text-[16px]">{promo.isActive ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(promo)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 text-primary/60 hover:text-primary transition-all flex items-center justify-center border border-white/10"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          onClick={() => deletePromo(promo.code)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 text-primary/60 hover:text-red-400 transition-all flex items-center justify-center border border-white/10"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Slide-in Editor */}
        <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] z-50 bg-background-dark border-l border-primary/20 shadow-2xl transition-transform duration-500 transform ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="h-full flex flex-col pt-24 px-8 pb-8">
             <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
               <h2 className="font-serif text-2xl text-primary">{currentPromo ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
               <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white transition-colors">
                 <span className="material-symbols-outlined text-3xl">close</span>
               </button>
             </div>

             <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto pr-4 flex flex-col gap-6 custom-scrollbar">
               
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] uppercase tracking-widest text-primary/60">Code (Alphanumeric)</label>
                 <input 
                   disabled={!!currentPromo}
                   required type="text" 
                   value={formData.code} 
                   onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                   className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white uppercase disabled:opacity-50"
                   placeholder="e.g. SUMMER20"
                 />
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] uppercase tracking-widest text-primary/60">Type</label>
                 <select 
                   value={formData.type} 
                   onChange={e => setFormData({...formData, type: e.target.value})}
                   className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white appearance-none"
                 >
                   <option value="percentage">Percentage Off (%)</option>
                   <option value="fixed">Fixed Amount ($)</option>
                   <option value="freeShipping">Free Shipping</option>
                   <option value="bogo">Buy One Get One</option>
                 </select>
               </div>

               {formData.type !== 'freeShipping' && formData.type !== 'bogo' && (
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Value {formData.type==='percentage' ? '(%)' : '($)'}</label>
                   <input 
                     required type="number" step="0.01" min="0" 
                     value={formData.value} 
                     onChange={e => setFormData({...formData, value: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   />
                 </div>
               )}

               <div className="flex gap-4">
                 <div className="flex-1 flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Min Order ($)</label>
                   <input 
                     type="number" min="0" 
                     value={formData.minOrderValue} 
                     onChange={e => setFormData({...formData, minOrderValue: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   />
                 </div>
                 {formData.type === 'percentage' && (
                   <div className="flex-1 flex flex-col gap-2">
                     <label className="text-[10px] uppercase tracking-widest text-primary/60">Max Discount ($)</label>
                     <input 
                       type="number" min="0" 
                       value={formData.maxDiscountAmount} 
                       onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})}
                       className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                       placeholder="Leave blank for none"
                     />
                   </div>
                 )}
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] uppercase tracking-widest text-primary/60">Applicable Categories</label>
                 <input 
                   type="text" 
                   value={formData.applicableCategories} 
                   onChange={e => setFormData({...formData, applicableCategories: e.target.value})}
                   className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   placeholder="'all' or comma separated: rings, necklaces"
                 />
               </div>

               <div className="flex gap-4">
                 <div className="flex-1 flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Usage Limit Global</label>
                   <input 
                     type="number" min="1" 
                     value={formData.usageLimit} 
                     onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                     placeholder="Leave blank for unlimited"
                   />
                 </div>
                 <div className="flex-1 flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Limit Per User</label>
                   <input 
                     required type="number" min="1" 
                     value={formData.perUserLimit} 
                     onChange={e => setFormData({...formData, perUserLimit: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   />
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="flex-1 flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Start Date</label>
                   <input 
                     required type="datetime-local" 
                     value={formData.startDate} 
                     onChange={e => setFormData({...formData, startDate: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   />
                 </div>
                 <div className="flex-1 flex flex-col gap-2">
                   <label className="text-[10px] uppercase tracking-widest text-primary/60">Expiry Date</label>
                   <input 
                     required type="datetime-local" 
                     value={formData.expiryDate} 
                     onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                     className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                   />
                 </div>
               </div>

               <div className="mt-4 flex items-center gap-3 bg-black/40 border border-primary/10 p-4 rounded-lg">
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                   <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                 </label>
                 <span className="text-sm font-bold text-white uppercase tracking-widest ml-3">
                   {formData.isActive ? 'Promo is Active' : 'Promo is Inactive'}
                 </span>
               </div>

               <div className="mt-8 flex gap-4 pt-4 border-t border-primary/10 mb-8">
                 <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 text-sm uppercase tracking-widest font-bold text-white/50 border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                 <button type="submit" className="flex-1 py-3 btn-lux-primary text-black text-sm uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(212,175,127,0.3)]">Save Promo</button>
               </div>
             </form>

           </div>
        </div>
        {/* Backdrop */}
        {isEditing && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsEditing(false)}></div>
        )}

      </div>
    </div>
  );
};

export default PromoManager;
