"use client";
import React, { useState, useEffect } from "react";
import { adminApi } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { 
  Loader2, 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Truck,
  XCircle,
  Clock
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders();
      setOrders(res.results || res);
    } catch (err) {
      toast("Failed to load administrative order queue", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast(`Order status updated to ${newStatus}`, "success");
      fetchOrders();
    } catch (err) {
      toast("Failed to update status", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <Package className="h-4 w-4 text-purple-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(search) || 
    o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black font-serif flex items-center gap-3">
              Logistics Control <span className="bg-black text-[10px] text-white px-2 py-1 rounded">Admin</span>
            </h1>
            <p className="mt-1 text-xs text-gray-400 uppercase tracking-widest font-bold">Fulfillment Pipeline</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Order ID / Customer Name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all w-64"
                />
             </div>
             <button 
               onClick={fetchOrders}
               className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
             >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-200" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Reference</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fulfillment Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Revenue</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredOrders.map(order => (
                     <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-6 truncate">
                           <span className="text-xs font-mono font-bold text-black flex items-center gap-2">
                             #LUM-{order.id.toString().padStart(6, '0')}
                             <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                           </span>
                           <p className="text-[10px] text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-6">
                           <p className="text-xs font-bold text-black">{order.full_name}</p>
                           <p className="text-[10px] text-gray-400 mt-1">{order.email}</p>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                className={`text-[10px] font-bold uppercase tracking-widest bg-transparent focus:outline-none cursor-pointer border-b border-dotted ${
                                  order.status === 'paid' ? 'text-green-600' :
                                  order.status === 'shipped' ? 'text-blue-600' :
                                  'text-gray-400'
                                }`}
                              >
                                 <option value="pending">Pending</option>
                                 <option value="paid">Paid</option>
                                 <option value="shipped">Shipped</option>
                                 <option value="delivered">Delivered</option>
                                 <option value="cancelled">Cancelled</option>
                              </select>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex -space-x-3">
                              {order.items?.slice(0, 3).map((item: any) => (
                                <div key={item.id} className="h-8 w-6 rounded bg-gray-50 border border-white overflow-hidden shadow-sm">
                                   <img src={item.product?.imageUrl} className="h-full w-full object-cover" alt="" title={item.product?.name} />
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-black text-white text-[8px] flex items-center justify-center border border-white z-10">
                                   +{order.items.length - 3}
                                </div>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <p className="text-sm font-bold text-black">${Number(order.total_price).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex justify-center gap-4">
                              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Manifest</button>
                              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Label</button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-gray-200 rounded-3xl">
             <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-serif italic">No orders currently match your query in the pipeline.</p>
          </div>
        )}
      </main>
    </div>
  );
}
