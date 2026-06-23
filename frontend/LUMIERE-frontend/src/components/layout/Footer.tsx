import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white pt-16 pb-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tighter text-black">
              LUMIÈRE
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed">
              Curating minimal, highly-structured essentials for the modern wardrobe. Engineered for longevity.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8 md:col-span-3 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-black mb-4">Shop</h3>
              <ul className="flex flex-col gap-3">
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-black transition-colors">All Products</Link></li>
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-black transition-colors">New Arrivals</Link></li>
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-black transition-colors">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-black mb-4">Support</h3>
              <ul className="flex flex-col gap-3">
                <li><Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Shipping & Returns</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-black mb-4">Legal</h3>
              <ul className="flex flex-col gap-3">
                <li><Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Lumière. All rights reserved.</p>
          <div className="mt-4 flex gap-4 md:mt-0">
            {/* Minimal SVG icons for realism */}
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
