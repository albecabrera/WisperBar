# WisperBar — Plan de Mejoras

> Versión local 100%: MLX Whisper para transcripción + Ollama para post-procesado.
> Sin dependencias de APIs pagas. Sin datos en la nube.

---

## Arquitectura objetivo

```
[PTT / Hotkey]
      │
      ▼
┌─────────────────┐
│  Workflow Engine │  ← selección de workflow por menú
└────────┬────────┘
         │
    ┌────▼────┐
    │ Whisper  │  MLX large-v3 — transcripción
    └────┬────┘
         │ texto crudo
    ┌────▼────────────────┐
    │ OllamaService       │  ← si workflow ≠ "solo transcribir"
    │ (localhost:11434)   │
    └────┬────────────────┘
         │ texto procesado
    ┌────▼────┐
    │  Paste  │  → app activa
    └─────────┘
```

---

## EPIC 1 — Integración Ollama

**Objetivo:** detectar Ollama, listar modelos disponibles y enrutar post-procesado localmente.

### US-1.1 — Detección automática de Ollama
**Como** usuario, **quiero** que la app detecte si Ollama está corriendo al arrancar,
**para** saber si los workflows con post-procesado LLM están disponibles.

**Criterios de aceptación:**
- Al iniciar, la app hace `GET http://localhost:11434/api/tags` con timeout 2s
- Si responde → `ollama_available = True`, workflows LLM habilitados
- Si no responde → workflows LLM se muestran en gris con tooltip "Ollama no está corriendo"
- Estado se refresca cada 30s en background (sin bloquear UI)
- Indicador en menú: `🟢 Ollama activo` / `🔴 Ollama no detectado`

### US-1.2 — Listado y selección de modelo
**Como** usuario, **quiero** elegir qué modelo Ollama usa para post-procesado,
**para** ajustar velocidad vs calidad según mis necesidades.

**Criterios de aceptación:**
- Al detectar Ollama, parsea lista de modelos vía `/api/tags`
- Modelo por defecto: primer modelo cuyo nombre empiece con `translate` (ej. `translategemma3:latest`)
- Si no hay modelo `translate*`, usa el primer modelo disponible
- Selector en panel de configuración: dropdown con todos los modelos locales
- Selección se persiste en `config.json`

### US-1.3 — Servicio OllamaService (implementación)
**Interfaz interna del servicio:**

```python
# wisperbar_py/ollama_service.py

BASE_URL = "http://localhost:11434"

class OllamaService:
    @staticmethod
    def is_running() -> bool
        # GET /api/tags, timeout=2s, return bool

    @staticmethod
    def list_models() -> list[str]
        # GET /api/tags → modelos["models"][*]["name"]

    @staticmethod
    def default_model(models: list[str]) -> str
        # primer nombre que empiece con "translate", o models[0]

    @staticmethod
    def chat(model: str, system: str, user: str, timeout=60) -> str
        # POST /v1/chat/completions (compatible OpenAI)
        # streaming=False, temperatura según workflow
        # raises OllamaError si falla
```

---

## EPIC 2 — Workflows Modulares

**Objetivo:** 5 modos de dictado seleccionables, cada uno con comportamiento y prompt diferente.
Inspirado en BlitzText pero adaptado a Ollama y multiidioma.

### Definición de workflows

| ID | Nombre ES | Nombre EN | Nombre DE | Hotkey | LLM | Descripción |
|----|-----------|-----------|-----------|--------|-----|-------------|
| `transcribir` | Transcribir | Transcribe | Transkript | ⌥R (actual) | ❌ | Texto crudo, sin post-procesado |
| `mejorar` | Mejorar | Improve | Verbessern | ⌥R + selección | ✅ | Corrige gramática, mejora fluidez |
| `profesional` | Profesionalizar | Professionalize | Professionell | ⌥R + selección | ✅ | Reformula en tono formal/profesional |
| `desahogo` | Desahogo | Vent | Dampf ablassen | ⌥R + selección | ✅ | Frustración → mensaje respetuoso |
| `emoji` | Emoji | Emoji | Emoji | ⌥R + selección | ✅ | Añade emojis contextuales |

### US-2.1 — Selección de workflow desde menú
**Como** usuario, **quiero** elegir el workflow antes de dictar,
**para** que el texto se procese según lo que necesito en ese momento.

**Criterios de aceptación:**
- Menú muestra los 5 workflows con icono, nombre y descripción corta
- Workflow activo tiene checkmark (✓)
- Workflows con LLM muestran indicador de Ollama (✅/❌)
- Selección persiste entre sesiones en `config.json`
- El hotkey ⌥R usa siempre el workflow actualmente seleccionado

### US-2.2 — Workflow `transcribir` (sin cambios funcionales)
Comportamiento actual. Texto crudo de Whisper → clipboard → paste.
Sin pasos adicionales. Sirve como baseline y modo offline garantizado.

### US-2.3 — Workflow `mejorar`
**Como** usuario, **quiero** dictar en lenguaje informal y que el texto salga limpio y fluido,
**para** no tener que corregir después.

Flujo:
1. Whisper transcribe (con vocabulario del idioma activo)
2. Status: `✏️ Mejorando con Ollama…` + animación de puntos pulsantes
3. Ollama recibe el texto con system prompt de mejora (ver EPIC 3)
4. Resultado → clipboard → paste

### US-2.4 — Workflow `profesional`
**Como** usuario, **quiero** dictar de forma casual y obtener texto formal para emails o reportes,
**para** no tener que reformular manualmente.

Flujo: igual que `mejorar` pero con prompt de formalización.
Útil para: emails profesionales, informes, comunicados.

### US-2.5 — Workflow `desahogo`
**Como** usuario, **quiero** dictar mi frustración libremente y obtener un mensaje calmado,
**para** no enviar algo que lamente.

Flujo: igual que `mejorar` pero con prompt de desescalada.
El modelo identifica el problema real y lo reformula sin agresividad.
Mantiene: hechos concretos, límites legítimos, urgencia justificada.
Elimina: insultos, amenazas, sarcasmo, suposiciones negativas.

### US-2.6 — Workflow `emoji`
**Como** usuario, **quiero** que mi texto dictado tenga emojis apropiados,
**para** mensajes más expresivos en chats informales.

Parámetro de densidad: `poca` / `media` / `mucha` (configurable en settings).

---

## EPIC 3 — Prompts especializados por idioma

**Objetivo:** cada workflow tiene prompts de sistema específicos para ES, EN y DE,
calibrados para producir la mejor salida con modelos pequeños (translategemma, llama3.2, etc.).

> **Principio de diseño de prompts para modelos pequeños:**
> - Instrucción única, sin ambigüedad
> - Salida exactamente especificada ("devuelve SOLO el texto")
> - Sin introducciones ni explicaciones en la respuesta
> - Temperatura baja (0.2–0.4) para consistencia

### US-3.1 — Prompts `mejorar`

**Español:**
```
Eres un editor de textos. Recibes una transcripción de voz en español.
Tu tarea: corregir ortografía y gramática, mejorar la fluidez, 
mantener el significado original y el registro del hablante.
Devuelve SOLO el texto corregido, sin explicaciones ni comentarios.
```

**English:**
```
You are a text editor. You receive a voice transcription in English.
Your task: fix spelling and grammar, improve readability,
preserve the original meaning and the speaker's register.
Return ONLY the corrected text, no explanations or comments.
```

**Deutsch:**
```
Du bist ein Lektor. Du erhältst ein Sprachtranskript auf Deutsch.
Deine Aufgabe: Rechtschreibung und Grammatik korrigieren, Lesefluss verbessern,
ursprüngliche Bedeutung und Sprachregister beibehalten.
Gib NUR den korrigierten Text zurück, ohne Erklärungen.
```

### US-3.2 — Prompts `profesional`

**Español:**
```
Eres un asistente de redacción profesional. Recibes una transcripción de voz en español.
Tu tarea: reformular el mensaje en tono formal y profesional, 
manteniendo toda la información relevante.
Elimina coloquialismos, muletillas y estructuras informales.
El resultado debe ser apto para emails corporativos o documentos formales.
Devuelve SOLO el texto reformulado.
```

**English:**
```
You are a professional writing assistant. You receive a voice transcription in English.
Your task: rewrite the message in a formal, professional tone,
preserving all relevant information.
Remove colloquialisms, filler words, and informal structures.
The result must be suitable for corporate emails or formal documents.
Return ONLY the reformulated text.
```

**Deutsch:**
```
Du bist ein professioneller Schreibassistent. Du erhältst ein Sprachtranskript auf Deutsch.
Deine Aufgabe: Die Nachricht in einem formellen, professionellen Ton umformulieren,
alle relevanten Informationen erhalten.
Umgangssprache, Füllwörter und informelle Strukturen entfernen.
Das Ergebnis muss für geschäftliche E-Mails oder formelle Dokumente geeignet sein.
Gib NUR den umformulierten Text zurück.
```

### US-3.3 — Prompts `desahogo`

**Español:**
```
Recibes una transcripción emocional de voz en español. 
Identifica el objetivo real, el problema concreto y la frustración legítima del hablante.
Reformula el mensaje de forma clara, respetuosa y efectiva para que logre su objetivo.
Conserva: hechos concretos, problemas específicos, límites legítimos, urgencia justificada.
Elimina: insultos, amenazas, sarcasmo, suposiciones negativas, escalada innecesaria.
Si hay múltiples quejas, condénsalas en los puntos esenciales.
El tono debe ser calmado, humano, directo y orientado a soluciones.
Devuelve SOLO el mensaje reformulado.
```

**English:**
```
You receive an emotional voice transcription in English.
Identify the speaker's real goal, the concrete problem, and their legitimate frustration.
Rewrite the message in a clear, respectful, and effective way to help them achieve their goal.
Keep: concrete facts, specific problems, legitimate boundaries, justified urgency.
Remove: insults, threats, sarcasm, negative assumptions, unnecessary escalation.
If multiple complaints are mentioned, condense them to the essential core points.
The tone should be calm, human, direct, and solution-oriented.
Return ONLY the reformulated message.
```

**Deutsch:**
```
Du erhältst ein emotional gesprochenes Transkript auf Deutsch.
Erkenne zuerst das eigentliche Ziel, das konkrete Problem und den legitimen Frust der Person.
Formuliere daraus eine klare, respektvolle und wirksame Nachricht.
Bewahre: konkrete Fakten, spezifische Probleme, legitime Grenzen, berechtigte Dringlichkeit.
Entferne: Beleidigungen, Drohungen, Sarkasmus, negative Unterstellungen, unnötige Eskalation.
Wenn mehrere Vorwürfe genannt werden, verdichte sie auf die entscheidenden Kernpunkte.
Der Ton soll ruhig, menschlich, bestimmt und lösungsorientiert sein.
Gib NUR die fertige Nachricht zurück.
```

### US-3.4 — Prompts `emoji`

Parámetro `{density_instruction}` se inyecta según configuración:
- `poca` → "Añade solo 1-2 emojis por párrafo, en los momentos más expresivos."
- `media` → "Añade emojis cada 1-2 oraciones en los puntos clave."
- `mucha` → "Añade emojis generosamente, varios por oración cuando sea natural."

**Español:**
```
Recibes una transcripción de voz en español. Devuelve el texto fielmente 
pero añade emojis contextuales y apropiados.
{density_instruction}
Corrige errores obvios de transcripción. Mantén el estilo y significado.
Devuelve SOLO el texto con emojis, sin explicaciones.
```

**English:**
```
You receive a voice transcription in English. Return the text faithfully
but add contextual and appropriate emojis.
{density_instruction}
Fix obvious transcription errors. Keep the style and meaning.
Return ONLY the text with emojis, no explanations.
```

**Deutsch:**
```
Du erhältst ein Sprachtranskript auf Deutsch. Gib den Text möglichst originalgetreu zurück,
aber füge passende Emojis hinzu.
{density_instruction}
Korrigiere offensichtliche Transkriptionsfehler. Behalte Stil und Bedeutung.
Gib NUR den Text mit Emojis zurück, ohne Erklärungen.
```

---

## EPIC 4 — Vocabulario Whisper por idioma

**Objetivo:** usar `initial_prompt` de MLX Whisper para mejorar la precisión en términos técnicos,
nombres propios y jerga específica por idioma.

> **Cómo funciona:** Whisper usa el `initial_prompt` como contexto previo a la transcripción.
> Los términos listados guían al modelo a preferir esas formas sobre alternativas fonéticamente similares.

### US-4.1 — Vocabularios base por idioma

Vocabulario base inspirado en los `customTerms` de BlitzText, adaptados:

**Español (`es`):**
```python
VOCAB_ES = [
    # Tech
    "API", "backend", "frontend", "full-stack", "DevOps", "CI/CD",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "machine learning", "deep learning", "inteligencia artificial",
    "base de datos", "framework", "repositorio", "pull request",
    "merge", "commit", "branch", "deploy", "deployment",
    # Negocio
    "stakeholder", "KPI", "roadmap", "sprint", "backlog",
    "MVP", "SaaS", "startup", "onboarding", "feedback",
    # Signos españoles (guía a Whisper)
    "¿verdad?", "¡exacto!", "¿no?",
]
```

**English (`en`):**
```python
VOCAB_EN = [
    # Tech
    "API", "backend", "frontend", "full-stack", "DevOps", "CI/CD",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "machine learning", "deep learning", "artificial intelligence",
    "database", "framework", "repository", "pull request",
    "merge", "commit", "branch", "deploy", "deployment",
    # Business
    "stakeholder", "KPI", "roadmap", "sprint", "backlog",
    "MVP", "SaaS", "startup", "onboarding", "feedback",
]
```

**Deutsch (`de`):**
```python
VOCAB_DE = [
    # Tech
    "API", "Backend", "Frontend", "Full-Stack", "DevOps",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "maschinelles Lernen", "künstliche Intelligenz",
    "Datenbank", "Framework", "Repository", "Pull Request",
    "Branch", "Deployment", "Commit",
    # Business
    "Stakeholder", "Roadmap", "Sprint", "Backlog",
    "MVP", "SaaS", "Onboarding", "Feedback",
    # Compuestos alemanes comunes en tech
    "Benutzeroberfläche", "Softwareentwicklung", "Datenschutz",
]
```

### US-4.2 — Vocabulario personalizado del usuario

**Como** usuario, **quiero** agregar mis propios términos al vocabulario de Whisper,
**para** que transcriba correctamente nombres propios, marcas o jerga de mi industria.

**Criterios de aceptación:**
- Campo de texto en panel de configuración: "Mis términos (separados por coma)"
- Se fusionan con el vocabulario base del idioma activo
- Se pasan como `initial_prompt` concatenado: `", ".join(vocab_base + user_terms)`
- Se persisten en `config.json`

### US-4.3 — Aplicación del vocabulario en transcripción

```python
def build_initial_prompt(lang: str, user_terms: list[str]) -> str:
    base = {"es": VOCAB_ES, "en": VOCAB_EN, "de": VOCAB_DE}.get(lang, [])
    all_terms = base + user_terms
    return ", ".join(all_terms) if all_terms else ""

# En _transcribe():
prompt = build_initial_prompt(lang_code, config["user_terms"])
result = mlx_whisper.transcribe(
    audio,
    path_or_hf_repo=MODEL_REPO,
    language=lang,
    task="transcribe",
    initial_prompt=prompt if prompt else None,
)
```

---

## EPIC 5 — Animación de procesamiento Ollama

**Objetivo:** feedback visual mientras Ollama procesa (puede tomar 2–15s según el modelo).

### US-5.1 — Spinner en icono de menú

**Como** usuario, **quiero** ver que la app está procesando con Ollama,
**para** saber que el sistema no se colgó.

**Criterios de aceptación:**
- Durante fase Ollama: icono en barra de menú anima entre frames: `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏`
- Velocidad: 80ms por frame (suficiente para ser visible, no molesto)
- Al completar: icono vuelve a `🎤`
- Implementación: `@rumps.timer(0.08)` con lista de frames e índice rotante

### US-5.2 — Overlay de procesamiento

**Como** usuario, **quiero** que el overlay de onda se transforme en un indicador de procesamiento,
**para** tener contexto visual de qué fase está ocurriendo.

**Estados del overlay:**

| Fase | Visual |
|------|--------|
| Grabando | Barras reactivas a voz (comportamiento actual) |
| Transcribiendo | Barras en animación idle lenta + label `Transcribiendo...` |
| Procesando Ollama | Puntos pulsantes animados (3 dots) + label `Mejorando...` / `Profesionalizando...` |
| Completado | Flash verde + desaparece en 1.5s |
| Error | Flash rojo + label de error + desaparece en 3s |

**Implementación puntos pulsantes:**
```python
# En WaveformView.drawRect_:
# Modo "processing": dibuja 3 círculos que palpitan con sfase de 120° cada uno
# usando sin(idle_t * 4 + i * 2.09) para el radio
```

### US-5.3 — Mensaje de estado en menú

El `lbl_status` muestra mensajes descriptivos en cada fase:

| Fase | ES | EN | DE |
|------|----|----|-----|
| Listo | `✅ Listo — mantener ⌥` | `✅ Ready — hold ⌥` | `✅ Bereit — ⌥ halten` |
| Grabando | `● Grabando...` | `● Recording...` | `● Aufnahme...` |
| Transcribiendo | `⏳ Transcribiendo...` | `⏳ Transcribing...` | `⏳ Transkription...` |
| Mejorando | `✏️ Mejorando con Ollama...` | `✏️ Improving with Ollama...` | `✏️ Wird verbessert...` |
| Profesionalizando | `👔 Profesionalizando...` | `👔 Professionalizing...` | `👔 Wird formalisiert...` |
| Desahogo | `🧘 Calmando el texto...` | `🧘 Calming the text...` | `🧘 Wird beruhigt...` |
| Emoji | `😊 Añadiendo emojis...` | `😊 Adding emojis...` | `😊 Emojis werden hinzugefügt...` |
| Error Ollama | `⚠️ Ollama no responde` | `⚠️ Ollama not responding` | `⚠️ Ollama antwortet nicht` |

---

## EPIC 6 — Panel de Configuración UX

**Objetivo:** ventana de preferencias accesible desde el menú, sin dependencias de frameworks UI complejos.

### US-6.1 — Acceso al panel de configuración

**Como** usuario, **quiero** abrir un panel de configuración desde el menú,
**para** ajustar todos los parámetros de la app sin tocar código.

**Criterios de aceptación:**
- Ítem en menú: `⚙️ Configuración...`
- Abre ventana NSWindow nativa (creada en main thread vía queue)
- La ventana es no-modal (la app sigue funcionando mientras está abierta)

### US-6.2 — Secciones del panel de configuración

**Sección: Ollama**
- Indicador de estado: `🟢 Ollama activo` / `🔴 Ollama no detectado`
- Botón `Refrescar`
- Dropdown: `Modelo` — lista de modelos disponibles
- Botón `Probar modelo` — envía prompt de prueba y muestra latencia

**Sección: Workflows**
- Selección de workflow por defecto
- Para workflow `emoji`: selector de densidad (`Poca / Media / Mucha`)
- Para workflow `mejorar` y `profesional`: selector de tono (`Formal / Neutro / Casual`)

**Sección: Idioma y Vocabulario**
- Dropdown de idioma (sincronizado con el del menú principal)
- Textarea: `Mis términos personalizados` (separados por coma)
- Preview en tiempo real: "Se usarán N términos con Whisper"

**Sección: Avanzado**
- Toggle: `Abrir al iniciar sesión`
- Timeout Ollama (segundos): slider 10–120s, default 60s
- Campo: `URL de Ollama` (default: `http://localhost:11434`)

### US-6.3 — Persistencia de configuración

Todo en `wisperbar_py/config.json`:

```json
{
  "workflow": "transcribir",
  "language": "auto",
  "ollama_url": "http://localhost:11434",
  "ollama_model": "translategemma3:latest",
  "ollama_timeout": 60,
  "emoji_density": "media",
  "text_tone": "neutral",
  "user_terms": [],
  "launch_at_login": false
}
```

---

## Orden de implementación

```
EPIC 1 (Ollama base)
    └─► EPIC 4 (Vocabulario Whisper)  ← independiente, fácil, alto ROI
    └─► EPIC 3 (Prompts)              ← independiente, solo texto
    └─► EPIC 2 (Workflows)            ← depende de EPIC 1 + 3
    └─► EPIC 5 (Animación)            ← depende de EPIC 2
    └─► EPIC 6 (Config panel)         ← depende de todos
```

### Orden sugerido de sprints

**Sprint 1 — Base técnica (EPIC 1 + EPIC 4):**
- `OllamaService`: detección, listado, chat
- Vocabulario base ES/EN/DE + user_terms en config
- `initial_prompt` aplicado en transcripción

**Sprint 2 — Workflows (EPIC 2 + EPIC 3):**
- 5 workflows con sus prompts
- Selección desde menú, persist en config
- Enrutamiento Whisper → Ollama según workflow

**Sprint 3 — Feedback visual (EPIC 5):**
- Spinner en menú durante Ollama
- Overlay estados: transcribiendo / procesando / done / error
- Mensajes de estado multiidioma

**Sprint 4 — Config UX (EPIC 6):**
- NSWindow configuración
- Todas las secciones del panel
- Persistencia completa en config.json

---

## Notas técnicas clave

### Ollama API (compatible OpenAI)
```python
POST http://localhost:11434/v1/chat/completions
{
  "model": "translategemma3:latest",
  "messages": [
    {"role": "system", "content": "...prompt..."},
    {"role": "user", "content": "...texto transcripto..."}
  ],
  "temperature": 0.3,
  "stream": false
}
```

### Manejo de errores Ollama
- `ConnectionRefusedError` → Ollama no está corriendo → mostrar `⚠️` y usar workflow `transcribir`
- Timeout → igual, degrade graceful a texto crudo
- Modelo no existe → mostrar error en panel, sugerir cambiar modelo

### Thread safety (crítico en macOS 26)
- `OllamaService.chat()` corre en `threading.Thread` (no bloquea UI)
- El resultado se envía al main thread vía `self._main_q.put(lambda: self._on_ollama_done(text))`
- La animación del spinner usa el `@rumps.timer(0.08)` existente

### Filtro de calidad de transcripción (inspirado en BlitzText)
Antes de enviar a Ollama, validar:
- Audio duration ≥ 0.3s
- Texto transcripto no vacío
- No es artefacto (ratio letras/caracteres > 0.5)
- Si falla validación → ignorar silenciosamente (no pegar nada)
