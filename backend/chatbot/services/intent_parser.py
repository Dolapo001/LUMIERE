import json
import re

class IntentParser:
    """Handles extracting structured intent and parameters from user queries."""
    
    def __init__(self, llm_service):
        self.llm_service = llm_service

    def extract_intent(self, query: str, history: list) -> dict:
        history_str = self._format_history(history)
        
        prompt = f"""
        You are a semantic intent parser for Lumière, a luxury fashion house.
        
        CONVERSATIONAL HISTORY:
        {history_str}
        
        CURRENT USER QUERY: "{query}"

        TASK:
        1. Parse the query into an intent and search filters.
        2. Resolve pronouns (e.g., "them", "those") using history.
        3. Interpret modifications (e.g., "in black instead").
        4. Understand intents: "search_product", "product_info", "add_to_cart", "general".

        RETURN ONLY JSON:
        {{
            "intent": "search_product",
            "filters": {{
                "category": string | null,
                "max_price": number | null,
                "min_price": number | null,
                "color": string | null,
                "brand": string | null,
                "keywords": string[]
            }},
            "target_product_id": string | null,
            "context_ref": "short description of resolved context"
        }}
        """
        
        text = self.llm_service.generate(prompt)
        
        if text:
            try:
                if text.startswith("```"):
                    text = re.sub(r'^```(json)?\n', '', text)
                    text = re.sub(r'\n```$', '', text)
                return json.loads(text)
            except Exception as e:
                pass
                
        fallback_data = self._fallback_intent_extraction(query)
        return fallback_data

    def _format_history(self, history: list) -> str:
        if not history: return "None"
        formatted = []
        for msg in history[-5:]:
            role = "User" if msg['role'] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['text']}")
        return "\n".join(formatted)

    def _fallback_intent_extraction(self, query: str) -> dict:
        q = query.lower()
        # Default to general
        data = {"intent": "general", "filters": {"category": None, "max_price": None, "color": None, "brand": None, "keywords": [], "special": None}}
        
        # Keyword detection for Intent (Whole Word only)
        search_keywords = ["show", "find", "search", "looking for", "buy", "price", "black", "dress", "new", "latest", "arrival", "featured", "sustainable", "best", "popular", "minimalist"]
        if any(re.search(r'\b' + re.escape(k) + r'\b', q) for k in search_keywords):
            data["intent"] = "search_product"
        
        # Special flags for UI buttons (Whole Word)
        if any(re.search(r'\b' + re.escape(k) + r'\b', q) for k in ["new", "latest", "arrival"]):
            data["filters"]["special"] = "new_arrivals"
        elif any(re.search(r'\b' + re.escape(k) + r'\b', q) for k in ["featured", "popular", "best", "minimalist"]):
            data["filters"]["special"] = "featured"
        elif any(re.search(r'\b' + re.escape(k) + r'\b', q) for k in ["sustainable", "eco", "pure"]):
            data["filters"]["special"] = "sustainable"
        
        # Category Detection (Whole Word aliases)
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
            if any(re.search(r'\b' + re.escape(alias) + r'\b', q) for alias in aliases):
                data["filters"]["category"] = cat 
                data["intent"] = "search_product"
            
        colors = ["Black", "White", "Navy", "Beige", "Grey", "Camel", "Ecru", "Red", "Blue"]
        for color in colors:
            if re.search(r'\b' + re.escape(color.lower()) + r'\b', q): 
                data["filters"]["color"] = color
                data["intent"] = "search_product"

        price_match = re.search(r'(\d+)', q)
        if price_match and (re.search(r'\b(under|less|in)\b', q) or "$" in q or "k" in q):
            val = int(price_match.group(1))
            if "k" in q and val < 1000:
                val = val * 1000
            data["filters"]["max_price"] = val
            data["intent"] = "search_product"

        return data
