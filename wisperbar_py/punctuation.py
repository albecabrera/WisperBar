"""
Convierte comandos de puntuación hablados en símbolos.
Soporta ES / DE / EN mezclados en el mismo dictado.

Regla: el comando ocupa su espacio → se reemplaza por el símbolo
       con el espaciado correcto. Luego se capitaliza el inicio de
       cada oración nueva y cada párrafo.
"""
import re

# ── Tabla de comandos ─────────────────────────────────────────────────────────
# Orden importa: los patrones multi-palabra van ANTES que los de una sola.
# Cada entrada: (patrón, reemplazo, flags)
#   · Para comas/puntos/etc. se consume el espacio previo y se inserta símbolo + espacio.
#   · Para paréntesis se ajusta el espacio según apertura/cierre.
#   · Para párrafo se convierte en doble salto de línea.

_RULES: list[tuple[str, str, int]] = [
    # ── Español multi-palabra ───────────────────────────────────────────────
    (r"[ \t]*\bsigno de interrogación\b[ \t]*",  "? ",   re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bsigno de exclamación\b[ \t]*",    "! ",   re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\babrir paréntesis\b[ \t]*",         " (",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bcerrar paréntesis\b[ \t]*",        ") ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bpárrafo\b[ \t]*",                 "\n\n", re.IGNORECASE | re.UNICODE),
    # ── Alemán multi-palabra ────────────────────────────────────────────────
    (r"[ \t]*\bKlammer auf\b[ \t]*",              " (",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bKlammer zu\b[ \t]*",               ") ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bFragezeichen\b[ \t]*",             "? ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bAusrufezeichen\b[ \t]*",           "! ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bAbsatz\b[ \t]*",                  "\n\n", re.IGNORECASE | re.UNICODE),
    # ── Inglés multi-palabra ────────────────────────────────────────────────
    (r"[ \t]*\bquestion mark\b[ \t]*",            "? ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bexclamation mark\b[ \t]*",         "! ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bopen parenthesis\b[ \t]*",         " (",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bclose parenthesis\b[ \t]*",        ") ",  re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bnew paragraph\b[ \t]*",           "\n\n", re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bfull stop\b[ \t]*",               ". ",   re.IGNORECASE | re.UNICODE),
    # ── Una sola palabra (después de las multi-palabra) ─────────────────────
    # Alemán
    (r"[ \t]*\bPunkt\b[ \t]*",                   ". ",   re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bKomma\b[ \t]*",                   ", ",   re.IGNORECASE | re.UNICODE),
    # Inglés
    (r"[ \t]*\bperiod\b[ \t]*",                  ". ",   re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bcomma\b[ \t]*",                   ", ",   re.IGNORECASE | re.UNICODE),
    # Español
    (r"[ \t]*\bpunto\b[ \t]*",                   ". ",   re.IGNORECASE | re.UNICODE),
    (r"[ \t]*\bcoma\b[ \t]*",                    ", ",   re.IGNORECASE | re.UNICODE),
]

# Compilar una vez al cargar el módulo
_COMPILED: list[tuple[re.Pattern, str]] = [
    (re.compile(pattern, flags), repl)
    for pattern, repl, flags in _RULES
]


def _capitalize_sentences(text: str) -> str:
    """Capitaliza después de . ? ! y después de párrafo (\n\n)."""
    # Después de final de oración + espacio
    text = re.sub(
        r"([.?!])\s+([a-záéíóúüñäöàèìòùâêîôûœæç])",
        lambda m: m.group(1) + " " + m.group(2).upper(),
        text,
        flags=re.UNICODE,
    )
    # Después de párrafo (\n\n)
    text = re.sub(
        r"\n\n([a-záéíóúüñäöàèìòùâêîôûœæç])",
        lambda m: "\n\n" + m.group(1).upper(),
        text,
        flags=re.UNICODE,
    )
    return text


def process_punctuation(text: str) -> str:
    """
    Aplica comandos de puntuación hablados al texto de dictado.
    Seguro llamar siempre: si no hay comandos, devuelve el texto sin cambios.
    """
    if not text:
        return text

    for pattern, repl in _COMPILED:
        text = pattern.sub(repl, text)

    # Limpiar espacios múltiples horizontales (no tocar \n)
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Quitar espacio antes de coma/punto/cierre de paréntesis
    text = re.sub(r"\s+([,.)!?])", r"\1", text)

    # Quitar espacio después de apertura de paréntesis
    text = re.sub(r"\(\s+", "(", text)

    # Capitalizar inicio del texto
    text = text.lstrip()
    if text and text[0].islower():
        text = text[0].upper() + text[1:]

    text = _capitalize_sentences(text)

    # Trim final
    return text.rstrip()
