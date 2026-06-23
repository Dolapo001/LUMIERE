import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chatbot.services.rag_service import RAGService

def main():
    print("Initializing RAG Service...")
    rag = RAGService()
    print("Syncing products to PGVector...")
    count = rag.sync_products()
    print(f"Successfully synced {count} products.")

if __name__ == "__main__":
    main()
