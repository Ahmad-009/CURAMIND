import itertools
from google import genai
from core.config import settings

class GeminiRotator:
    def __init__(self):
        self.keys = settings.GEMINI_KEYS_LIST
        self.key_cycle = itertools.cycle(enumerate(self.keys))
        self.current_index, self.current_key = next(self.key_cycle)
        self._refresh_client()

    def _refresh_client(self):
        print(f"🔄 [ROTATOR] Active Key: #{self.current_index + 1}")
        self.client = genai.Client(api_key=self.current_key)

    def rotate(self):
        self.current_index, self.current_key = next(self.key_cycle)
        self._refresh_client()

    def get_client(self):
        return self.client

rotator = GeminiRotator()