"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { orderApi } from "@/services/api";

interface OrderItem {
  id: string;
  product: {
    name: string;
    imageUrl: string;
  };
  price: string;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  total_price: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getHistory();
        setOrders(data.results || data);
      } catch (err) {
        setError("Failed to load order history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'processing':
        return 'bg-amber-50 text-amber-800 ring-amber-600/20';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'delivered':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-red-100 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-xs font-bold uppercase tracking-widest text-black underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-100 text-center animate-in fade-in">
        <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
        <Link href="/products" className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-white bg-black px-6 py-3 rounded hover:opacity-90 transition-opacity">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-black">Order History</h2>
        <p className="mt-1 text-sm text-gray-500">View and track your previous purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-medium text-gray-500 uppercase tracking-widest text-[10px]">Order Reference</p>
                  <p className="font-semibold text-black mt-1">{order.order_number || `#${order.id}`}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 uppercase tracking-widest text-[10px]">Date Placed</p>
                  <p className="font-medium text-black mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 uppercase tracking-widest text-[10px]">Total Amount</p>
                  <p className="font-bold text-black mt-1">${parseFloat(order.total_price).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <Link href={`/track?id=${order.order_number || order.id}`} className="hidden sm:flex text-xs font-bold uppercase tracking-widest text-black rounded border border-black px-4 py-1.5 hover:bg-gray-50 transition-colors">
                  Track Order
                </Link>
                <Link href="#" className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-black hover:underline underline-offset-4">
                  View Receipt <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
              <div className="flex-1 space-y-2 text-sm text-gray-600">
                {order.items.map((item) => (
                  <p key={item.id}><span className="font-medium text-black">{item.quantity}x</span> {item.product.name}</p>
                ))}
              </div>
              
              <div className="shrink-0 flex flex-col sm:items-end w-full sm:w-auto">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset capitalize w-fit ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
                
                {order.status.toLowerCase() !== 'delivered' && (
                  <Link href={`/track?id=${order.order_number || order.id}`} className="mt-4 flex sm:hidden items-center justify-center w-full rounded border border-black py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors">
                    Track Package
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
