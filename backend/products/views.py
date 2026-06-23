from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category_name = django_filters.CharFilter(field_name="category__name", lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['category', 'color', 'brand', 'min_price', 'max_price', 'category_name', 'is_featured']

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand', 'category__name']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        return queryset

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()
        price = float(product.price)
        
        # Intelligent Filter: Same category, active, excluding self
        # Priority 1: Same category + similar price (+/- 40%)
        related_products = Product.objects.filter(
            category=product.category,
            price__gte=price * 0.6,
            price__lte=price * 1.4,
            is_active=True
        ).exclude(id=product.id)
        
        # If not enough, expand to brand items
        if related_products.count() < 4:
            brand_items = Product.objects.filter(
                brand=product.brand,
                is_active=True
            ).exclude(id__in=[p.id for p in related_products]).exclude(id=product.id)
            related_products = list(related_products) + list(brand_items)
            
        # Limit to 4
        final_list = related_products[:4]
        serializer = self.get_serializer(final_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def metadata(self, request):
        categories = Category.objects.all().values('id', 'name', 'slug')
        colors = Product.objects.filter(is_active=True).values_list('color', flat=True).distinct()
        brands = Product.objects.filter(is_active=True).values_list('brand', flat=True).distinct()
        
        # Filter out empty strings
        colors = [c for c in colors if c]
        brands = [b for b in brands if b]

        return Response({
            "categories": categories,
            "colors": sorted(colors),
            "brands": sorted(brands)
        })

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        products = Product.objects.filter(
            name__icontains=query, 
            is_active=True
        ).values_list('name', flat=True).distinct()[:5]
        
        return Response(products)

    @action(detail=False, methods=['post'])
    def validate_cart(self, request):
        items = request.data.get('items', [])
        results = []
        is_valid = True
        
        for item in items:
            try:
                product = Product.objects.get(id=item['id'])
                requested_qty = int(item['quantity'])
                
                status = "available"
                available_qty = product.stock
                
                if not product.is_active:
                    status = "inactive"
                    is_valid = False
                elif available_qty <= 0:
                    status = "out_of_stock"
                    is_valid = False
                elif available_qty < requested_qty:
                    status = "limited_stock"
                    # We don't mark as invalid, just warn they'll get max available
                
                results.append({
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "status": status,
                    "available_qty": available_qty,
                    "imageUrl": product.image_url
                })
            except Product.DoesNotExist:
                results.append({"id": item['id'], "status": "not_found"})
                is_valid = False
                
        return Response({
            "is_valid": is_valid,
            "items": results
        })

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
