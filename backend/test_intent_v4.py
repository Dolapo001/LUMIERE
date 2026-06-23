import re

def _fallback_intent_extraction(query: str) -> dict:
    q = query.lower()
    data = {"intent": "general", "filters": {"category": None}}
    
    category_map = {
        "Outerwear": ["coat", "coats", "jacket", "jackets", "outerwear", "parka", "trench"],
        "Bags": ["bag", "bags", "handbag", "handbags", "tote", "totes", "clutch", "purse", "purses"],
        "Knitwear": ["sweater", "sweaters", "knitwear", "jumper", "cardigan", "knit"],
        "Trousers": ["trouser", "trousers", "pant", "pants", "jeans", "bottom", "bottoms", "slacks"],
        "Jackets": ["blazer", "blazers", "suit jacket", "jacket", "jackets"],
        "Fragrance": ["perfume", "fragrance", "scent", "eau de parfum"],
        "Accessories": ["scarf", "scarves", "belt", "belts", "hat", "hats", "accessory", "accessories"],
        "Shoes": ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "footwear"]
    }
    
    for cat, aliases in category_map.items():
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', q):
                print(f"Matched alias '{alias}' for category '{cat}'")
                data["filters"]["category"] = cat 
            
    return data

result = _fallback_intent_extraction("the trousers")
print(f"'the trousers' -> {result}")
result2 = _fallback_intent_extraction("what type of coat")
print(f"'what type of coat' -> {result2}")
