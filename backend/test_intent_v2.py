def _fallback_intent_extraction(query: str) -> dict:
    q = query.lower()
    data = {"intent": "general", "filters": {"category": None}}
    
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
        for alias in aliases:
            if alias in q:
                print(f"Matched alias '{alias}' for category '{cat}'")
                data["filters"]["category"] = cat 
            
    return data

result = _fallback_intent_extraction("what type of coat is available and price")
print(result)
