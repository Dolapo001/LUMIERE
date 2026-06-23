from rest_framework import serializers
from .models import Product, Category, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image_url', 'alt_text', 'order']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    imageUrl = serializers.ReadOnlyField(source='image_url')
    storeId = serializers.ReadOnlyField(source='brand')
    currency = serializers.SerializerMethodField()
    inStock = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    gallery_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'slug', 'description', 'specs', 'price', 
            'imageUrl', 'brand', 'storeId', 'category_name', 'currency', 
            'inStock', 'stock', 'color', 'is_featured', 'gallery_images'
        ]

    def get_currency(self, obj):
        return "NGN"

    def get_stock(self, obj):
        inventory = getattr(obj, 'inventory', None)
        return inventory.quantity if inventory else 0

    def get_inStock(self, obj):
        inventory = getattr(obj, 'inventory', None)
        return inventory.quantity > 0 if inventory else False if obj.is_active else False

