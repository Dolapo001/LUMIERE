from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, null=True, blank=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    specs = models.JSONField(default=dict, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2) # Support for Large ₦ amounts
    color = models.CharField(max_length=50, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def stock(self):
        inventory = getattr(self, 'inventory', None)
        return inventory.quantity if inventory else 0
    
    @property
    def in_stock(self):
        return self.stock > 0

    def __str__(self):
        return self.name

class Inventory(models.Model):
    product = models.OneToOneField(Product, related_name='inventory', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    location = models.CharField(max_length=100, default="Lagos Warehouse") # Nigerian Friendly

    def __str__(self):
        return f"{self.product.name} - {self.quantity} in {self.location}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='gallery_images', on_delete=models.CASCADE)
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.product.name}"
