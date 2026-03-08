import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AddressesTab = ({ currentUser }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    isDefault: false
  });

  const fetchAddresses = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, `users/${currentUser.uid}/addresses`));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(fetched);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (addr) => {
    setFormData({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address1: addr.address1,
      address2: addr.address2 || '',
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault || false
    });
    setEditingId(addr.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/addresses`, id));
      toast.success('Address deleted.');
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete address.');
    }
  };

  const handleSetDefault = async (idToSet) => {
    try {
      // Current default, if any
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr && defaultAddr.id !== idToSet) {
        await updateDoc(doc(db, `users/${currentUser.uid}/addresses`, defaultAddr.id), { isDefault: false });
      }
      
      await updateDoc(doc(db, `users/${currentUser.uid}/addresses`, idToSet), { isDefault: true });
      toast.success('Default address updated.');
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update default address.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const addressesRef = collection(db, `users/${currentUser.uid}/addresses`);
      
      // If setting as default, update old default first
      if (formData.isDefault) {
        const defaultAddr = addresses.find(a => a.isDefault);
        if (defaultAddr && defaultAddr.id !== editingId) {
          await updateDoc(doc(db, `users/${currentUser.uid}/addresses`, defaultAddr.id), { isDefault: false });
        }
      }

      if (editingId) {
        // Update
        await updateDoc(doc(db, `users/${currentUser.uid}/addresses`, editingId), formData);
        toast.success('Address updated.');
      } else {
        // If it's the first address, make it default automatically
        const addressData = { ...formData, isDefault: addresses.length === 0 ? true : formData.isDefault };
        await addDoc(addressesRef, addressData);
        toast.success('Address added.');
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        label: 'Home', firstName: '', lastName: '', phone: '',
        address1: '', address2: '', city: '', state: '', zip: '', country: 'United States', isDefault: false
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-8 max-w-3xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-2">Saved Addresses</h2>
          <p className="text-sm text-slate-100/60">Manage your shipping destinations.</p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => {
              setEditingId(null);
              setIsAdding(true);
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold text-black bg-primary px-6 py-2.5 rounded hover:bg-white transition-colors"
          >
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-card-premium border border-primary/20 rounded-2xl p-8 mb-4 animate-slide-down">
          <h3 className="font-serif text-xl text-primary mb-6 border-b border-primary/20 pb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Label</label>
              <select name="label" value={formData.label} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 appearance-none">
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">First Name</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>
            
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Phone Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Address Line 1</label>
              <input type="text" name="address1" required value={formData.address1} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" placeholder="Street address, P.O. box, etc." />
            </div>
            
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Address Line 2 (Optional)</label>
              <input type="text" name="address2" value={formData.address2} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" placeholder="Apt, suite, unit, building, floor, etc." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">City</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">State / Province</label>
              <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">ZIP / Postal Code</label>
              <input type="text" name="zip" required value={formData.zip} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Country</label>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 appearance-none">
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Europe">Europe</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 pt-2">
               <label className="flex items-center gap-3 cursor-pointer group w-max">
                 <div className="relative flex items-center justify-center">
                   <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="sr-only" />
                   <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-primary border-primary' : 'border-slate-100/40 group-hover:border-primary/60'}`}>
                     {formData.isDefault && <CheckCircle2 size={14} className="text-black" />}
                   </div>
                 </div>
                 <span className="text-sm text-slate-100/80 group-hover:text-white transition-colors">Set as default shipping address</span>
               </label>
            </div>
          </div>

          <div className="flex gap-4 pt-8 mt-6 border-t border-primary/10">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-slate-100/60 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-3 rounded text-[10px] uppercase tracking-widest font-bold text-black bg-primary hover:bg-white transition-colors disabled:opacity-70">
              {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      {!isAdding && addresses.length === 0 ? (
        <div className="glass-card-premium border border-primary/10 rounded-2xl p-12 text-center flex flex-col items-center">
          <MapPin size={48} className="text-primary/40 mb-6 stroke-1" />
          <h3 className="font-serif text-2xl text-white mb-2">No Saved Addresses</h3>
          <p className="text-slate-100/50 text-sm mb-8">Add your shipping addresses for a faster checkout experience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className="glass-card-premium border border-primary/20 rounded-xl p-6 relative group flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-white/5 px-2 py-1 rounded text-[10px] uppercase tracking-widest text-primary/80 border border-primary/10">{addr.label || 'Home'}</span>
                  {addr.isDefault && <span className="bg-primary/20 px-2 py-1 rounded text-[10px] uppercase tracking-widest text-primary border border-primary/30 font-bold">Default</span>}
                </div>
                
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(addr)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-100/60 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-slate-100/60 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 text-sm text-slate-100/80 leading-relaxed font-light mb-6">
                <p className="font-medium text-white text-base mb-1">{addr.firstName} {addr.lastName}</p>
                <p>{addr.address1}</p>
                {addr.address2 && <p>{addr.address2}</p>}
                <p>{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-slate-100/60 mt-2">{addr.country}</p>
                <p className="text-slate-100/50 mt-1">{addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr.id)} className="w-full py-2.5 rounded text-[10px] uppercase tracking-widest text-primary/60 border border-primary/20 hover:border-primary/60 hover:text-primary transition-colors">
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesTab;
