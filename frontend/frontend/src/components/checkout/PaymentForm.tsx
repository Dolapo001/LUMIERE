import React, { useState, useEffect } from "react";

interface PaymentFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentForm({ onNext, onBack }: PaymentFormProps) {
  const [method, setMethod] = useState<"card" | "delivery">("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (method === "delivery") {
      setIsValid(true);
      return;
    }
    const { cardNumber, expiry, cvv } = formData;
    const valid = cardNumber.length >= 15 && expiry.length === 5 && cvv.length >= 3;
    setIsValid(valid);
  }, [formData, method]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight text-black mb-6">Payment Method</h2>
      
      <div className="flex flex-col gap-3 mb-6">
        <label className={`flex cursor-pointer items-center justify-between rounded-md border p-4 ${method === "card" ? "border-black bg-gray-50" : "border-gray-200 transition-colors"}`}>
          <div className="flex items-center gap-3">
            <input 
              type="radio" 
              name="payment" 
              checked={method === "card"} 
              onChange={() => setMethod("card")}
              className="h-4 w-4 accent-black"
            />
            <span className="text-sm font-medium text-black">Credit Card</span>
          </div>
        </label>
        
        <label className={`flex cursor-pointer items-center justify-between rounded-md border p-4 ${method === "delivery" ? "border-black bg-gray-50" : "border-gray-200 transition-colors"}`}>
          <div className="flex items-center gap-3">
            <input 
              type="radio" 
              name="payment" 
              checked={method === "delivery"} 
              onChange={() => setMethod("delivery")}
              className="h-4 w-4 accent-black"
            />
            <span className="text-sm font-medium text-black">Pay on Delivery</span>
          </div>
        </label>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        {method === "card" && (
          <div className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Card Number</label>
              <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Expiry Date</label>
                <input name="expiry" value={formData.expiry} onChange={handleChange} required type="text" placeholder="MM/YY" maxLength={5} className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">CVV</label>
                <input name="cvv" value={formData.cvv} onChange={handleChange} required type="text" placeholder="123" maxLength={4} className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm focus:border-black focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button type="button" onClick={onBack} className="w-1/3 rounded-md border border-gray-200 bg-white px-6 py-4 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button 
            type="submit" 
            disabled={!isValid}
            className="w-2/3 rounded-md bg-black px-6 py-4 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
}
