import React, { useState, useEffect } from "react";

interface CheckoutFormProps {
  onNext: () => void;
}

export default function CheckoutForm({ onNext }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postal: "",
    country: "United States"
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = Object.values(formData).every(val => val.trim().length > 0);
    setIsValid(valid);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight text-black mb-6">Shipping Information</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Email Address</label>
          <input name="email" value={formData.email} onChange={handleChange} required type="email" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Address</label>
          <input name="address" value={formData.address} onChange={handleChange} required type="text" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">City</label>
            <input name="city" value={formData.city} onChange={handleChange} required type="text" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Postal Code</label>
            <input name="postal" value={formData.postal} onChange={handleChange} required type="text" className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Country</label>
          <select name="country" value={formData.country} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none bg-white transition-colors">
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
          </select>
        </div>

        <button 
          disabled={!isValid}
          type="submit" 
          className="mt-8 w-full rounded-md bg-black px-6 py-4 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
