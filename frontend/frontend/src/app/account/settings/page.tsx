"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Bell, Shield, Loader2 } from "lucide-react";
import { authApi } from "@/services/api";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    marketing_emails: true,
    order_updates: true,
    personalized_ads: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await authApi.getProfile();
        setSettings({
          marketing_emails: data.marketing_emails,
          order_updates: data.order_updates,
          personalized_ads: data.personalized_ads
        });
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(settings);
      toast("Settings updated successfully", "success");
    } catch (err) {
      toast("Failed to update preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center gap-2 text-sm text-gray-500 animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /> Gathering preferences...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-black">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your account preferences and security.</p>
      </div>

      <div className="space-y-10">
        {/* Notifications Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Bell className="h-3 w-3" />
            <span>Notifications</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black">Order Updates</p>
                <p className="text-xs text-gray-500">Receive SMS and email updates on your order progress.</p>
              </div>
              <button 
                onClick={() => handleToggle('order_updates')}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${settings.order_updates ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${settings.order_updates ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black">Marketing Communications</p>
                <p className="text-xs text-gray-500">Stay updated on new drops and seasonal collections.</p>
              </div>
              <button 
                onClick={() => handleToggle('marketing_emails')}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${settings.marketing_emails ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${settings.marketing_emails ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Personalized Experience */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
             <span className="h-3 w-3 rounded-full border border-gray-400 block" />
            <span>Personalization</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black">Personalized Recommendations</p>
              <p className="text-xs text-gray-500">Use your activity to show products tailored to your aesthetic.</p>
            </div>
            <button 
              onClick={() => handleToggle('personalized_ads')}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${settings.personalized_ads ? 'bg-black' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${settings.personalized_ads ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Security</span>
          </div>
          <div className="space-y-4">
            <button className="flex w-full items-center justify-between p-4 rounded-md border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-semibold text-black">Change Password</span>
              <span className="text-xs text-gray-400 underline underline-offset-4">Update</span>
            </button>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-black px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
