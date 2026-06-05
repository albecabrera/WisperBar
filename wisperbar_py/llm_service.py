"""
Unified LLM service for WisperBar.
Supports: Ollama (local), Anthropic Claude, OpenAI, and any OpenAI-compatible endpoint.
API keys are stored in macOS Keychain — never in config.json.
"""
import json
import subprocess
import urllib.request
import urllib.error

ANTHROPIC_BASE = "https://api.anthropic.com"
OPENAI_BASE    = "https://api.openai.com"

# Fallback model lists — used when API is unreachable or no key yet
ANTHROPIC_MODELS_FALLBACK: list[str] = [
    "claude-opus-4-8",
    "claude-sonnet-4-6",
    "claude-haiku-4-5",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
]

OPENAI_MODELS_FALLBACK: list[str] = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "o1",
    "o1-mini",
    "o3",
    "o3-mini",
    "o4-mini",
    "gpt-3.5-turbo",
]

# Prefixes used to filter chat-capable models from OpenAI /v1/models
_CHAT_PREFIXES = ("gpt-", "o1", "o3", "o4", "chatgpt-")

PROVIDER_LABELS: dict[str, str] = {
    "ollama":     "Ollama",
    "anthropic":  "Anthropic",
    "openai":     "OpenAI",
    "generic":    "Generic",
}

PROVIDERS = list(PROVIDER_LABELS.keys())


# ── macOS Keychain helpers ────────────────────────────────────────────────────

def keychain_save(account: str, password: str) -> bool:
    """Store a secret in the Login keychain under service 'WisperBar'."""
    if not password:
        return False
    r = subprocess.run(
        ["security", "add-generic-password", "-U",
         "-s", "WisperBar", "-a", account, "-w", password],
        capture_output=True,
    )
    return r.returncode == 0


def keychain_load(account: str) -> str:
    """Retrieve a secret from the Login keychain. Returns '' if not found."""
    r = subprocess.run(
        ["security", "find-generic-password",
         "-s", "WisperBar", "-a", account, "-w"],
        capture_output=True, text=True,
    )
    return r.stdout.strip() if r.returncode == 0 else ""


def keychain_delete(account: str) -> bool:
    r = subprocess.run(
        ["security", "delete-generic-password",
         "-s", "WisperBar", "-a", account],
        capture_output=True,
    )
    return r.returncode == 0


# ── Errors ────────────────────────────────────────────────────────────────────

class LLMError(Exception):
    pass


# ── Service ───────────────────────────────────────────────────────────────────

class LLMService:
    """Thin wrapper around multiple LLM provider HTTP APIs (stdlib only)."""

    def __init__(self, timeout: int = 60):
        self._timeout = timeout

    # ── Chat ──────────────────────────────────────────────────────────────────

    def chat(self, provider: str, model: str, base_url: str, api_key: str,
             system: str, user: str) -> str:
        """Send a system+user message and return the assistant reply."""
        if provider == "anthropic":
            url = (base_url or ANTHROPIC_BASE).rstrip("/")
            return self._chat_anthropic(url, api_key, model, system, user)
        effective = base_url or (
            "http://localhost:11434" if provider == "ollama" else OPENAI_BASE
        )
        return self._chat_openai_compat(effective.rstrip("/"), api_key, model, system, user)

    def _chat_openai_compat(self, base_url: str, api_key: str, model: str,
                             system: str, user: str) -> str:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
        }
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        req = urllib.request.Request(
            f"{base_url}/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers=headers, method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            raise LLMError(f"HTTP {e.code}: {body[:300]}")
        except Exception as e:
            raise LLMError(str(e))

    def _chat_anthropic(self, base_url: str, api_key: str, model: str,
                        system: str, user: str) -> str:
        payload = {
            "model": model,
            "max_tokens": 2048,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        headers = {
            "Content-Type":      "application/json",
            "x-api-key":         api_key,
            "anthropic-version": "2023-06-01",
        }
        req = urllib.request.Request(
            f"{base_url}/v1/messages",
            data=json.dumps(payload).encode(),
            headers=headers, method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read())
            return data["content"][0]["text"].strip()
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            raise LLMError(f"HTTP {e.code}: {body[:300]}")
        except Exception as e:
            raise LLMError(str(e))

    # ── List models ───────────────────────────────────────────────────────────

    def list_models(self, provider: str, base_url: str, api_key: str) -> list[str]:
        """Fetch available models from the provider. Falls back to hardcoded list."""
        try:
            if provider == "ollama":
                return self._list_ollama(base_url or "http://localhost:11434")
            if provider == "anthropic":
                return self._list_anthropic(base_url or ANTHROPIC_BASE, api_key)
            if provider in ("openai", "generic"):
                return self._list_openai_compat(base_url or OPENAI_BASE, api_key)
        except Exception as exc:
            print(f"[LLMService] list_models({provider}): {exc}", flush=True)
        if provider == "anthropic":
            return list(ANTHROPIC_MODELS_FALLBACK)
        if provider == "openai":
            return list(OPENAI_MODELS_FALLBACK)
        return []

    def _list_ollama(self, base_url: str) -> list[str]:
        url = base_url.rstrip("/") + "/api/tags"
        with urllib.request.urlopen(url, timeout=4) as resp:
            data = json.loads(resp.read())
        return [m["name"] for m in data.get("models", [])]

    def _list_anthropic(self, base_url: str, api_key: str) -> list[str]:
        url = base_url.rstrip("/") + "/v1/models?limit=100"
        req = urllib.request.Request(url, headers={
            "x-api-key":         api_key,
            "anthropic-version": "2023-06-01",
        })
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
        ids = [m["id"] for m in data.get("data", [])]
        return ids if ids else list(ANTHROPIC_MODELS_FALLBACK)

    def _list_openai_compat(self, base_url: str, api_key: str) -> list[str]:
        url = base_url.rstrip("/") + "/v1/models"
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
        all_ids  = [m["id"] for m in data.get("data", [])]
        chat_ids = [m for m in all_ids
                    if any(m.lower().startswith(p) for p in _CHAT_PREFIXES)]
        return sorted(chat_ids) if chat_ids else sorted(all_ids)

    # ── Availability check ────────────────────────────────────────────────────

    def is_available(self, provider: str, base_url: str, api_key: str) -> bool:
        if provider == "ollama":
            try:
                url = (base_url or "http://localhost:11434").rstrip("/") + "/api/tags"
                urllib.request.urlopen(url, timeout=2)
                return True
            except Exception:
                return False
        # External providers: available if API key is set (or base_url for generic)
        return bool(api_key or (provider == "generic" and base_url))

    # ── Defaults ──────────────────────────────────────────────────────────────

    def default_model(self, provider: str, models: list[str]) -> str:
        if not models:
            return ""
        if provider == "ollama":
            tr = next((m for m in models if m.lower().startswith("translate")), None)
            return tr or models[0]
        if provider == "anthropic":
            sonnet = next((m for m in models if "sonnet" in m), None)
            return sonnet or models[0]
        if provider == "openai":
            gpt4o = next((m for m in models if m == "gpt-4o"), None)
            return gpt4o or models[0]
        return models[0]
