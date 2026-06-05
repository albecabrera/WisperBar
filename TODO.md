# WisperBar — TODO

Mejoras identificadas comparando con BlitzText App (referencia de la industria).
Cada ítem tiene su prioridad y estimación de complejidad.

---

## Alta prioridad

### 1. Workflows modulares (modos de dictado)
**Qué:** Ofrecer distintos modos de procesamiento seleccionables desde el menú.
- `Transcribir` — texto crudo tal cual (comportamiento actual)
- `Mejorar` — post-procesado con LLM para limpiar gramática y puntuación
- `Reescribir` — reformula el mensaje en tono más profesional/formal
- `Emoji` — añade emojis contextuales al texto transcripto

**Por qué:** el dictado crudo a veces produce texto que necesita limpieza antes de enviarse. Automatizarlo en un paso lo hace 10x más útil.
**Complejidad:** Media. Requiere integración opcional con API de LLM (Claude/GPT).

---

### 2. Post-procesado LLM opcional
**Qué:** Después de transcribir, pasar el texto por un LLM (Claude Haiku o GPT-4o-mini) para mejorarlo.
**Por qué:** Whisper es muy bueno con palabras pero no con puntuación ni estructura de párrafos. Un LLM barato (`haiku-4-5`) lo corrige en < 1 segundo.
**Complejidad:** Baja si se usa como modo opcional. Requiere configurar API key.

---

### 3. Almacenamiento seguro de API keys (Keychain)
**Qué:** Guardar las API keys de OpenAI/Anthropic en el Keychain de macOS en vez de en texto plano o variables de entorno.
**Por qué:** Seguridad básica. Las keys no deben vivir en archivos ni memoria sin cifrar.
**Complejidad:** Baja en Python con `keyring` library.

---

## Media prioridad

### 4. Panel de configuración mejorado
**Qué:** Ventana de preferencias con:
- Selección de modelo Whisper (large-v3, medium, small)
- API key para modo LLM
- Workflow por defecto
- Vocabulario personalizado (ver ítem 5)

**Por qué:** Ahora todo está hardcodeado. Hace falta una UI mínima para usuarios no técnicos.
**Complejidad:** Media. UI en rumps o NSWindow básico.

---

### 5. Vocabulario personalizado
**Qué:** Lista de palabras/frases que Whisper tiende a transcribir mal (nombres propios, términos técnicos, marcas). Se inyectan como `initial_prompt` en la llamada a `mlx_whisper.transcribe`.
**Por qué:** Whisper acepta un `initial_prompt` que actúa como contexto — mejora drásticamente la precisión para términos específicos.
**Complejidad:** Baja. Solo hay que exponer `initial_prompt` y persistir las palabras en un JSON.

**Implementación:**
```python
result = mlx_whisper.transcribe(
    audio,
    path_or_hf_repo=MODEL_REPO,
    language=lang,
    task="transcribe",
    initial_prompt="WisperBar, MLX, SwiftUI, ...",  # vocabulario
)
```

---

### 6. Historial de transcripciones
**Qué:** Últimas N transcripciones accesibles desde el menú para copiar/re-pegar.
**Por qué:** Es común querer recuperar algo que se dictó hace 2 minutos.
**Complejidad:** Baja. Lista en memoria o archivo JSON local.

---

## Baja prioridad / Experimental

### 7. Modo "profesionalizar" (inspirado en BlitzText $%&!)
**Qué:** Transforma dictado informal/frustrado en lenguaje profesional antes de pegarlo.
**Por qué:** Útil para emails o mensajes rápidos dictados en caliente.
**Complejidad:** Baja una vez que esté el post-procesado LLM (ítem 2).

### 8. Hotkey configurable
**Qué:** Permitir cambiar el atajo de teclado desde las preferencias (actualmente hardcodeado a Option derecho).
**Por qué:** Conflictos con otros atajos del sistema según el workflow del usuario.
**Complejidad:** Media.

### 9. Soporte de más idiomas en el menú
**Qué:** Agregar FR, PT, IT, JA, ZH al selector de idioma.
**Por qué:** Whisper large-v3 los soporta nativamente — es solo agregar entradas al array `LANGUAGES`.
**Complejidad:** Trivial.

---

## Notas de arquitectura

- Los ítems 1-3 son el core del siguiente milestone: convertir WisperBar de "transcriptor" a "asistente de dictado inteligente".
- El ítem 5 (vocabulario) es el de mayor ROI — 1h de trabajo, mejora notable en precisión.
- Antes de integrar LLM, evaluar **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) por latencia y costo vs GPT-4o-mini.
