from langchain_core.tools import tool
from products.models import Product, Category, Inventory
from products.serializers import ProductSerializer
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

@tool
def search_products(query: str, category: str = None, min_price: float = None, max_price: float = None, limit: int = 5):
    """Search for products by name, description, or keywords. Use filters for category or price range."""
    products = Product.objects.filter(is_active=True)
    if query:
        products = products.filter(Q(name__icontains=query) | Q(description__icontains=query))
    if category:
        products = products.filter(category__name__icontains=category)
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)
    
    data = ProductSerializer(products[:limit], many=True).data
    return data

@tool
def get_product_details(product_id: int):
    """Get full details (name, description, specs, images, category) for a specific product by ID."""
    try:
        product = Product.objects.get(id=product_id)
        return ProductSerializer(product).data
    except Product.DoesNotExist:
        return {"error": "Product not found"}

@tool
def check_stock_and_price(product_id: int):
    """Return current stock quantity and latest price for a product. Always use this for availability queries."""
    try:
        product = Product.objects.get(id=product_id)
        inventory = getattr(product, 'inventory', None)
        return {
            "name": product.name,
            "price": f"₦{product.price}",
            "stock_quantity": inventory.quantity if inventory else 0,
            "location": inventory.location if inventory else "Unknown"
        }
    except Product.DoesNotExist:
        return {"error": "Product not found"}

@tool
def get_recommendations(query: str, limit: int = 4):
    """Get personalized or similar product recommendations based on user query or previous interest."""
    # Simple keyword recommendation for now
    products = Product.objects.filter(is_active=True, is_featured=True)
    if not products.exists():
        products = Product.objects.filter(is_active=True)
    
    return ProductSerializer(products[:limit], many=True).data

@tool
def get_delivery_info(state: str):
    """Get estimated delivery time and cost to a Nigerian state (e.g., Lagos, Abuja, Ibadan)."""
    delivery_data = {
        "lagos": {"time": "1-2 days", "cost": "₦2,500"},
        "abuja": {"time": "3-5 days", "cost": "₦5,000"},
        "ibadan": {"time": "2-3 days", "cost": "₦3,000"},
        "port harcourt": {"time": "4-6 days", "cost": "₦6,000"},
        "kano": {"time": "5-7 days", "cost": "₦7,500"}
    }
    state_key = state.lower().strip()
    return delivery_data.get(state_key, {"time": "5-10 days", "cost": "Contact support for quote"})

@tool
def semantic_search(query: str):
    """Search for products using natural language descriptions, aesthetic vibes, or complex needs (e.g., 'elegant outfit for a Lagos wedding', 'something minimalist but tech-focused'). Use this when regular keyword search might fail."""
    from .rag_service import RAGService
    rag = RAGService()
    return rag.search(query)
@tool
def add_to_cart(product_id: int):
    """Adds a specific product to the user's shopping bag by ID. Only use this if the user explicitly asks to 'add to cart', 'buy this', or 'put this in my bag'."""
    try:
        product = Product.objects.get(id=product_id)
        data = ProductSerializer(product).data
        return {
            "success": True,
            "message": f"I've added the {product.name} to your bag for you! You can see it in your cart now.",
            "product": data,
            "directive": "AUTO_ADD_TO_CART"
        }
    except Product.DoesNotExist:
        return {"error": "Product not found"}

@tool
def track_order(order_number: str):
    """Retrieves the real-time status and details of an order using its order number (e.g., 'LUM-123456')."""
    from orders.models import Order
    try:
        order = Order.objects.get(order_number__iexact=order_number.strip())
        return {
            "order_number": order.order_number,
            "status": order.get_status_display(),
            "date": order.created_at.strftime("%Y-%m-%d"),
            "total": str(order.total_price),
            "summary": f"Order {order.order_number} is currently {order.get_status_display().lower()}. It was placed on {order.created_at.strftime('%B %d, %Y')}."
        }
    except Order.DoesNotExist:
        return {"error": f"I couldn't find an order with reference {order_number}. Please check the number and try again."}
