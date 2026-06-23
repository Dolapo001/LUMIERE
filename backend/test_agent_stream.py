import asyncio
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chatbot.services.agent import LumiereAgent

async def test_agent():
    agent = LumiereAgent()
    print("Agent Initialized. Starting stream...")
    async for chunk in agent.astream("What is the price of Oraimo FreePods 4?", []):
        print(f"CHUNK: {repr(chunk)}")

if __name__ == "__main__":
    asyncio.run(test_agent())
