import React from 'react';
import { ArrowRight, Star, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-[#FAFAFA] flex items-center">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-accent/30 to-purple-300/30 blur-[120px] animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-blue-400/20 to-teal-300/20 blur-[130px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-tl from-purple-400/20 to-pink-300/20 blur-[100px] animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-10">
          
          {/* Main Glass Content Block */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/30 px-4 py-1.5 font-medium text-xs tracking-wide text-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] backdrop-blur-md mb-8">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Introducing The Visionary Collection</span>
            </div>
            
            <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tighter text-gray-900 leading-[0.95]">
              Redefining <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-500 to-purple-600 animate-gradient-x">
                modern luxury.
              </span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg text-gray-600 font-medium leading-relaxed">
              Experience the pinnacle of curation. We blend algorithmic precision with human artistry to elevate your everyday aesthetics.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link 
                href="/products" 
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] sm:w-auto hover:ring-4 ring-black/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/20 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                Explore Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <button 
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white/40 border border-white/60 px-8 py-4 text-sm font-semibold text-gray-900 backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-lg"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Play className="h-2.5 w-2.5 ml-0.5" fill="currentColor" />
                </div>
                Watch Film
              </button>
            </div>
            
            {/* Social Proof Stats */}
            <div className="mt-14 flex items-center gap-8 border-t border-gray-900/10 pt-8 w-full max-w-lg">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                ))}
              </div>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4" fill="currentColor" />)}
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-1">Trusted by 20,000+ creators</p>
              </div>
            </div>
          </div>
          
          {/* Abstract Glassmorphism Visual Composition */}
          <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] w-full hidden md:block mt-12 lg:mt-0">
            {/* Main Glass Card */}
            <div className="absolute top-[10%] right-[0%] w-full h-[80%] rounded-[2rem] border border-white/50 bg-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl overflow-hidden animate-float" style={{ animationDelay: '1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop" 
                alt="Fashion Editorial" 
                className="absolute inset-[4px] rounded-[1.8rem] w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
              />
              
              {/* Floating Element 1 - Product Card */}
              <div className="absolute -left-12 top-20 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-xl backdrop-blur-xl w-48 flex items-center gap-4 animate-float" style={{ animationDelay: '2.5s' }}>
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80" alt="Item" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Wool Coat</p>
                  <p className="text-xs text-accent font-semibold mt-0.5">$350.00</p>
                </div>
              </div>

              {/* Floating Element 2 - Status */}
              <div className="absolute -right-8 bottom-32 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-ping absolute"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 relative"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">In Stock Now</p>
                    <p className="text-[10px] text-gray-500 font-medium">Ready to ship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
