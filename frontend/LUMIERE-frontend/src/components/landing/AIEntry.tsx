"use client";
import React from 'react';

export default function AIEntry() {
  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          {/* Subtle Background Glow behind the content */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 via-transparent to-accent/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="relative flex flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-12">
            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black">
                <span className="text-xl font-serif italic">S</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-black">
                  Personal Styling Session
                </h2>
                <p className="mt-2 max-w-xl text-base text-gray-500">
                  Connect with our dedicated support team to curate options, locate exact fits, and navigate seasonal collections.
                </p>
              </div>
            </div>
            <button 
              className="group/btn flex shrink-0 items-center justify-center rounded-md bg-black px-8 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
