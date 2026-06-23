// ─── Lumière Platform Types ───────────────────────────────────────────────────

export type Product = {
    id: string;
    brand: string;
    storeId: string; 
    name: string;
    sku?: string;
    price: number;
    currency: string;
    imageUrl: string;
    category: number | string;
    category_name?: string;
    description?: string;
    specs?: Record<string, any>;
    tags: string[];
    inStock: boolean;
    stock: number;
    is_featured: boolean;
    gallery_images?: Array<{ image_url: string; alt_text?: string; order: number }>;
    matchReason?: string;
};

export type CartItem = Product & { quantity: number };

export type MessageRole = "ai" | "user";

export type ChatMessage = {
    id: string;
    role: MessageRole;
    text: string;
    timestamp: string;
    products?: Product[];
    state?: "loading" | "complete" | "error" | "no-results" | "partial";
    suggestions?: string[];
};

export type ChatApiRequest = {
    message: string;
    history: Array<{ role: MessageRole; content: string }>;
    storeId?: string;
};

export type ChatApiResponse = {
    message: string;
    products: Product[];
    suggestions: string[];
    state: "complete" | "no-results" | "partial";
};

export type StyleProfile = {
    userId: string;
    aesthetic: string[];
    brandAffinities: string[];
    avoidTags: string[];
    sizes: Record<string, string>;
};

export type NavItem = {
    id: string;
    label: string;
    href: string;
};

export type PanelTab = "bag" | "profile" | "insights";
