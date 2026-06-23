"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { addressApi } from "@/services/api";

interface Address {
  id: number;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function DeliveryDetailsPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom",
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const data = await addressApi.getAddresses();
      const items = data.results || data;
      setAddresses(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setForm({
        full_name: address.full_name,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default
      });
    } else {
      setEditingAddress(null);
      setForm({
        full_name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United Kingdom",
        is_default: addresses.length === 0
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        await addressApi.updateAddress(editingAddress.id, form);
        toast("Address updated successfully", "success");
      } else {
        await addressApi.createAddress(form);
        toast("New address added", "success");
      }
      fetchAddresses();
      handleCloseModal();
    } catch (err) {
      toast("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      await addressApi.deleteAddress(id);
      toast("Address removed", "info");
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast("Failed to delete address", "error");
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm animate-in fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-black">Delivery Details</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your shipping addresses for a faster checkout.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-200" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">No addresses saved yet.</p>
          <button onClick={() => handleOpenModal()} className="text-sm font-bold text-black underline underline-offset-4">
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className={`relative rounded-md border p-6 transition-all ${address.is_default ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}>
              {address.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex rounded-full bg-black px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    Default
                  </span>
                </div>
              )}
              
              <h3 className="text-sm font-bold text-black mb-1">{address.full_name}</h3>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p className="pt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{address.country}</p>
              </div>

              <div className="mt-6 flex gap-4 text-xs font-bold uppercase tracking-widest text-black">
                <button onClick={() => handleOpenModal(address)} className="hover:underline">Edit</button>
                <button onClick={() => handleDelete(address.id)} className="text-gray-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
          ))}

          {/* New Address Card Trigger */}
          <button 
            onClick={() => handleOpenModal()}
            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200 bg-white p-6 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-500 hover:text-black min-h-[160px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Add Another Address</span>
          </button>
        </div>
      )}

      {/* Modal - Simple implementation for UI clarity */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-black">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Address Line 1</label>
                <input required value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">City</label>
                  <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">State / Province</label>
                  <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Postal Code</label>
                  <input required value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Country</label>
                  <input required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full border-b border-gray-200 py-2 focus:border-black focus:outline-none text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} className="accent-black" />
                <label htmlFor="is_default" className="text-sm text-gray-600 cursor-pointer">Set as default shipping address</label>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={handleCloseModal} className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-md bg-black text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                   {isSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
