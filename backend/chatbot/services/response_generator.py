class ResponseGenerator:
    """Generates user-facing responses using context from DB and conversation history."""
    
    def __init__(self, llm_service):
        self.llm_service = llm_service

    def generate_response(self, query: str, products: list, history: list, intent_data: dict) -> str:
        if self.llm_service.model:
            return self._generate_ai_message(query, products, history, intent_data)
        return self._generate_fallback_message(query, products)

    def _generate_ai_message(self, query: str, products: list, history: list, intent_data: dict) -> str:
        product_context = "\n".join([f"- {p['name']} (${p['price']})" for p in products])
        history_str = self._format_history(history)
        
        filters = intent_data.get('filters', {})
        aesthetic_intent = f"{filters.get('category', '')} / {filters.get('color', '')}"
        
        prompt = f"""
        You are Lumière's elite digital stylist. 
        Your tone is curated, authoritative, yet approachable. Think French Vogue editor.
        
        CONTEXT HISTORY: {history_str}
        USER QUERY: "{query}"
        AESTHETIC INTENT: {aesthetic_intent}
        
        AVAILABLE PIECES FROM OUR BOUTIQUE:
        {product_context}
        
        TASK:
        1. Base your answer STRICTLY on the "AVAILABLE PIECES FROM OUR BOUTIQUE" provided above.
        2. If products are available, select the most relevant one and provide a specific OR aesthetic reason for the choice.
        3. If no products are available, recommend a tonal alternative or suggest browsing our core essentials.
        4. NEVER invent or hallucinate products or prices. ONLY mention pieces explicitly provided in the list.
        5. Never mention "found in database" or technical backend terms. Speak in terms of textiles, cut, and occasions.
        6. Keep response under 50 words.
        """
        
        text = self.llm_service.generate(prompt)
        if text:
            return text
        return self._generate_fallback_message(query, products)

    def _generate_fallback_message(self, query: str, products: list) -> str:
        q = query.lower()
        if not products:
            if any(greet in q for greet in ["hi", "hello", "hey"]):
                return "Bonjour! I am your Lumière digital stylist. How may I assist your wardrobe today?"
            
            if "size" in q:
                return "Our sizing is tailored to European standards. You can find a detailed 'Size Guide' on every product page."
            
            return "I couldn't find exactly that in our current collection. Perhaps browse our 'New Arrivals' for inspiration?"
            
        # Dynamic mention of products
        message = f"I've curated {len(products)} selection(s) for you"
        if products:
             message += f", including the {products[0]['name']}"
        
        return message + ". Would you like to see more details?"

    def _format_history(self, history: list) -> str:
        if not history: return "None"
        formatted = []
        for msg in history[-5:]:
            role = "User" if msg['role'] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['text']}")
        return "\n".join(formatted)

    def get_suggestions(self, intent_data: dict, products: list) -> list:
        filters = intent_data.get("filters", {})
        if not products: 
            return ["New Arrivals", "Best Sellers", "Minimalist Wardrobe"]
            
        category = filters.get("category")
        if category: 
            return [f"More {category}", "Style Guide", "Reviews"]
            
        return ["Complete the look", "Check size guide", "Shipping info"]
