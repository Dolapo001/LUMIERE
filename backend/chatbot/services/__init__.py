from .llm_service import LLMService
from .intent_parser import IntentParser
from .product_service import ProductService
from .response_generator import ResponseGenerator

class ChatbotService:
    """Orchestrates the LLM, Intent Parser, Product Querying, and Response Generation."""
    
    def __init__(self):
        # 1. Initialize core dependencies
        self.llm_service = LLMService()
        self.intent_parser = IntentParser(self.llm_service)
        self.product_service = ProductService()
        self.response_generator = ResponseGenerator(self.llm_service)

    def process_query(self, query: str, history: list = None) -> dict:
        """Main control center: Intent -> Query DB -> Format Response"""
        
        # 1. Intent Detection (LLM) - Understand what the user wants
        intent_data = self.intent_parser.extract_intent(query, history)
        
        # 2. Database Query (Backend Logic) - Fetch real data using strict backend filters
        products = self.product_service.query_database(intent_data)
        
        # 3. Response Generation (LLM again) - Format the response securely using real DB products
        message = self.response_generator.generate_response(query, products, history, intent_data)
        
        # 4. Generate helpful suggestions
        suggestions = self.response_generator.get_suggestions(intent_data, products)
        
        return {
            "message": message,
            "products": products,
            "intent": intent_data.get("intent", "general"),
            "intent_data": intent_data,
            "suggestions": suggestions,
            "state": "complete" if products else "no-results",
            "context_ref": intent_data.get("context_ref")
        }
