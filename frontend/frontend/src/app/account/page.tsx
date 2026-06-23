"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, Bell } from "lucide-react";

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    marketing_emails: true,
    order_updates: true
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        marketing_emails: user.marketing_emails,
        order_updates: user.order_updates
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(profileForm);
      toast("Profile updated successfully", "success");
    } catch (err) {
      toast("Failed to update profile", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-8">Identity & Preferences</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">First Name</label>
              <input 
                value={profileForm.first_name}
                onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                className="w-full rounded-md border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Last Name</label>
              <input 
                value={profileForm.last_name}
                onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                className="w-full rounded-md border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-4 flex items-center gap-2">
               <Bell className="h-3 w-3" /> Communication
             </h4>
             
             <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                   type="checkbox" 
                   checked={profileForm.marketing_emails}
                   onChange={e => setProfileForm({...profileForm, marketing_emails: e.target.checked})}
                   className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" 
                />
                <span className="text-xs text-gray-600 group-hover:text-black transition-colors">Receive editorial updates and new collection alerts.</span>
             </label>
             
             <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                   type="checkbox"
                   checked={profileForm.order_updates}
                   onChange={e => setProfileForm({...profileForm, order_updates: e.target.checked})}
                   className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-xs text-gray-600 group-hover:text-black transition-colors">Receive real-time shipment and delivery notifications.</span>
             </label>
          </div>

          <div className="pt-8">
             <button className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95">
               Save Changes
             </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
         <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security & Access
              </h2>
              <p className="text-xs text-gray-400 mt-1">Manage your password and authentication methods.</p>
            </div>
            <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4">Change Password</button>
         </div>
      </div>
    </div>
  );
}
