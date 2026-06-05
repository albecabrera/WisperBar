"""
Detecta preguntas en texto transcrito y corrige su puntuacion automaticamente.
Soporta ES / DE / EN (mezclados).

Heuristica:
  1. Tiene '?' o empieza por 'i' -> pregunta explicita.
  2. Empieza con palabra interrogativa -> pregunta implicita.
     Solo se comprueba al INICIO de la frase para evitar falsos positivos
     en subordinadas (ej. "me dijo cuando llegaria" NO es pregunta).
"""
import re
from dataclasses import dataclass

# ── Tipos ─────────────────────────────────────────────────────────────────────

@dataclass
class Sentence:
    text: str
    is_question: bool


# ── Palabras interrogativas por idioma ────────────────────────────────────────
# Las frases compuestas van ANTES que las simples (orden descendente de longitud).

_INTERROGATIVES: dict[str, list[str]] = {
    "es": [
        "por que", "por que no",
        "que tal", "de donde", "para que", "en que", "a que",
        "que", "que",       # con y sin tilde (Whisper puede omitirla)
        "como", "cuando", "donde",
        "quien", "quienes",
        "cual", "cuales",
        "cuanto", "cuantos", "cuanta", "cuantas",
    ],
    "en": [
        "how many", "how much", "how long", "how often", "how come",
        "what", "how", "when", "where", "why", "who", "which",
        "whose", "whom",
    ],
    "de": [
        "wie viele", "wie viel", "wie lange", "wie oft",
        "wie", "was", "wann", "wo", "warum",
        "wer", "welche", "welcher", "welches", "welchem", "welchen",
        "wohin", "woher",
    ],
}

# Lista plana ordenada por longitud desc para que "how many" gane a "how"
_ALL_WORDS: list[str] = sorted(
    {w for words in _INTERROGATIVES.values() for w in words},
    key=len, reverse=True,
)

# Patron que coincide solo al INICIO de frase
_START_Q = re.compile(
    r"^(?:" + "|".join(re.escape(w) for w in _ALL_WORDS) + r")(?:\s|$)",
    re.IGNORECASE | re.UNICODE,
)

# Separador de frases: despues de . ! ? o tras salto de parrafo
_SPLIT = re.compile(r"(?<=[.!?])\s+|\n{2,}", re.UNICODE)


# ── Logica central ────────────────────────────────────────────────────────────

def _is_question(text: str) -> bool:
    """True si la frase parece ser una pregunta."""
    s = text.strip()
    if not s:
        return False
    # Signo explicito (incluye 'i' invertida inicial)
    if "?" in s or s.startswith("i"):
        return True
    # Empieza con palabra interrogativa (sin tilde incluido)
    clean = s.lstrip("i").strip()   # quitar 'i' por si acaso
    return bool(_START_Q.match(clean))


def split_sentences(text: str) -> list[Sentence]:
    """
    Divide *text* en frases y clasifica cada una como pregunta o enunciado.

    Casos borde manejados:
    - Frases vacias tras split -> ignoradas
    - Signos de puntuacion mixtos -> preservados
    - Preguntas sin signos explicitos -> detectadas por palabra inicial
    """
    if not text:
        return []
    parts = _SPLIT.split(text)
    result: list[Sentence] = []
    for part in parts:
        part = part.strip()
        if not part or not re.search(r"\w", part, re.UNICODE):
            continue  # ignora frases vacías o sólo puntuación
        result.append(Sentence(text=part, is_question=_is_question(part)))
    return result


def auto_punctuate_questions(text: str) -> str:
    """
    Recorre cada frase; si parece pregunta y termina en '.' reemplaza por '?'.
    Preserva '?' y '!' ya existentes. Seguro llamar en cualquier texto.

    Ejemplo:
        "Que hora es. El evento empieza a las ocho."
        -> "Que hora es? El evento empieza a las ocho."
    """
    if not text:
        return text

    sentences = split_sentences(text)
    out: list[str] = []
    for s in sentences:
        t = s.text
        if s.is_question and t.endswith(".") and "?" not in t:
            t = t[:-1] + "?"
        out.append(t)

    # Reconstruir respetando parrafos si los habia
    return "  ".join(out) if "\n\n" not in text else "\n\n".join(out)
