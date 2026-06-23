import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, Category, Inventory
from django.utils.text import slugify

def seed_data():
    categories = [
        "Electronics", "Fashion", "Accessories", "Home & Living", "Beauty"
    ]
    
    cat_objs = {}
    for cat in categories:
        obj, _ = Category.objects.get_or_create(name=cat, defaults={'slug': slugify(cat)})
        cat_objs[cat] = obj

    products = [
        # ELECTRONICS
        {
            "name": "Oraimo FreePods 4",
            "category": "Electronics",
            "price": 45000.00,
            "description": "True Wireless Earbuds with Active Noise Cancellation.",
            "sku": "ELEC-ORA-FP4",
            "specs": {"connectivity": "Bluetooth 5.2", "battery": "35.5 hrs"},
            "brand": "Oraimo", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"
        },
        {
            "name": "Samsung Galaxy S23 Ultra",
            "category": "Electronics",
            "price": 1250000.00,
            "description": "Premium flagship smartphone with 200MP camera.",
            "sku": "ELEC-SAM-S23U",
            "specs": {"screen": "6.8 inch", "ram": "12GB"},
            "brand": "Samsung", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=600&q=80"
        },
        {
            "name": "MacBook Air M2",
            "category": "Electronics",
            "price": 1850000.00,
            "description": "Thin and light Apple laptop with powerful M2 chip.",
            "sku": "ELEC-APL-M2",
            "specs": {"cpu": "M2", "ram": "8GB"},
            "brand": "Apple", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"
        },
        {
            "name": "Sony WH-1000XM5",
            "category": "Electronics",
            "price": 450000.00,
            "description": "Industry-leading noise canceling headphones.",
            "sku": "ELEC-SON-XM5",
            "specs": {"type": "Over-ear", "battery": "30 hrs"},
            "brand": "Sony", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
        },

        # FASHION
        {
            "name": "Adire Silk Kaftan",
            "category": "Fashion",
            "price": 35000.00,
            "description": "Hand-dyed Adire silk kaftan from Abeokuta.",
            "sku": "FASH-ADR-KFT",
            "specs": {"material": "Pure Silk", "origin": "Abeokuta"},
            "brand": "Lumière Local", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1583329931327-024036136f97?w=600&q=80"
        },
        {
            "name": "Handmade Leather Loafers",
            "category": "Fashion",
            "price": 65000.00,
            "description": "Handcrafted loafers from authentic Kano leather.",
            "sku": "FASH-LTH-LFR",
            "specs": {"material": "Genuine Leather", "color": "Dark Brown"},
            "brand": "Kano Crafts", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=600&q=80"
        },
        {
            "name": "Ankara Print Shirt",
            "category": "Fashion",
            "price": 15000.00,
            "description": "High-quality cotton shirt with vibrant Ankara patterns.",
            "sku": "FASH-ANK-SHRT",
            "specs": {"material": "100% Cotton", "fit": "Slim fit"},
            "brand": "Lumière Local", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
        },
        {
            "name": "Linen Trousers",
            "category": "Fashion",
            "price": 25000.00,
            "description": "Breezy and comfortable linen trousers for warm weather.",
            "sku": "FASH-LIN-TRS",
            "specs": {"material": "Linen Blend", "color": "Beige"},
            "brand": "Lumière Local", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80"
        },

        # ACCESSORIES
        {
            "name": "Kano Leather Wallet",
            "category": "Accessories",
            "price": 15000.00,
            "description": "Slim bi-fold wallet from premium tanned leather.",
            "sku": "ACC-KNO-WLT",
            "specs": {"slots": "8 card slots"},
            "brand": "Kano Crafts", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80"
        },
        {
            "name": "Handmade Raffia Bag",
            "category": "Accessories",
            "price": 18000.00,
            "description": "Vibrant handcrafted raffia bag.",
            "sku": "ACC-RAF-BAG",
            "specs": {"material": "Raffia", "origin": "South East"},
            "brand": "Lumière Local", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1566150905458-1bf1fd111c90?w=600&q=80"
        },
        {
            "name": "Nigerian Map Pendant",
            "category": "Accessories",
            "price": 250000.00,
            "description": "18-karat gold pendant in the shape of Nigeria.",
            "sku": "ACC-GOL-MAP",
            "specs": {"material": "18K Gold", "weight": "4.5g"},
            "brand": "Antique Lagos", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
        },
        {
            "name": "Minimalist Tote",
            "category": "Accessories",
            "price": 45000.00,
            "description": "Clean, architectural tote for everyday use.",
            "sku": "ACC-MIN-TOTE",
            "specs": {"material": "Canvas/Leather", "capacity": "15L"},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
        },

        # HOME & LIVING
        {
            "name": "Aso Oke Throw Pillow",
            "category": "Home & Living",
            "price": 8500.00,
            "description": "Decorative pillow with hand-woven Aso Oke fabric.",
            "sku": "HOME-ASO-THR",
            "specs": {"fabric": "Aso Oke", "size": "18x18"},
            "brand": "Lumière Local", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1579656333226-d4bd98cc7969?w=600&q=80"
        },
        {
            "name": "Ceramic Lagos Vase",
            "category": "Home & Living",
            "price": 22000.00,
            "description": "Hand-painted ceramic vase by local artisans.",
            "sku": "HOME-CER-VAS",
            "specs": {"material": "Ceramic", "height": "25cm"},
            "brand": "Lagos Arts", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80"
        },
        {
            "name": "Scented Soy Candle",
            "category": "Home & Living",
            "price": 12000.00,
            "description": "Hand-poured soy candle with sandalwood and jasmine notes.",
            "sku": "HOME-SCN-CNDL",
            "specs": {"wax": "Soy", "burn_time": "40 hrs"},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1572726729207-a78d6fed347e?w=600&q=80"
        },

        # BEAUTY
        {
            "name": "Zaron Glow Foundation",
            "category": "Beauty",
            "price": 12500.00,
            "description": "Healthy glow foundation for flawless Nigerian skin.",
            "sku": "BEAU-ZAR-FND",
            "specs": {"oil_free": True, "spf": 15},
            "brand": "Zaron", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
        },
        {
            "name": "Organic Shea Butter",
            "category": "Beauty",
            "price": 5000.00,
            "description": "100% pure organic shea butter sourced from Northern Nigeria.",
            "sku": "BEAU-ORG-SHEA",
            "specs": {"volume": "250g", "pure": True},
            "brand": "Nature's Gold", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80"
        },
        {
            "name": "Bibliothèque Perfume",
            "category": "Beauty",
            "price": 185000.00,
            "description": "A signature scent inspired by old books and warm leather.",
            "sku": "BEAU-BIB-PERF",
            "specs": {"size": "100ml", "type": "EDP"},
            "brand": "Lumière", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"
        },
        # ADDITIONAL DATA
        {
            "name": "iPhone 15 Pro",
            "category": "Electronics",
            "price": 1650000.00,
            "description": "Titanium design, A17 Pro chip, and advanced camera system.",
            "sku": "ELEC-APL-15P",
            "specs": {"material": "Titanium", "chip": "A17 Pro"},
            "brand": "Apple", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&q=80"
        },
        {
            "name": "Dyson V15 Detect",
            "category": "Home & Living",
            "price": 550000.00,
            "description": "Powerful cordless vacuum with laser illumination.",
            "sku": "HOME-DYS-V15",
            "specs": {"suction": "240AW", "runtime": "60 min"},
            "brand": "Dyson", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80"
        },
        {
            "name": "Luxury Chronograph Watch",
            "category": "Accessories",
            "price": 750000.00,
            "description": "Elegant timepiece with sapphire crystal and leather strap.",
            "sku": "ACC-WAT-CHRO",
            "specs": {"movement": "Automatic", "water_resistance": "50m"},
            "brand": "Lumière", "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
        },
        {
            "name": "Nigerian Specialty Coffee",
            "category": "Home & Living",
            "price": 7500.00,
            "description": "Hand-roasted arabica beans from the Mambilla Plateau.",
            "sku": "HOME-COF-MAMB",
            "specs": {"weight": "500g", "roast": "Medium"},
            "brand": "Mambilla Brew", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80"
        },
        {
            "name": "Samsung 4K Smart TV",
            "category": "Electronics",
            "price": 850000.00,
            "description": "Crystal UHD display with smart hub and gaming features.",
            "sku": "ELEC-SAM-4K",
            "specs": {"size": "65 inch", "resolution": "4K"},
            "brand": "Samsung", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80"
        },
        {
            "name": "Premium Yoga Mat",
            "category": "Beauty",
            "price": 25000.00,
            "description": "Non-slip eco-friendly mat for yoga and pilates.",
            "sku": "BEAU-YOG-MAT",
            "specs": {"material": "Natural Rubber", "thickness": "6mm"},
            "brand": "Lumière Active", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80"
        },
        {
            "name": "Wireless Charging Pad",
            "category": "Electronics",
            "price": 18000.00,
            "description": "Fast 15W wireless charger with sleek glass finish.",
            "sku": "ELEC-WRL-CHRG",
            "specs": {"power": "15W", "compatible": "Qi"},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=80"
        },
        {
            "name": "Silk Eye Mask",
            "category": "Beauty",
            "price": 9500.00,
            "description": "Pure Mulberry silk eye mask for better sleep.",
            "sku": "BEAU-SLK-MASK",
            "specs": {"material": "Mulberry Silk", "washable": True},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600&q=80"
        },
        {
            "name": "Minimalist Desktop Lamp",
            "category": "Home & Living",
            "price": 32000.00,
            "description": "LED desk lamp with adjustable brightness and color temperature.",
            "sku": "HOME-LMP-DSK",
            "specs": {"type": "LED", "color": "Matte Black"},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed657f9971?w=600&q=80"
        },
        {
            "name": "Braided Leather Bracelet",
            "category": "Accessories",
            "price": 12000.00,
            "description": "Genuine leather braided bracelet with magnetic clasp.",
            "sku": "ACC-BRC-LTH",
            "specs": {"material": "Leather", "clasp": "Stainless Steel"},
            "brand": "Lumière", "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
        }
    ]

    # Clear old inconsistent products first
    Product.objects.all().delete()
    print("Cleared existing products for complete re-seed.")

    for p_data in products:
        cat = cat_objs[p_data.pop('category')]
        p = Product.objects.create(
            sku=p_data['sku'],
            name=p_data['name'],
            category=cat,
            price=p_data['price'],
            description=p_data['description'],
            specs=p_data['specs'],
            brand=p_data['brand'],
            is_featured=p_data['is_featured'],
            image_url=p_data.get('image_url', ''),
            slug=slugify(p_data['name'])
        )
        # Create Inventory
        Inventory.objects.create(
            product=p,
            quantity=50,
            location="Lagos Warehouse"
        )
        print(f"Created product: {p.name}")

if __name__ == "__main__":
    seed_data()
    print("\nSyncing products to RAG index...")
    from chatbot.services.rag_service import RAGService
    rag = RAGService()
    count = rag.sync_products()
    print(f"RAG Sync Complete. {count} products encoded.")
