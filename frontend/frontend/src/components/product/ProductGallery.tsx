"use client";
import React, { useState } from 'react';

interface ProductGalleryProps {
    mainImageUrl: string;
    galleryImages?: Array<{ image_url: string; alt_text?: string }>;
    name: string;
}

export default function ProductGallery({ mainImageUrl, galleryImages = [], name }: ProductGalleryProps) {
    const images = galleryImages.length > 0 
        ? galleryImages.map(img => img.image_url) 
        : [mainImageUrl];
    
    const [activeImage, setActiveImage] = useState(images[0]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 shadow-sm border border-gray-100">
                <img 
                    src={activeImage} 
                    alt={name} 
                    className="h-full w-full object-cover transition-all duration-500"
                />
            </div>
            
            {/* Thumbnail Row */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((url, index) => (
                        <button 
                            key={index} 
                            onClick={() => setActiveImage(url)}
                            className={`aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 transition-all ${
                                activeImage === url ? 'border-black' : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img 
                                src={url} 
                                alt={`${name} thumbnail ${index + 1}`} 
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
