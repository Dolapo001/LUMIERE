import type { CartItem } from "@/types";
import { formatPrice } from "@/utils/format";

interface OrderReviewProps {
  cart: CartItem[];
  cartTotal: number;
  onNext: () => void;
  onBack: () => void;
}

export default function OrderReview({ cart, cartTotal, onNext, onBack }: OrderReviewProps) {
  const delivery = cartTotal >= 50000 ? 0 : 5000;
  const total = cartTotal + delivery;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight text-black mb-6">Review your order</h2>
      
      <div className="divide-y divide-gray-100 border-t border-gray-200 border-b mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between py-4">
            <div className="flex gap-4">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-gray-100 border border-gray-100">
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-black line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-black">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-black font-medium">{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivery</span>
          <span className="text-black font-medium">{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-black border-t border-gray-200 pt-3">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="w-1/3 rounded-md border border-gray-200 bg-white px-6 py-4 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="w-2/3 rounded-md bg-black px-6 py-4 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          Pay {formatPrice(total)}
        </button>
      </div>
    </div>
  );
}
