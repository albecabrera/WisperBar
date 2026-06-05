from dataclasses import dataclass, field

# ── Prompts por idioma ────────────────────────────────────────────────────────

_PROMPTS: dict[str, dict[str, str]] = {

    "mejorar": {
        "es": (
            "Eres un editor de textos. Recibes una transcripción de voz en español. "
            "Tu tarea: corregir ortografía y gramática, mejorar la fluidez, "
            "mantener el significado original y el registro del hablante. "
            "Devuelve SOLO el texto corregido, sin explicaciones ni comentarios."
        ),
        "en": (
            "You are a text editor. You receive a voice transcription in English. "
            "Your task: fix spelling and grammar, improve readability, "
            "preserve the original meaning and the speaker's register. "
            "Return ONLY the corrected text, no explanations or comments."
        ),
        "de": (
            "Du bist ein Lektor. Du erhältst ein Sprachtranskript auf Deutsch. "
            "Deine Aufgabe: Rechtschreibung und Grammatik korrigieren, Lesefluss verbessern, "
            "ursprüngliche Bedeutung und Sprachregister beibehalten. "
            "Gib NUR den korrigierten Text zurück, ohne Erklärungen."
        ),
    },

    "profesional": {
        "es": (
            "Eres un asistente de redacción profesional. Recibes una transcripción de voz en español. "
            "Tu tarea: reformular el mensaje en tono formal y profesional, "
            "manteniendo toda la información relevante. "
            "Elimina coloquialismos, muletillas y estructuras informales. "
            "El resultado debe ser apto para emails corporativos o documentos formales. "
            "Devuelve SOLO el texto reformulado."
        ),
        "en": (
            "You are a professional writing assistant. You receive a voice transcription in English. "
            "Your task: rewrite the message in a formal, professional tone, "
            "preserving all relevant information. "
            "Remove colloquialisms, filler words, and informal structures. "
            "The result must be suitable for corporate emails or formal documents. "
            "Return ONLY the reformulated text."
        ),
        "de": (
            "Du bist ein professioneller Schreibassistent. Du erhältst ein Sprachtranskript auf Deutsch. "
            "Deine Aufgabe: Die Nachricht in einem formellen, professionellen Ton umformulieren, "
            "alle relevanten Informationen erhalten. "
            "Umgangssprache, Füllwörter und informelle Strukturen entfernen. "
            "Das Ergebnis muss für geschäftliche E-Mails oder formelle Dokumente geeignet sein. "
            "Gib NUR den umformulierten Text zurück."
        ),
    },

    "desahogo": {
        "es": (
            "Recibes una transcripción emocional de voz en español. "
            "Identifica el objetivo real, el problema concreto y la frustración legítima del hablante. "
            "Reformula el mensaje de forma clara, respetuosa y efectiva para que logre su objetivo. "
            "Conserva: hechos concretos, problemas específicos, límites legítimos, urgencia justificada. "
            "Elimina: insultos, amenazas, sarcasmo, suposiciones negativas, escalada innecesaria. "
            "Si hay múltiples quejas, condénsalas en los puntos esenciales. "
            "El tono debe ser calmado, humano, directo y orientado a soluciones. "
            "Devuelve SOLO el mensaje reformulado."
        ),
        "en": (
            "You receive an emotional voice transcription in English. "
            "Identify the speaker's real goal, the concrete problem, and their legitimate frustration. "
            "Rewrite the message in a clear, respectful, and effective way to help them achieve their goal. "
            "Keep: concrete facts, specific problems, legitimate boundaries, justified urgency. "
            "Remove: insults, threats, sarcasm, negative assumptions, unnecessary escalation. "
            "If multiple complaints are mentioned, condense them to the essential core points. "
            "The tone should be calm, human, direct, and solution-oriented. "
            "Return ONLY the reformulated message."
        ),
        "de": (
            "Du erhältst ein emotional gesprochenes Transkript auf Deutsch. "
            "Erkenne zuerst das eigentliche Ziel, das konkrete Problem und den legitimen Frust der Person. "
            "Formuliere daraus eine klare, respektvolle und wirksame Nachricht. "
            "Bewahre: konkrete Fakten, spezifische Probleme, legitime Grenzen, berechtigte Dringlichkeit. "
            "Entferne: Beleidigungen, Drohungen, Sarkasmus, negative Unterstellungen, unnötige Eskalation. "
            "Wenn mehrere Vorwürfe genannt werden, verdichte sie auf die entscheidenden Kernpunkte. "
            "Der Ton soll ruhig, menschlich, bestimmt und lösungsorientiert sein. "
            "Gib NUR die fertige Nachricht zurück."
        ),
    },

    "emoji": {
        "es": (
            "Recibes una transcripción de voz en español. Devuelve el texto fielmente "
            "pero añade emojis contextuales y apropiados. {density} "
            "Corrige errores obvios de transcripción. Mantén el estilo y significado. "
            "Devuelve SOLO el texto con emojis, sin explicaciones."
        ),
        "en": (
            "You receive a voice transcription in English. Return the text faithfully "
            "but add contextual and appropriate emojis. {density} "
            "Fix obvious transcription errors. Keep the style and meaning. "
            "Return ONLY the text with emojis, no explanations."
        ),
        "de": (
            "Du erhältst ein Sprachtranskript auf Deutsch. Gib den Text möglichst originalgetreu zurück, "
            "aber füge passende Emojis hinzu. {density} "
            "Korrigiere offensichtliche Transkriptionsfehler. Behalte Stil und Bedeutung. "
            "Gib NUR den Text mit Emojis zurück, ohne Erklärungen."
        ),
    },
}

_EMOJI_DENSITY: dict[str, dict[str, str]] = {
    "poca": {
        "es": "Añade solo 1-2 emojis por párrafo, en los momentos más expresivos.",
        "en": "Add only 1-2 emojis per paragraph, at the most expressive moments.",
        "de": "Füge nur 1-2 Emojis pro Absatz ein, an den ausdrucksstärksten Stellen.",
    },
    "media": {
        "es": "Añade emojis cada 1-2 oraciones en los puntos clave.",
        "en": "Add emojis every 1-2 sentences at key points.",
        "de": "Füge alle 1-2 Sätze an wichtigen Stellen Emojis ein.",
    },
    "mucha": {
        "es": "Añade emojis generosamente, varios por oración cuando sea natural.",
        "en": "Add emojis generously, several per sentence when natural.",
        "de": "Füge großzügig Emojis ein, gerne mehrere pro Satz.",
    },
}

# Status labels shown in menu while Ollama processes
_PROCESSING_LABELS: dict[str, dict[str, str]] = {
    "mejorar": {
        "es": "✏️  Mejorando con Ollama…",
        "en": "✏️  Improving with Ollama…",
        "de": "✏️  Wird verbessert…",
    },
    "profesional": {
        "es": "👔  Profesionalizando…",
        "en": "👔  Professionalizing…",
        "de": "👔  Wird formalisiert…",
    },
    "desahogo": {
        "es": "🧘  Calmando el texto…",
        "en": "🧘  Calming the text…",
        "de": "🧘  Wird beruhigt…",
    },
    "emoji": {
        "es": "😊  Añadiendo emojis…",
        "en": "😊  Adding emojis…",
        "de": "😊  Emojis werden hinzugefügt…",
    },
}


# ── Definición de workflows ───────────────────────────────────────────────────

@dataclass
class WorkflowDef:
    id:             str
    icon:           str
    label_es:       str
    label_en:       str
    label_de:       str
    description_es: str
    description_en: str
    description_de: str
    needs_ollama:   bool
    hotkey_label:   str = "⌥ derecho"


WORKFLOWS: list[WorkflowDef] = [
    WorkflowDef(
        id="transcribir",
        icon="🎙",
        label_es="Transcribir",
        label_en="Transcribe",
        label_de="Transkribieren",
        description_es="Texto crudo, sin post-procesado",
        description_en="Raw text, no post-processing",
        description_de="Rohtext, ohne Nachbearbeitung",
        needs_ollama=False,
        hotkey_label="⌥R",
    ),
    WorkflowDef(
        id="mejorar",
        icon="✏️",
        label_es="Mejorar",
        label_en="Improve",
        label_de="Verbessern",
        description_es="Corrige gramática y mejora fluidez",
        description_en="Fixes grammar and improves flow",
        description_de="Grammatik korrigieren und Lesefluss verbessern",
        needs_ollama=True,
        hotkey_label="⌥R",
    ),
    WorkflowDef(
        id="profesional",
        icon="👔",
        label_es="Profesionalizar",
        label_en="Professionalize",
        label_de="Professionell",
        description_es="Reformula en tono formal/corporativo",
        description_en="Rewrites in formal/corporate tone",
        description_de="In formellen Ton umformulieren",
        needs_ollama=True,
        hotkey_label="⌥R",
    ),
    WorkflowDef(
        id="desahogo",
        icon="🧘",
        label_es="Desahogo",
        label_en="Vent",
        label_de="Dampf ablassen",
        description_es="Frustración → mensaje respetuoso",
        description_en="Frustration → respectful message",
        description_de="Frust → respektvolle Nachricht",
        needs_ollama=True,
        hotkey_label="⌥R",
    ),
    WorkflowDef(
        id="emoji",
        icon="😊",
        label_es="Emoji",
        label_en="Emoji",
        label_de="Emoji",
        description_es="Añade emojis contextuales",
        description_en="Adds contextual emojis",
        description_de="Passende Emojis hinzufügen",
        needs_ollama=True,
        hotkey_label="⌥R",
    ),
]

WORKFLOW_BY_ID: dict[str, WorkflowDef] = {w.id: w for w in WORKFLOWS}


_TONE_ADDENDUM: dict[str, dict[str, str]] = {
    "formal": {
        "es": "\nUsa un tono formal y profesional.",
        "en": "\nUse a formal and professional tone.",
        "de": "\nVerwende einen formellen und professionellen Ton.",
    },
    "neutral": {
        "es": "\nUsa un tono neutral y claro.",
        "en": "\nUse a neutral and clear tone.",
        "de": "\nVerwende einen neutralen und klaren Ton.",
    },
    "casual": {
        "es": "\nUsa un tono cercano y natural.",
        "en": "\nUse a casual and natural tone.",
        "de": "\nVerwende einen lockeren und natürlichen Ton.",
    },
}


def get_system_prompt(
    workflow_id: str,
    lang: str,
    emoji_density: str = "media",
    tone: str = "neutral",
    custom_prompt: str = "",
    context: str = "",
) -> str:
    if workflow_id == "transcribir":
        return ""

    # Custom prompt overrides entirely (like BlitzText)
    if custom_prompt.strip():
        base = custom_prompt.strip()
        if context.strip() and workflow_id in ("mejorar", "profesional"):
            base += f"\n\nContexto: {context.strip()}"
        return base

    prompts = _PROMPTS.get(workflow_id, {})
    effective_lang = lang if lang in prompts else "en"
    prompt = prompts.get(effective_lang, "")

    if workflow_id == "emoji":
        density_map = _EMOJI_DENSITY.get(emoji_density, _EMOJI_DENSITY["media"])
        density_str = density_map.get(effective_lang, density_map.get("en", ""))
        prompt = prompt.replace("{density}", density_str)

    if workflow_id in ("mejorar", "profesional") and tone in _TONE_ADDENDUM:
        addendum = _TONE_ADDENDUM[tone].get(effective_lang, _TONE_ADDENDUM[tone]["en"])
        prompt += addendum

    if context.strip() and workflow_id in ("mejorar", "profesional"):
        prompt += f"\n\nContexto: {context.strip()}"

    return prompt


def get_processing_label(workflow_id: str, lang: str) -> str:
    labels = _PROCESSING_LABELS.get(workflow_id, {})
    return labels.get(lang, labels.get("en", "⏳  Procesando…"))


def workflow_menu_label(wf: WorkflowDef, lang: str) -> str:
    if lang == "de":
        name = wf.label_de
        desc = wf.description_de
    elif lang == "es":
        name = wf.label_es
        desc = wf.description_es
    else:
        name = wf.label_en
        desc = wf.description_en
    return f"{wf.icon}  {name}  —  {desc}"
