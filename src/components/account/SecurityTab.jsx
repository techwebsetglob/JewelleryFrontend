import React, { useState } from 'react';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  deleteUser,
  GoogleAuthProvider,
  linkWithPopup,
  unlink
} from 'firebase/auth';
import { auth } from '../../firebase';
import { Shield, Key, AlertTriangle, Link as LinkIcon, Unlink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SecurityTab = ({ currentUser, logout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  // Providers
  const googleProviderData = currentUser?.providerData?.find(p => p.providerId === 'google.com');
  const isGoogleLinked = !!googleProviderData;

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'None', color: 'bg-white/5' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500' };
    if (pass.length < 10 || !/\d/.test(pass)) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      return toast.error("New passwords don't match.");
    }
    if (passwords.newPass.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwords.newPass);
      
      toast.success('Password updated successfully.');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect.');
      } else {
        toast.error('Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      toast.success('Google account linked successfully.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/credential-already-in-use') {
         toast.error('This Google account is already linked to another user.');
      } else {
         toast.error('Failed to link Google account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    try {
      setLoading(true);
      await unlink(currentUser, 'google.com');
      toast.success('Google account unlinked.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to unlink Google account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await deleteUser(currentUser);
      toast.success('Account deleted successfully.');
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to delete your account.');
      } else {
        toast.error('Failed to delete account.');
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const strength = getPasswordStrength(passwords.newPass);

  return (
    <div className="animate-fade-in flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="font-serif text-3xl text-primary mb-2">Security & Access</h2>
        <p className="text-sm text-slate-100/60">Manage your password and connected accounts.</p>
      </div>

      {/* Change Password */}
      <div className="glass-card-premium border border-primary/20 rounded-2xl p-8">
        <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
          <Key size={18} className="text-primary/70" />
          Change Password
        </h3>
        
        {currentUser?.providerData.every(p => p.providerId !== 'password') ? (
          <p className="text-slate-100/60 text-sm">
            You signed in with a third-party provider (like Google). You don't have a password set for this account.
          </p>
        ) : (
          <form onSubmit={submitPasswordChange} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Current Password</label>
              <input 
                type="password" name="current" required value={passwords.current} onChange={handlePasswordChange}
                className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">New Password</label>
                <input 
                  type="password" name="newPass" required value={passwords.newPass} onChange={handlePasswordChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60"
                />
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-1 flex-1 rounded-full ${strength.color}`}></div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-100/50 w-12 text-right">{strength.label}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Confirm New</label>
                <input 
                  type="password" name="confirm" required value={passwords.confirm} onChange={handlePasswordChange}
                  className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="mt-2 btn-lux-primary py-3 rounded text-xs uppercase tracking-widest font-bold text-black flex items-center justify-center gap-2 disabled:opacity-70"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="glass-card-premium border border-primary/20 rounded-2xl p-8">
        <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
          <Shield size={18} className="text-primary/70" />
          Connected Accounts
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-white/5 border border-primary/10 rounded-lg">
          <div className="flex items-center gap-4">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
            <div>
              <p className="text-white text-sm font-medium">Google</p>
              <p className="text-slate-100/50 text-xs">{isGoogleLinked ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
          
          {isGoogleLinked ? (
             <button 
               onClick={handleUnlinkGoogle} disabled={loading || currentUser?.providerData.length === 1}
               className="flex items-center gap-2 px-4 py-2 rounded text-[10px] uppercase tracking-widest border border-primary/30 text-primary/80 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/50 transition-colors disabled:opacity-50"
               title={currentUser?.providerData.length === 1 ? "Cannot unlink your only sign-in method" : ""}
             >
               <Unlink size={14} /> Unlink
             </button>
          ) : (
             <button 
               onClick={handleLinkGoogle} disabled={loading}
               className="flex items-center gap-2 px-4 py-2 rounded text-[10px] uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
             >
               <LinkIcon size={14} /> Connect
             </button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-8 mt-4">
        <h3 className="font-serif text-xl text-red-400 mb-2 flex items-center gap-3">
          <AlertTriangle size={18} />
          Danger Zone
        </h3>
        <p className="text-sm text-slate-100/70 mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2.5 rounded text-[10px] uppercase tracking-widest font-bold border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-black/40 p-6 rounded-lg border border-red-500/50 animate-fade-in">
            <p className="text-white text-sm mb-4 font-bold">Are you absolutely sure?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded text-[10px] uppercase tracking-widest border border-white/20 text-slate-100 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} disabled={deleteLoading}
                className="flex-[2] py-2.5 rounded text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {deleteLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default SecurityTab;
