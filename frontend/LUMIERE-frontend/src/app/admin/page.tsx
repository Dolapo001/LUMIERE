"use client";
import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Search,
  ChevronRight,
  Loader2
} from "lucide-react";
import { adminApi, productApi } from "@/services/api";
import { useToast } from "@/context/ToastContext";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    stockAlerts: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, productRes] = await Promise.all([
        adminApi.getOrders(),
        productApi.getProducts()
      ]);

      const orderList = Array.isArray(orderRes) ? orderRes : [];
      const productList = Array.isArray(productRes) ? productRes : (productRes.results || []);

      setOrders(orderList);
      setProducts(productList);

      // Simple Stat Calculation
      const rev = orderList.reduce((acc: number, curr: any) => acc + Number(curr.total_price), 0);
      const lowStock = productList.filter((p: any) => p.stock < 10).length;

      setStats({
        totalRevenue: rev,
        totalOrders: orderList.length,
        activeProducts: productList.length,
        stockAlerts: lowStock
      });
    } catch (err: any) {
      console.error("Staff access error:", err);
      if (err.response?.status === 403) {
        toast("Staff access required", "error");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Entering Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black tracking-tight">Staff Operations</h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Global Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders or IDs..."
                className="rounded-full border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-black focus:outline-none transition-all w-64 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 mt-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Revenue" 
            value={`₦${stats.totalRevenue.toLocaleString()}`} 
            icon={<TrendingUp className="h-4 w-4" />}
            trend="+12% from last month"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <StatCard 
            title="Inventory" 
            value={stats.activeProducts.toString()} 
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard 
            title="Stock Alerts" 
            value={stats.stockAlerts.toString()} 
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
            alert={stats.stockAlerts > 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black">Recent Orders</h3>
              <button className="text-[10px] font-bold text-gray-400 hover:text-black uppercase">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-black">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-500">{order.user_email}</td>
                      <td className="px-6 py-4 font-medium text-black">₦{Number(order.total_price).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black">Inventory Overview</h3>
            </div>
            <div className="p-6 space-y-6">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={product.imageUrl} className="h-10 w-10 object-cover rounded bg-gray-100" />
                    <div>
                      <p className="text-sm font-semibold text-black leading-none">{product.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{product.category_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-black'}`}>
                      {product.stock} left
                    </p>
                    <div className="w-16 h-1 bg-gray-100 mt-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${product.stock < 10 ? 'bg-red-500' : 'bg-black'}`} 
                        style={{ width: `${Math.min(product.stock * 2, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 border border-gray-200 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
                Manage Inventory
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, alert = false }: any) {
  return (
    <div className={`bg-white rounded-xl border p-6 shadow-sm ${alert ? 'border-red-100' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg ${alert ? 'bg-red-50' : 'bg-gray-50'}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-black tracking-tight">{value}</span>
      </div>
      {trend && <p className="text-[10px] text-green-500 font-bold mt-2">{trend}</p>}
    </div>
  );
}
