from django.db import models
from products.models import Product
from products.serializers import ProductSerializer

class ProductService:
    """Handles all interactions with the database for finding and filtering products."""
    
    def query_database(self, intent_data: dict) -> list:
        intent = intent_data.get("intent")
        filters = intent_data.get("filters", {})
        
        # Base Query
        products = Product.objects.filter(is_active=True)
        
        # Handle Special UI Filters
        special = filters.get("special")
        if special == "new_arrivals":
            products = products.order_by('-created_at')
        elif special == "featured":
            products = products.filter(is_featured=True)
        elif special == "sustainable":
            # For now, let's just return featured as a proxy or use description
            products = products.filter(models.Q(description__icontains="sustainable") | models.Q(description__icontains="eco"))
            
        # Apply individual filters
        category = filters.get("category")
        if category:
            products = products.filter(category__name__icontains=category)
        
        color = filters.get("color")
        if color:
            products = products.filter(color__icontains=color)
            
        brand = filters.get("brand")
        if brand:
            products = products.filter(brand__icontains=brand)
            
        max_price = filters.get("max_price") or intent_data.get("price_max")
        if max_price:
            products = products.filter(price__lte=max_price)

        keywords = filters.get("keywords")
        if keywords:
            for kw in keywords:
                products = products.filter(models.Q(name__icontains=kw) | models.Q(description__icontains=kw))

        # Fallback logic: 
        # 1. If we have results, great.
        # 2. If no results AND (general intent OR special UI button), show arrivals.
        # 3. If no results AND specific category/keyword search, return [] (strict).
        if not products.exists():
            if intent == "general" or filters.get("special"):
                products = Product.objects.all().order_by('-created_at')
            else:
                return []

        return ProductSerializer(products[:4], many=True).data
