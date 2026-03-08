import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import { Camera, Save, X, User } from 'lucide-react';
import { profileSchema } from '../../security/validate';
import { sanitizeObject } from '../../security/sanitize';
import toast from 'react-hot-toast';

const ProfileTab = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    phoneNumber: '',
    dob: '',
    gender: 'Prefer not to say'
  });
  
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData(prev => ({
              ...prev,
              phoneNumber: data.phoneNumber || '',
              dob: data.dob || '',
              gender: data.gender || 'Prefer not to say'
            }));
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    // 1. Zod validation
    const result = profileSchema.safeParse({
      displayName: formData.displayName,
      phoneNumber: formData.phoneNumber,
      dob: formData.dob,
    });
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Sanitize
    const cleanData = sanitizeObject(result.data);

    setLoading(true);
    
    try {
      let updatedPhotoURL = currentUser.photoURL;

      // Upload avatar if changed
      if (avatarFile) {
        const fileRef = ref(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(fileRef, avatarFile);
        updatedPhotoURL = await getDownloadURL(fileRef);
      }

      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: cleanData.displayName,
        photoURL: updatedPhotoURL
      });

      // Update Firestore User Doc
      await setDoc(doc(db, 'users', currentUser.uid), {
        phoneNumber: cleanData.phoneNumber || '',
        dob: cleanData.dob || '',
        gender: formData.gender,
        updatedAt: new Date()
      }, { merge: true });

      setPhotoURL(updatedPhotoURL);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name[0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8 max-w-2xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-2">My Profile</h2>
          <p className="text-sm text-slate-100/60">Manage your personal information and preferences.</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold text-black bg-primary px-6 py-2.5 rounded hover:bg-white transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="glass-card-premium border border-primary/20 rounded-2xl p-8">
        
        {/* View Mode */}
        {!isEditing ? (
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-white/5 shrink-0">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-5xl text-primary">{getInitials(currentUser?.displayName, currentUser?.email)}</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-3xl text-white mb-1">{currentUser?.displayName || 'Client'}</h3>
                <p className="text-primary/80 tracking-wide text-sm">{currentUser?.email}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-primary/10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Phone Number</p>
                  <p className="text-slate-100/90 text-sm">{formData.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Date of Birth</p>
                  <p className="text-slate-100/90 text-sm">{formData.dob || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Gender</p>
                  <p className="text-slate-100/90 text-sm">{formData.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Member Since</p>
                  <p className="text-slate-100/90 text-sm">
                    {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 animate-fade-in relative">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-white/5 relative z-10 transition-all group-hover:border-white">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-primary/50" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-primary/60">Change Photo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Full Name</label>
                <input 
                  type="text" 
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  placeholder="John Doe"
                />
                {fieldErrors.displayName && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.displayName}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
                {fieldErrors.phoneNumber && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.phoneNumber}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors appearance-none"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-primary/10">
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPhotoURL(currentUser?.photoURL || '');
                  setAvatarFile(null);
                  setFieldErrors({});
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-slate-100/60 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <X size={14} /> Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-black bg-primary hover:bg-white transition-colors disabled:opacity-70"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <><Save size={14} /> Save Profile</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ProfileTab;
