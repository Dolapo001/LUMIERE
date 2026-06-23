from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)

from users.views import RegisterView, CustomTokenObtainPairView, ProfileView, UserAddressViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from orders.views import CheckoutView, OrderHistoryView, AdminOrderListView, OrderDetailView, AdminOrderUpdateView, TrackOrderView

router.register(r'addresses', UserAddressViewSet, basename='address')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/chat/', include('chatbot.urls')),
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),
    path('api/orders/history/', OrderHistoryView.as_view(), name='order-history'),
    path('api/orders/track/', TrackOrderView.as_view(), name='order-track'),
    path('api/orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('api/admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('api/admin/orders/<int:pk>/update/', AdminOrderUpdateView.as_view(), name='admin-order-update'),
    path('api/', include(router.urls)),
]
