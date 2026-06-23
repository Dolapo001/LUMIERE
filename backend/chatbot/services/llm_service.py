import google.generativeai as genai
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    """Service exclusively handling LLM connections and generations."""
    def __init__(self):
        self.model = None
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key and api_key != "your_gemini_api_key_here":
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            logger.warning("GEMINI_API_KEY is missing or placeholder. LLM capabilities will be disabled.")

    def generate(self, prompt: str) -> str:
        """Generates response conditionally using LLM."""
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                logger.error(f"LLM generation failed: {e}")
                return ""
        return ""
