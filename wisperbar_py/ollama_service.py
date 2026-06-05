import json
import urllib.request
import urllib.error

DEFAULT_URL = "http://localhost:11434"
CHAT_PATH   = "/v1/chat/completions"
TAGS_PATH   = "/api/tags"


class OllamaError(Exception):
    pass


class OllamaService:

    def __init__(self, base_url: str = DEFAULT_URL, timeout: int = 60):
        self.base_url = base_url.rstrip("/")
        self.timeout  = timeout

    def is_running(self) -> bool:
        try:
            req = urllib.request.Request(self.base_url + TAGS_PATH)
            with urllib.request.urlopen(req, timeout=2):
                return True
        except Exception:
            return False

    def list_models(self) -> list[str]:
        try:
            req = urllib.request.Request(self.base_url + TAGS_PATH)
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
            return [m["name"] for m in data.get("models", [])]
        except Exception:
            return []

    def default_model(self, models: list[str] | None = None) -> str:
        if models is None:
            models = self.list_models()
        for m in models:
            if m.lower().startswith("translate"):
                return m
        return models[0] if models else ""

    def chat(self, model: str, system: str, user: str) -> str:
        payload = json.dumps({
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "temperature": 0.3,
            "stream": False,
        }).encode()

        req = urllib.request.Request(
            self.base_url + CHAT_PATH,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.URLError as exc:
            raise OllamaError(f"Ollama no responde: {exc}") from exc

        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise OllamaError("Respuesta inesperada de Ollama") from exc

        return content.strip()
