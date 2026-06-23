import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, Category

def seed_data():
    categories_data = ['Accessories', 'Bags', 'Knitwear', 'Fragrance', 'Outerwear', 'Trousers', 'Jackets']
    categories = {}
    for cat_name in categories_data:
        cat, _ = Category.objects.get_or_create(name=cat_name, slug=cat_name.lower())
        categories[cat_name] = cat

    products = [
        {
            "brand": "Totême",
            "name": "Signature Silk Scarf",
            "price": 320,
            "imageUrl": "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=600&q=80",
            "category": "Accessories",
            "description": "A refined silk scarf in a signature Totême print. Lightweight and versatile.",
            "color": "Beige"
        },
        {
            "brand": "A.P.C.",
            "name": "Half-Moon Leather Bag",
            "price": 695,
            "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
            "category": "Bags",
            "description": "Structured half-moon silhouette in full-grain leather. Clean lines, no logos.",
            "color": "Black"
        },
        {
            "brand": "Lemaire",
            "name": "Twisted Knit Sweater",
            "price": 490,
            "imageUrl": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
            "category": "Knitwear",
            "description": "A relaxed, beautifully textured sweater with a distinctive twisted silhouette.",
            "color": "Grey"
        },
        {
            "brand": "Byredo",
            "name": "Bibliothèque Eau de Parfum",
            "price": 280,
            "imageUrl": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",
            "category": "Fragrance",
            "description": "Papyrus, plum, and warm woody notes. An intellectual, literary fragrance.",
            "color": "Clear"
        },
        {
            "brand": "Arket",
            "name": "Merino Wool Coat",
            "price": 420,
            "imageUrl": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80",
            "category": "Outerwear",
            "description": "A clean, mid-length merino blend coat. Precise tailoring, neutral palette.",
            "color": "Navy"
        },
        {
            "brand": "Jacquemus",
            "name": "Le Chiquito Noeud",
            "price": 540,
            "imageUrl": "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=600&q=80",
            "category": "Bags",
            "description": "Miniature sculptural bag with a bow closure. A precise proportional study.",
            "color": "White"
        },
        {
            "brand": "Margaret Howell",
            "name": "Relaxed Linen Trousers",
            "price": 380,
            "imageUrl": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
            "category": "Trousers",
            "description": "Wide-leg, relaxed linen trousers in oatmeal. Honest, beautifully cut clothes.",
            "color": "Oatmeal"
        },
        {
            "brand": "Cos",
            "name": "Structured Linen Blazer",
            "price": 295,
            "imageUrl": "https://images.unsplash.com/photo-1594938298603-c8148c4b4a9e?w=600&q=80",
            "category": "Jackets",
            "description": "A boxy, structured linen blazer in off-white. Effortless authority.",
            "color": "Off-white"
        }
    ]

    for p_data in products:
        Product.objects.get_or_create(
            name=p_data["name"],
            defaults={
                "brand": p_data["brand"],
                "slug": p_data["name"].lower().replace(" ", "-"),
                "price": p_data["price"],
                "image_url": p_data["imageUrl"],
                "category": categories[p_data["category"]],
                "description": p_data["description"],
                "color": p_data["color"],
                "stock": 10
            }
        )
    print("Seeding complete.")

if __name__ == "__main__":
    seed_data()
