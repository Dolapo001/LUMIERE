from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from django.conf import settings
from products.models import Product
import os

class RAGService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        self.vector_store = None
        
        # Check if we should use PGVector (Production) or FAISS (Local)
        if os.getenv('DATABASE_URL'):
            from langchain_postgres import PGVector
            connection_string = os.getenv('DATABASE_URL')
            # Ensure connection string starts with postgresql://
            if connection_string.startswith('postgres://'):
                connection_string = connection_string.replace('postgres://', 'postgresql://', 1)
                
            self.vector_store = PGVector(
                embeddings=self.embeddings,
                collection_name="product_embeddings",
                connection=connection_string,
                use_jsonb=True,
            )
            self.mode = "PGVector"
        else:
            from langchain_community.vectorstores import FAISS
            self.index_path = os.path.join(settings.BASE_DIR, "faiss_index")
            if os.path.exists(self.index_path):
                self.vector_store = FAISS.load_local(
                    self.index_path, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
            self.mode = "FAISS"

    def sync_products(self):
        """Re-sync all products into the vector store."""
        products = Product.objects.filter(is_active=True)
        documents = []
        for p in products:
            specs_str = ", ".join([f"{k}: {v}" for k, v in p.specs.items()])
            content = f"Product: {p.name}. Category: {p.category.name}. Description: {p.description}. Specs: {specs_str}"
            
            doc = Document(
                page_content=content,
                metadata={
                    "id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "slug": p.slug
                }
            )
            documents.append(doc)
        
        if not documents:
            return 0

        if self.mode == "PGVector":
            self.vector_store.add_documents(documents)
        else:
            from langchain_community.vectorstores import FAISS
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
            self.vector_store.save_local(self.index_path)
            
        return len(documents)

    def search(self, query: str, limit: int = 4):
        """Semantic search for similar products."""
        if not self.vector_store:
            return []
        results = self.vector_store.similarity_search(query, k=limit)
        return [
            {
                "id": r.metadata["id"],
                "name": r.metadata["name"],
                "content": r.page_content,
                "price": r.metadata["price"],
                "slug": r.metadata["slug"]
            }
            for r in results
        ]
