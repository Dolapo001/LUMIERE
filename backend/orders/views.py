from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated, AllowAny

from users.models import UserAddress

class CheckoutView(APIView):
    permission_classes = [AllowAny] 

    @transaction.atomic
    def post(self, request):
        items_data = request.data.get('items', [])
        shipping_data = request.data.get('shipping_address', {})
        payment_method = request.data.get('payment_method', 'card')
        
        if not items_data:
            return Response({"error": "No items in cart"}, status=status.HTTP_400_BAD_REQUEST)
        
        total = 0
        order_items_to_create = []
        
        try:
            for item in items_data:
                product = Product.objects.select_for_update().get(id=item['id'])
                quantity = int(item.get('quantity', 1))
                
                if product.stock < quantity:
                    return Response({
                        "error": f"Insufficient stock for {product.name}",
                        "product_id": product.id
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                total += float(product.price) * quantity
                order_items_to_create.append((product, quantity))

            user = request.user if request.user.is_authenticated else None
            
            order = Order.objects.create(
                user=user,
                full_name=shipping_data.get('full_name', ''),
                email=shipping_data.get('email', ''),
                address=shipping_data.get('address', ''),
                city=shipping_data.get('city', ''),
                state=shipping_data.get('state', ''),
                zip_code=shipping_data.get('zip_code', ''),
                phone=shipping_data.get('phone', ''),
                total_price=total, 
                payment_method=payment_method,
                status='paid' 
            )

            # --- Seamless Address Saving ---
            if user:
                # Check if this address already exists for the user to avoid duplicates
                address_exists = UserAddress.objects.filter(
                    user=user,
                    line1=shipping_data.get('address', ''),
                    city=shipping_data.get('city', ''),
                    postal_code=shipping_data.get('zip_code', '')
                ).exists()

                if not address_exists:
                    UserAddress.objects.create(
                        user=user,
                        full_name=shipping_data.get('full_name', ''),
                        line1=shipping_data.get('address', ''),
                        city=shipping_data.get('city', ''),
                        state=shipping_data.get('state', ''),
                        postal_code=shipping_data.get('zip_code', ''),
                        country=shipping_data.get('state', 'United Kingdom'), # Using state as country placeholder for now
                        is_default=(not UserAddress.objects.filter(user=user).exists())
                    )
            
            for product, quantity in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=product.price,
                    quantity=quantity
                )
                # Correctly update the related Inventory object
                inventory = product.inventory
                inventory.quantity -= quantity
                inventory.save()
                
            # --- Clear Cart (Production Level Integrity) ---
            if user:
                from .models import Cart, CartItem
                try:
                    user_cart = Cart.objects.get(user=user)
                    CartItem.objects.filter(cart=user_cart).delete()
                except Cart.DoesNotExist:
                    pass

            return Response({
                "message": "Order placed successfully", 
                "order_id": order.id,
                "order_number": order.order_number,
                "total": total,
                "cart_cleared": True
            }, status=status.HTTP_201_CREATED)
            
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework import generics
from .serializers import OrderSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow user to see their own order, or Admin to see any order
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

class AdminOrderUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()

    def patch(self, request, *args, **kwargs):
        # Specifically for status updates
        return self.partial_update(request, *args, **kwargs)

class TrackOrderView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        order_id = request.query_params.get('order_id')

        if not order_id:
            return Response({"error": "Order Reference is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(order_number=order_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({"error": "Order not found with provided credentials"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
