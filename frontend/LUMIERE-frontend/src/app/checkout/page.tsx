"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orderApi, addressApi } from "@/services/api";
import SuccessState from "@/components/checkout/SuccessState";
import { Loader2, ArrowLeft, Lock, Truck, CreditCard, ChevronRight, User, MapPin, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartTotal, setCart, clearCart } = useAppContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);

  const [shippingAddress, setShippingAddress] = useState({
    full_name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
  });

  useEffect(() => {
    if (cart.length === 0 && !success) {
      router.push("/products");
    }
  }, [cart, success]);

  // Fetch saved addresses
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        setFetchingAddresses(true);
        try {
          const res = await addressApi.getAddresses();
          // Adjust for potential pagination (results key)
          const data = res.results || res;
          if (Array.isArray(data)) {
            setSavedAddresses(data);
          }
        } catch (err) {
          console.error("Failed to fetch addresses:", err);
        } finally {
          setFetchingAddresses(false);
        }
      };
      fetchAddresses();

      // Set initial email from user profile
      setShippingAddress(prev => ({ ...prev, email: user.email, full_name: `${user.first_name} ${user.last_name}`.trim() }));
    }
  }, [user]);

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setShippingAddress({
      full_name: addr.full_name || `${user?.first_name} ${user?.last_name}`.trim(),
      email: user?.email || "",
      address: addr.address || addr.line1 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip_code: addr.zip_code || addr.postal_code || "",
      phone: addr.phone || "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    // If user manually edits, clear the selection highlight
    if (selectedAddressId) setSelectedAddressId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Basic Validation
    if (!shippingAddress.email || !shippingAddress.address || !shippingAddress.full_name) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: cart.map((item: any) => ({ id: item.id, quantity: item.quantity })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      };

      const res = await orderApi.placeOrder(payload);
      
      setOrderItems([...cart]);
      setOrderId(res.order_number || res.order_id);
      setSuccess(true);
      
      // Centralized Cart Clearance
      clearCart();
      
      toast("Order placed successfully", "success");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to place order. Check your stock.";
      toast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessState orderId={orderId} email={shippingAddress.email} items={orderItems} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Bag
        </button>

        <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
          
          {/* LEFT: Checkout Form */}
          <div className="flex-1 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Truck className="h-5 w-5 text-black" />
                <h2 className="text-xl font-bold uppercase tracking-widest">Shipping Destination</h2>
              </div>

              {/* Saved Addresses Section */}
              {user && savedAddresses.length > 0 && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Use a Saved Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectAddress(addr)}
                        className={`text-left p-5 rounded-xl border-2 transition-all group relative overflow-hidden ${
                          selectedAddressId === addr.id 
                            ? "border-black bg-gray-50/50 shadow-md" 
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-4 w-4 text-black" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-black uppercase tracking-tight line-clamp-1">{addr.full_name || 'Home'}</p>
                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {addr.address}, {addr.city}, {addr.state} {addr.zip_code}
                        </p>
                        <div className="mt-3 flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Select <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px bg-gray-100 flex-1" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Or enter manually</span>
                    <div className="h-px bg-gray-100 flex-1" />
                  </div>
                </div>
              )}
              
              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                  <input
                    required
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                    placeholder="E.g. Julian Lumière"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                    placeholder="julian@houseoflumiere.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Street Address</label>
                  <textarea
                    required
                    name="address"
                    rows={2}
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all resize-none"
                    placeholder="Enter street name and house number"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">City</label>
                  <input
                    required
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Postcode / ZIP</label>
                  <input
                    required
                    name="zip_code"
                    value={shippingAddress.zip_code}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Country / State</label>
                  <input
                    required
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                    placeholder="France"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone</label>
                  <input
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </form>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <CreditCard className="h-5 w-5 text-black" />
                <h2 className="text-xl font-bold uppercase tracking-widest">Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 'card', name: 'Credit / Debit Card', icons: ['VISA', 'MC'] },
                  { id: 'paypal', name: 'PayPal', icons: ['PP'] },
                  { id: 'apple_pay', name: 'Apple Pay', icons: [''] },
                  { id: 'crypto', name: 'Cryptocurrency', icons: ['BTC', 'ETH'] }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-5 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      paymentMethod === method.id 
                        ? "border-black bg-gray-50/50 shadow-md" 
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`h-4 w-4 rounded-full border-2 transition-all ${
                         paymentMethod === method.id ? 'border-4 border-black' : 'border-gray-300'
                       }`} />
                       <span className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                         paymentMethod === method.id ? 'text-black' : 'text-gray-400'
                       }`}>
                         {method.name}
                       </span>
                    </div>
                    <div className="flex gap-2">
                       {method.icons.map(icon => (
                         <div key={icon} className="h-6 px-2 rounded bg-white border border-gray-100 flex items-center justify-center text-[7px] font-bold text-gray-400 group-hover:text-black transition-colors">
                           {icon}
                         </div>
                       ))}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-[10px] text-gray-400 italic text-center">Payment is processed securely by our global financial partners.</p>
            </section>
          </div>

          {/* RIGHT: Summary Panel */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 bg-gray-50 border border-gray-100 p-8 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-8 border-b border-gray-200 pb-4">Order Summary</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-8">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-12 shrink-0 rounded bg-white border border-gray-200 overflow-hidden">
                      <img src={item.imageUrl} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-black">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                  <div className="text-[10px] font-bold mt-2">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 uppercase tracking-widest font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between pt-4 text-sm font-bold text-black border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-lg tracking-tighter">₦{cartTotal.toLocaleString()}</span>
              </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="mt-10 w-full flex items-center justify-center gap-3 bg-black py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 shadow-xl shadow-black/10 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Complete Order <Lock className="h-3 w-3" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                <Lock className="h-3 w-3" /> End-to-end Encrypted
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
