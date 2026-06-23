# Lumière Commerce — Intelligent Conversational Commerce

Lumière is a premium, AI-driven e-commerce platform that combines **Next.js 15**, **Django**, and **LangChain/LangGraph** to create a data-grounded shopping assistant. 

## 🧠 AI Agent Architecture
Our agent, **Lumière Assistant**, utilizes a hybrid intelligence model:
- **Tool-Calling (Primary)**: Directly queries your local database (SQLite/Postgres) for exact prices, stock, and specifications.
- **RAG (Secondary)**: Uses **FAISS** (Local File-based Vector Store) for semantic product discovery. No separate vector database required!
- **Intent Awareness**: Explicitly analyzes user intent (Price check, Delivery, etc.) before every response.
- **Tone**: Nigerian-friendly simple English with ₦ pricing and local delivery logistics.

## 🛠️ Getting Started

### 1. Backend Setup
```bash
pip install -r requirements.txt
python manage.py makemigrations 
python manage.py migrate
python seed_nigerian_data.py   # Seed 20+ local products
python sync_rag.py             # Build local semantic index (saves to faiss_index/)
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
Ensure `backend/.env` contains your `GEMINI_API_KEY`.
```bash
GEMINI_API_KEY=AIzaSy...
```

## 💬 Sample Conversations to Test
1. "Hello, I'm looking for a premium laptop under ₦500k." (Semantic Search / Price Filter)
2. "Is the Samsung S23 Ultra in stock in Lagos?" (Inventory Tool / Specific SKU)
3. "How long does delivery take to Abuja?" (Delivery Tool)
4. "Suggest something elegant for a traditional wedding." (RAG Recommendation)


