import re

def _fallback_intent_extraction(query: str) -> dict:
    q = query.lower()
    data = {"intent": "general", "filters": {"category": None, "max_price": None, "color": None, "brand": None, "keywords": [], "special": None}}
    
    search_keywords = ["show", "find", "search", "looking for", "buy", "price", "black", "dress", "new", "latest", "arrival", "featured", "sustainable", "best", "popular", "minimalist"]
    if any(k in q for k in search_keywords):
        data["intent"] = "search_product"
    
    if any(k in q for k in ["new", "latest", "arrival"]):
        data["filters"]["special"] = "new_arrivals"
    elif any(k in q for k in ["featured", "popular", "best", "minimalist"]):
        data["filters"]["special"] = "featured"
    
    category_map = {
        "Outerwear": ["coat", "jacket", "outerwear", "parka", "trench"],
        "Bags": ["bag", "handbag", "tote", "clutch", "purse"],
        "Knitwear": ["sweater", "knitwear", "jumper", "cardigan", "knit"],
        "Trousers": ["trouser", "pant", "jeans", "bottom", "slacks"],
        "Jackets": ["blazer", "suit jacket", "jacket"],
        "Fragrance": ["perfume", "fragrance", "scent", "eau de parfum"],
        "Accessories": ["scarf", "belt", "hat", "accessory", "accessories"],
        "Shoes": ["shoe", "sneaker", "boot", "footwear"]
    }
    
    for cat, aliases in category_map.items():
        if any(alias in q for alias in aliases):
            data["filters"]["category"] = cat 
            data["intent"] = "search_product"
            
    return data

result = _fallback_intent_extraction("what type of coat is available and price")
print(result)
