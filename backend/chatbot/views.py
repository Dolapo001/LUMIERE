from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from .services.agent import LumiereAgent
from .services.tools import search_products
from .models import ChatSession, ChatMessage
from products.models import Product
from django.db.models import Q
import json
import logging

logger = logging.getLogger(__name__)

BASIC_RESPONSES = {
    # Logistics
    "shipping": "We ship across all 36 Nigerian states! Lagos deliveries take 1-2 days (₦2,500), while major cities like Abuja and Port Harcourt take 3-5 days (₦5,000-₦6,000).",
    "delivery": "We ship across all 36 Nigerian states! Lagos deliveries take 1-2 days (₦2,500), while major cities like Abuja and Port Harcourt take 3-5 days (₦5,000-₦6,000).",
    "track": "You can track your order using the 'Track Order' link in the footer or by asking me for your order status if the brain is online!",
    
    # Policies
    "return": "We offer a 7-day return policy for unworn items in their original packaging with tags intact. Returns within Lagos are free; outside Lagos may incur a shipping fee.",
    "refund": "Once your return is inspected and approved, refunds are processed to your original payment method within 3-5 business days.",
    "size": "Most of our pieces follow standard UK sizing. You can find a detailed size guide on every product page to help you find the perfect fit.",
    "authentic": "Every item at Lumière is 100% authentic, sourced directly from the designers or authorized distributors. Quality is our obsession.",
    
    # Payments & Discounts
    "pay": "We accept all major Nigerian debit cards via Paystack, as well as Bank Transfers and 'Buy Now, Pay Later' via CDcare.",
    "payment": "We accept all major Nigerian debit cards via Paystack, as well as Bank Transfers and 'Buy Now, Pay Later' via CDcare.",
    "discount": "You can apply your promo code at the checkout page. Keep an eye on our newsletter for seasonal style codes!",
    "promo": "You can apply your promo code at the checkout page. Keep an eye on our newsletter for seasonal style codes!",
    "coupon": "You can apply your promo code at the checkout page. Keep an eye on our newsletter for seasonal style codes!",
    
    # Specialized Services
    "bespoke": "Many of our Nigerian designer pieces can be customized to your measurements. Contact our concierge at support@lumiere.com to start a bespoke order.",
    "custom": "Many of our Nigerian designer pieces can be customized to your measurements. Contact our concierge at support@lumiere.com to start a bespoke order.",
    "bulk": "For wholesale or large corporate orders, please reach out to our trade department at trade@lumiere.com.",
    "wholesale": "For wholesale or large corporate orders, please reach out to our trade department at trade@lumiere.com.",
    "gift": "We offer premium gift wrapping for a small fee. You can select the 'Gift Wrap' option during checkout to add a personalized touch.",
    
    # Brand/Location
    "location": "We are primarily an online atelier, but our main distribution hub is in Victoria Island, Lagos. We don't have a walk-in showroom yet!",
    "store": "We are primarily an online atelier, but our main distribution hub is in Victoria Island, Lagos. We don't have a walk-in showroom yet!",
    "hours": "Our concierge is available Monday to Saturday, 9 AM to 6 PM WAT.",
    "job": "We are always looking for creative talent! Check our 'Careers' page or send your portfolio to careers@lumiere.com.",
    "career": "We are always looking for creative talent! Check our 'Careers' page or send your portfolio to careers@lumiere.com.",
    "social": "Follow our fashion journey on Instagram and X @LumiereAtelier for the latest drops and styling tips.",
    "instagram": "Follow our fashion journey on Instagram @LumiereAtelier for the latest drops and styling tips.",
    
    # Greetings & Support
    "contact": "You can reach our concierge team at support@lumiere.com or via WhatsApp at +234 810 LUMIERE.",
    "support": "Need help? You can track your order in the 'Track Order' section or contact us at support@lumiere.com.",
    "hi": "Hello! Welcome to Lumière. I'm your AI stylist—how can I help you find the perfect pieces today?",
    "hello": "Hi there! Looking for something special? I can help you browse our latest collections.",
    "who are you": "I am Lumière Assistant, your personal guide to modern Nigerian fashion. I can help you find products, check sizes, and track your orders.",
    "thanks": "You're very welcome! Let me know if you need anything else to complete your look.",
    "thank you": "You're very welcome! Let me know if you need anything else to complete your look.",
    "bye": "Goodbye! Stay stylish and see you soon at Lumière.",
}

async def get_user_from_request(request):
    """Manually authenticate JWT in async view"""
    try:
        authenticator = JWTAuthentication()
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        # DRF expects the header to include 'Bearer '
        token = auth_header.split(' ')[1]
        validated_token = await sync_to_async(authenticator.get_validated_token)(token)
        user = await sync_to_async(authenticator.get_user)(validated_token)
        return user
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        return None

@csrf_exempt
async def chat_view(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
        
    query = data.get('message', '').strip()
    session_id = data.get('session_id')
    history = data.get('history', [])

    if not query:
        return JsonResponse({"error": "Message is required"}, status=400)

    # 1. Authenticate and Manage Session Persistence
    user = await get_user_from_request(request)
    chat_session = None
    if user and session_id:
        chat_session, _ = await sync_to_async(ChatSession.objects.get_or_create)(
            session_id=session_id,
            defaults={'user': user}
        )
        if chat_session.user != user:
            # Security: Ensure users can't access each other's sessions
            return JsonResponse({"error": "Unauthorized session"}, status=403)
        
        # Save User Message
        await sync_to_async(ChatMessage.objects.create)(
            session=chat_session,
            sender='user',
            content=query
        )

    # 2. Fast-Path Detection (Bypass LLM for Speed)
    query_lower = query.lower()
    product_keywords = ["show", "find", "search", "looking", "buy", "price", "is", "stock", "shirt", "pant", "shoe", "bag", "dress", "kaftan", "ankara", "silk", "loafers", "leather", "phone", "samsung", "electronics", "fashion"]
    
    # Identify simple "Shop & Browse" intent (no previous context needed)
    is_simple_browse = (
        any(kw in query_lower for kw in ["show", "find", "available", "browse"]) and 
        any(kw in query_lower for kw in product_keywords) and
        len(query.split()) <= 6
    )

    if is_simple_browse:
        async def fast_path_generator():
            fillers = {"available", "show me some", "show me", "can you find", "find me", "do you have", "any", "all", "the", "a", "an", "i am looking for", "looking for", "search for", "tell me about", "i want to buy"}
            search_term = query_lower
            for filler in sorted(fillers, key=len, reverse=True):
                search_term = f" {search_term} ".replace(f" {filler} ", " ").strip()
            
            from products.models import Category
            found_products = []
            
            # Try Category then Keyword
            terms_to_try = [search_term, search_term.rstrip('s'), search_term + 's']
            for t in terms_to_try:
                if not t: continue
                if await sync_to_async(Category.objects.filter(name__iexact=t).exists)():
                    found_products = await sync_to_async(search_products.invoke)("", category=t)
                    if found_products: break
            if not found_products:
                for t in terms_to_try:
                    if not t: continue
                    found_products = await sync_to_async(search_products.invoke)(t)
                    if found_products: break

            if found_products and isinstance(found_products, list):
                msg = f"*Lumière Concierge (Instant Search)*\n\nI've pulled the available '{search_term or 'items'}' for you: 📦\n\n"
                yield msg
                for p in found_products[:3]:
                    yield f"|PRODUCT_JSON|{json.dumps(p)}|END_PRODUCT|"
                
                # Persistence
                if chat_session:
                    await sync_to_async(ChatMessage.objects.create)(session=chat_session, sender='ai', content=msg, structured_data={"products": found_products[:3]})
                return

        # If it's a simple browse, try to find products instantly
        fillers = {"available", "show me some", "show me", "can you find", "find me", "do you have", "any", "all", "the", "a", "an", "i am looking for", "looking for", "search for", "tell me about", "i want to buy"}
        search_term = query_lower
        for filler in sorted(fillers, key=len, reverse=True):
            search_term = f" {search_term} ".replace(f" {filler} ", " ").strip()
        
        from products.models import Category
        # Quick check for matches
        has_match = False
        terms_to_try = [search_term, search_term.rstrip('s'), search_term + 's']
        for t in terms_to_try:
            if not t: continue
            if await sync_to_async(Category.objects.filter(name__iexact=t).exists)() or \
               await sync_to_async(Product.objects.filter(Q(name__icontains=t) | Q(description__icontains=t)).exists)():
                has_match = True
                break
        
        if has_match:
            return StreamingHttpResponse(fast_path_generator(), content_type='text/plain')

    # 3. Heuristic Pre-Check (Saves Quota + High Availability)
    fallback_response = None
    
    # Check for simple matches (prioritize longer phrases)
    sorted_keys = sorted(BASIC_RESPONSES.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key in query_lower:
            fallback_response = BASIC_RESPONSES[key]
            break

    # If it's a very short greeting or simple FAQ, use the heuristic immediately
    if fallback_response and (len(query.split()) <= 3 or "shipping" in query_lower or "contact" in query_lower):
        async def heuristic_generator():
            yield "*Lumière Concierge (Fast Response)*\n\n"
            yield fallback_response
            # Add relevant suggestions
            suggestions = ["Show me new arrivals", "Track an order", "What is your return policy?"]
            yield f"|SUGGESTIONS|{json.dumps(suggestions)}|END_SUGGESTIONS|"
            if chat_session:
                await sync_to_async(ChatMessage.objects.create)(
                    session=chat_session, sender='ai', content=fallback_response
                )
        return StreamingHttpResponse(heuristic_generator(), content_type='text/plain')

    # 3. LLM Agent Processing
    logger.info(f"Chat request received: {query}")
    agent = LumiereAgent()

    async def stream_generator():
        full_ai_response = ""
        full_structured_data = [] # To save product cards in DB
        
        try:
            async for chunk in agent.astream(query, history):
                if chunk:
                    full_ai_response += chunk
                    yield chunk
        except Exception as e:
            error_str = str(e)
            logger.error(f"Streaming error for session {session_id}: {error_str}")
            
            if "429" in error_str or "quota" in error_str.lower():
                has_yielded = False
                
                # Detect Product-Related Intent
                product_keywords = ["show", "find", "search", "looking", "buy", "price", "is", "stock", "shirt", "pant", "shoe", "bag", "dress", "kaftan", "ankara", "silk", "loafers", "leather", "phone", "samsung", "electronics", "fashion"]
                if any(kw in query_lower for kw in product_keywords):
                    fillers = {"available", "show me some", "show me", "can you find", "find me", "do you have", "any", "all", "the", "a", "an", "please", "could you", "thanks", "thank you", "i am looking for", "looking for", "search for", "tell me about", "i want to buy"}
                    search_term = query_lower
                    for filler in sorted(fillers, key=len, reverse=True):
                        search_term = f" {search_term} ".replace(f" {filler} ", " ").strip()
                    
                    try:
                        from products.models import Category
                        found_products = []
                        
                        # EXHAUSTIVE MULTI-PERMUTATION SEARCH
                        # 1. Category-First (Strict)
                        terms_to_try = [search_term, search_term.rstrip('s'), search_term + 's']
                        for t in terms_to_try:
                            if not t: continue
                            if await sync_to_async(Category.objects.filter(name__iexact=t).exists)():
                                found_products = await sync_to_async(search_products.invoke)("", category=t)
                                if found_products: break
                        
                        # 2. Keyword Search
                        if not found_products:
                            for t in terms_to_try:
                                if not t: continue
                                found_products = await sync_to_async(search_products.invoke)(t)
                                if found_products: break

                        if found_products and isinstance(found_products, list):
                            display_term = search_term if search_term else "our collection"
                            msg = f"\n\nI've pulled the available '{display_term}' from our warehouse inventory: 📦\n\n"
                            yield msg
                            full_ai_response += msg
                            for p in found_products[:3]:
                                card = f"|PRODUCT_JSON|{json.dumps(p)}|END_PRODUCT|"
                                yield card
                                full_ai_response += card
                                full_structured_data.append(p)
                            
                            # Add suggestions for products
                            suggestions = [f"Do you have {display_term} in blue?", "What is the price?", "How fast is shipping?"]
                            yield f"|SUGGESTIONS|{json.dumps(suggestions)}|END_SUGGESTIONS|"
                            has_yielded = True
                    except Exception as tool_err:
                        logger.error(f"Robust Fallback search failed: {str(tool_err)}")

                if not has_yielded:
                    fallback_msg = f"\n\n*Heuristic Fallback Activated*\n\n{fallback_response}" if fallback_response else "\n\nI've reached my daily limit of fashion wisdom. While I can't browse the shelves right now, I can still help with basic questions about shipping, contact info, or tracking. 🕊️"
                    yield fallback_msg
                    full_ai_response += fallback_msg
                    
                    # Suggestions for emergency fallback
                    suggestions = ["Track my order", "Payment options", "Contact support"]
                    yield f"|SUGGESTIONS|{json.dumps(suggestions)}|END_SUGGESTIONS|"

            else:
                msg = "\n\nI'm having a bit of trouble connecting to our stylist network right now. Please try again in a moment."
                yield msg
                full_ai_response += msg
                
                # Suggestions for error state
                suggestions = ["Try again", "Show trending pieces", "Shipping info"]
                yield f"|SUGGESTIONS|{json.dumps(suggestions)}|END_SUGGESTIONS|"
        
        # Save AI Response to History (Persistent & Unique)
        if chat_session and full_ai_response:
             await sync_to_async(ChatMessage.objects.create)(
                session=chat_session,
                sender='ai',
                content=full_ai_response,
                structured_data={"products": full_structured_data} if full_structured_data else None
            )

    return StreamingHttpResponse(stream_generator(), content_type='text/plain')

@csrf_exempt
async def chat_history_view(request):
    """Retrieve persistent chat history for the authenticated user"""
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    user = await get_user_from_request(request)
    if not user:
        return JsonResponse({"history": []}) # Guest users have no server history
    
    try:
        # Get the latest session for this user
        session = await sync_to_async(
            ChatSession.objects.filter(user=user).order_by('-created_at').first
        )()
        
        if not session:
            return JsonResponse({"history": [], "session_id": None})
            
        messages = await sync_to_async(list)(
            ChatMessage.objects.filter(session=session).order_by('created_at')
        )
        
        history_data = []
        for m in messages:
            # Handle text message
            history_data.append({
                "id": str(m.id),
                "sender": m.sender if m.sender == 'user' else 'support',
                "type": "text",
                "content": m.content,
                "timestamp": m.created_at.isoformat()
            })
            
            # If there's structured product data, append it as product cards
            if m.structured_data and "products" in m.structured_data:
                for p in m.structured_data["products"]:
                    history_data.append({
                        "id": f"p-{m.id}-{p.get('id')}",
                        "sender": "support",
                        "type": "product",
                        "content": "",
                        "product": p,
                        "timestamp": m.created_at.isoformat()
                    })
        
        return JsonResponse({
            "history": history_data,
            "session_id": session.session_id
        })
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        return JsonResponse({"error": "Internal server error"}, status=500)
