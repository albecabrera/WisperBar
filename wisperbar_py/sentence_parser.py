"""
Detecta preguntas en texto transcrito y corrige su puntuacion automaticamente.
Soporta ES / DE / EN (mezclados).

Heuristicas (en orden de evaluacion):
  1. Tiene '?' o empieza con inverted '¿' -> pregunta explicita.
  2. Empieza con palabra interrogativa (que/how/wie/etc.) -> pregunta implicita.
  3. Empieza con verbo conjugado tipico de pregunta -> pregunta por inversion V-S.
     ES: agrega '¿' al inicio y '?' al final.
     EN/DE: solo '?' al final.
  Solo se comprueba al INICIO de la frase para evitar falsos positivos
  en subordinadas (ej. "me dijo cuando llegaria" NO es pregunta).
"""
import re
from dataclasses import dataclass, field

# ── Tipos ─────────────────────────────────────────────────────────────────────

@dataclass
class Sentence:
    text: str
    is_question: bool
    needs_opening_mark: bool = False   # True -> agregar '¿' al inicio (ES)


# ── Palabras interrogativas ───────────────────────────────────────────────────

_INTERROGATIVES: dict[str, list[str]] = {
    "es": [
        "por que", "por que no", "que tal", "de donde", "para que",
        "en que", "a que",
        "que", "como", "cuando", "donde",
        "quien", "quienes", "cual", "cuales",
        "cuanto", "cuantos", "cuanta", "cuantas",
    ],
    "en": [
        "how many", "how much", "how long", "how often", "how come",
        "what", "how", "when", "where", "why", "who", "which", "whose", "whom",
    ],
    "de": [
        "wie viele", "wie viel", "wie lange", "wie oft",
        "wie", "was", "wann", "wo", "warum",
        "wer", "welche", "welcher", "welches", "welchem", "welchen",
        "wohin", "woher",
    ],
}

# Patron por idioma para saber si la interrogativa es espanola (-> '¿')
_START_Q_BY_LANG: dict[str, re.Pattern] = {
    lang: re.compile(
        r"^(?:" + "|".join(
            re.escape(w) for w in sorted(words, key=len, reverse=True)
        ) + r")(?:\s|$)",
        re.IGNORECASE | re.UNICODE,
    )
    for lang, words in _INTERROGATIVES.items()
}


# ── Verbos que inician preguntas por inversion V-S ───────────────────────────
# Solo formas que AL INICIO de frase son casi siempre pregunta.
# Listas independientes por idioma para saber si aplicar '¿'.

_VERBS: dict[str, list[str]] = {
    "es": [
        # ser / estar
        "es", "eres", "son", "somos", "sois",
        "esta", "estas", "estan", "estamos", "estais",
        # tener
        "tienes", "tiene", "tienen", "tenemos", "teneis", "tenes",
        # poder
        "puedes", "puede", "pueden", "podemos", "podeis", "podes",
        # querer
        "quieres", "quiere", "quieren", "queremos", "quereis", "queres",
        # ir
        "vas", "va", "van", "vamos", "vais",
        # haber
        "has", "ha", "han", "hay", "habia", "habian",
        # saber
        "sabes", "sabe", "saben", "sabemos",
        # venir
        "vienes", "viene", "vienen", "venimos",
        # hacer
        "haces", "hace", "hacen", "hacemos",
        # otros comunes
        "conoces", "conoce", "necesitas", "necesita",
        "debes", "debe", "deben",
        "hablas", "habla", "hablan",
        "entiendes", "entiende", "crees", "cree",
        "vives", "vive", "trabajas", "trabaja",
        "dijiste", "dijo", "dijeron",
        "fuiste", "fue", "fueron",
        "tuviste", "tuvo", "tuvieron",
        "pudiste", "pudo", "pudieron",
    ],
    "en": [
        # to be
        "is", "are", "was", "were", "am",
        # do / does / did
        "do", "does", "did",
        # modales
        "can", "could", "will", "would", "should", "shall",
        "may", "might", "must",
        # have
        "have", "has", "had",
    ],
    "de": [
        # sein / haben
        "ist", "sind", "war", "waren", "bist", "seid",
        "hast", "hat", "haben", "hatten", "hattest",
        # modales
        "kannst", "kann", "koennen", "konnte", "konntest",
        "willst", "will", "wollen", "wollte", "wolltest",
        "darfst", "darf", "duerfen",
        "sollst", "soll", "sollen",
        "magst", "mag",
        # comunes
        "machst", "macht", "machen",
        "gehst", "geht", "gehen",
        "kommst", "kommt", "kommen",
        "weisst", "weiss",
        "hast",
    ],
}

# Construir patrones por idioma
_VERB_PATTERNS: dict[str, re.Pattern] = {
    lang: re.compile(
        r"^(?:" + "|".join(re.escape(v) for v in sorted(verbs, key=len, reverse=True)) + r")(?:\s|$)",
        re.IGNORECASE | re.UNICODE,
    )
    for lang, verbs in _VERBS.items()
}


# ── Separador de frases ───────────────────────────────────────────────────────

_SPLIT = re.compile(r"(?<=[.!?])\s+|\n{2,}", re.UNICODE)


# ── Logica central ────────────────────────────────────────────────────────────

def _classify(text: str) -> tuple[bool, bool]:
    """
    Devuelve (is_question, needs_opening_mark).
    needs_opening_mark=True cuando se detecta inversion V-S en espanol.
    """
    s = text.strip()
    if not s:
        return False, False

    # 1. Signo explicito
    if "?" in s or s.startswith("¿"):
        return True, False

    clean = s.lstrip("¿").strip()

    # 2. Palabra interrogativa al inicio (con idioma para saber si aplica '¿')
    for lang, pat in _START_Q_BY_LANG.items():
        if pat.match(clean):
            return True, (lang == "es")

    # 3. Verbo inicial por idioma
    for lang, pat in _VERB_PATTERNS.items():
        if pat.match(clean):
            return True, (lang == "es")

    return False, False


def split_sentences(text: str) -> list[Sentence]:
    """
    Divide *text* en frases y clasifica cada una.
    Ignora frases vacias o compuestas solo de puntuacion.
    """
    if not text:
        return []
    parts = _SPLIT.split(text)
    result: list[Sentence] = []
    for part in parts:
        part = part.strip()
        if not part or not re.search(r"\w", part, re.UNICODE):
            continue
        is_q, needs_mark = _classify(part)
        result.append(Sentence(text=part, is_question=is_q, needs_opening_mark=needs_mark))
    return result


def _capitalize_first(text: str) -> str:
    """Capitaliza la primera letra real, saltando '¿' si la hay."""
    if not text:
        return text
    i = 1 if text.startswith("¿") else 0
    if i < len(text) and text[i].islower():
        return text[:i] + text[i].upper() + text[i + 1:]
    return text


def auto_punctuate_questions(text: str) -> str:
    """
    Corrige la puntuacion de preguntas:
    - Si termina en '.' y es pregunta -> reemplaza '.' por '?'
    - Si es inversion V-S en espanol   -> agrega '¿' al inicio
    - Preserva '?' y '!' ya existentes.
    """
    if not text:
        return text

    sentences = split_sentences(text)
    out: list[str] = []
    for s in sentences:
        t = s.text
        if s.is_question:
            # Asegurar cierre
            if t.endswith(".") and "?" not in t:
                t = t[:-1] + "?"
            elif not t.endswith(("?", "!")):
                t = t + "?"
            # Agregar apertura espanol si aplica
            if s.needs_opening_mark and not t.startswith("¿"):
                t = "¿" + t
        # Primera letra siempre mayuscula (preguntas y enunciados)
        t = _capitalize_first(t)
        out.append(t)

    return "  ".join(out) if "\n\n" not in text else "\n\n".join(out)
