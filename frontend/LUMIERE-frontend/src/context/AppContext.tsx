"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, Product, ChatMessage as ChatMessageType } from "@/types";

interface AppContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    cartCount: number;
    cartTotal: number;
    messages: ChatMessageType[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Initial Hydration
    useEffect(() => {
        const savedCart = localStorage.getItem("lumiere_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsHydrated(true);
    }, []);

    // Sync to Storage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("lumiere_cart", JSON.stringify(cart));
        }
    }, [cart, isHydrated]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("lumiere_cart");
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    return (
        <AppContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                cartCount,
                cartTotal,
                messages,
                setMessages,
                setCart,
                clearCart
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
