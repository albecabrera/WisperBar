# WisperBar

![macOS](https://img.shields.io/badge/macOS-13.0%2B-black?style=flat-square&logo=apple)
![Swift](https://img.shields.io/badge/Swift-5.9-orange?style=flat-square&logo=swift)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)
![MLX](https://img.shields.io/badge/MLX-Apple%20Silicon-red?style=flat-square&logo=apple)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Platform](https://img.shields.io/badge/platform-arm64-lightgrey?style=flat-square)

Aplicación nativa para la barra de menú de macOS que convierte tu voz en texto al instante y lo pega automáticamente donde estés escribiendo. Incluye corrección inteligente de puntuación, detección de preguntas, y workflows LLM opcionales. Todo ocurre en tu máquina — sin servidores, sin internet, sin costos.

---

## ¿Para qué sirve?

Mantenés presionada la tecla **Opción derecha (⌥)**, hablás, la soltás — y el texto aparece donde tengas el cursor. En cualquier app: Notion, Slack, VS Code, un formulario web, lo que sea.

---

## ¿Cómo funciona? (para el no entendido en tecnología)

Imaginá que hay un asistente dentro de tu computadora que:

1. **Escucha tu voz** mientras sostenés la tecla — como un walkie-talkie
2. **Convierte lo que dijiste en texto** usando inteligencia artificial que corre localmente
3. **Copia ese texto** al portapapeles automáticamente
4. **Lo pega** en la app que tenías abierta, como si lo hubieras escrito a mano

Todo esto pasa en menos de un segundo, y **jamás sale de tu computadora**. No hay grabaciones enviadas a ningún lado.

---

## Flujo de información

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TU COMPUTADORA                              │
│                                                                     │
│  [Micrófono]                                                        │
│      │                                                              │
│      ▼  audio crudo (16.000 muestras/segundo)                       │
│  ┌───────────────┐                                                  │
│  │  Audio Engine │  captura y convierte señal analógica → digital   │
│  └───────┬───────┘                                                  │
│          │  PCM float32                                             │
│          ├──────────────────────────────────────────────────────┐   │
│          │                                                       │   │
│          ▼                                                       ▼   │
│  ┌───────────────┐                                  ┌─────────────┐ │
│  │  Reconocedor  │  (Swift) SFSpeechRecognizer            │ Visualizador│ │
│  │  de voz       │  (Python) MLX Whisper large-v3-turbo   │  de ondas   │ │
│  └───────┬───────┘                                  └─────────────┘ │
│          │  texto transcripto                                        │
│          ▼                                                           │
│  ┌───────────────┐                                                  │
│  │  Portapapeles │  NSPasteboard / pyperclip                        │
│  └───────┬───────┘                                                  │
│          │  Cmd+V simulado                                          │
│          ▼                                                          │
│  ┌───────────────┐                                                  │
│  │   Tu app      │  Notion, Slack, VS Code, browser…               │
│  └───────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

El audio **nunca sale** de este diagrama. No hay paso 5 que diga "enviar a la nube".

---

## Características principales (versión Python)

### Comandos de puntuación hablados

Decí el signo en voz alta y WisperBar lo convierte al símbolo. Funciona mezclando ES / EN / DE en el mismo dictado.

| Lo que decís | Lo que aparece |
|---|---|
| "coma" / "Komma" / "comma" | `,` |
| "punto" / "Punkt" / "period" / "full stop" | `.` |
| "signo de interrogación" / "Fragezeichen" / "question mark" | `?` |
| "signo de exclamación" / "Ausrufezeichen" / "exclamation mark" | `!` |
| "abrir paréntesis" / "Klammer auf" / "open parenthesis" | `(` |
| "cerrar paréntesis" / "Klammer zu" / "close parenthesis" | `)` |
| "párrafo" / "Absatz" / "new paragraph" | salto de párrafo |

### Detección automática de preguntas

El módulo NLP analiza cada oración transcripta y aplica puntuación de pregunta automáticamente, sin que lo pidás:

- **Palabras interrogativas** — "qué", "cómo", "por qué", "how", "what", "warum", etc. → agrega `?`
- **Inversión verbo-sujeto** — "¿Tenés tiempo?" detectado aunque no se haya dicho el signo
- **Apertura española** — agrega `¿` al inicio automáticamente en español
- **Mayúsculas** — capitaliza el inicio de cada oración nueva y cada párrafo

### Workflows LLM

Seleccionable desde el menú o el panel de configuración. Cada workflow transforma el texto transcripto con un prompt especializado:

| Workflow | Descripción |
|---|---|
| 🎙 Transcribir | Transcripción directa con puntuación corregida |
| ✏️ Mejorar | Mejora redacción manteniendo el sentido |
| 👔 Profesional | Reformula en tono formal |
| 🧘 Desahogo | Transcribe sin filtros, ideal para notas privadas |
| 😊 Emoji | Agrega emojis contextuales al texto |

Los workflows requieren un LLM configurado (ver sección de proveedores).

### Soporte multi-proveedor LLM

WisperBar puede opcionalmente enviar el texto transcripto a un LLM para procesarlo. Las API keys se guardan en el **Keychain de macOS**, nunca en archivos de configuración.

| Proveedor | Descripción |
|---|---|
| **Ollama** | LLM 100% local. Cero datos salen de tu máquina. Recomendado. |
| **Anthropic** | Claude (Opus, Sonnet, Haiku) vía API |
| **OpenAI** | GPT-4o, o1, o3, o4-mini y otros vía API |
| **Generic** | Cualquier endpoint compatible con la API de OpenAI |

Sin LLM configurado, WisperBar transcribe directamente sin procesar el texto.

### Vocabulario técnico

El modelo Whisper recibe un vocabulario de términos técnicos como guía de contexto (APIs, frameworks, términos de negocio) para mejorar la precisión en dictados técnicos en ES, EN y DE.

---

## Tecnologías

### Stack principal

| Tecnología | Qué hace en este proyecto |
|------------|--------------------------|
| **Swift 5.9** | Lenguaje nativo de Apple. La versión principal de la app está escrita aquí |
| **SwiftUI + AppKit** | Construye la interfaz: ícono en la barra, overlay animado, menú |
| **SFSpeechRecognizer** | API de Apple para reconocimiento de voz on-device (sin internet) |
| **AVAudioEngine** | Captura audio del micrófono en tiempo real |
| **CGEvent** | Simula la pulsación Cmd+V para pegar en cualquier app |
| **SMAppService** | Registra la app para que inicie automáticamente con el sistema |

### Stack Python (versión alternativa con Whisper)

| Tecnología | Qué hace en este proyecto |
|------------|--------------------------|
| **Python 3.10+** | Lenguaje de scripting; orquesta el flujo completo |
| **MLX Whisper** | Whisper large-v3-turbo de OpenAI corriendo en Apple Silicon con el framework MLX de Apple — reconocimiento de voz muy preciso, multiidioma, más rápido que large-v3 |
| **MLX** | Framework de Apple para Machine Learning en chips M1/M2/M3/M4. Usa la GPU/Neural Engine del chip sin necesidad de CUDA ni GPU externa |
| **sounddevice** | Captura audio del micrófono vía PortAudio |
| **NumPy** | Procesa las muestras de audio (arrays float32, cálculo de RMS) |
| **rumps** | Crea la app de barra de menú en Python (wraps NSStatusItem) |
| **pynput** | Escucha teclas globales (la Opción derecha) aunque otra app esté en foco |
| **pyperclip** | Copia texto al portapapeles (wraps NSPasteboard) |
| **PyObjC** | Puente Python ↔ Objective-C; necesario para crear el overlay NSPanel sin Xcode |
| **macOS Keychain** | Almacena API keys de LLMs de forma segura vía `security` CLI |

#### Módulos internos

| Módulo | Qué hace |
|--------|----------|
| `punctuation.py` | Reemplaza comandos hablados por símbolos de puntuación (ES/EN/DE) |
| `sentence_parser.py` | Detecta preguntas y corrige apertura/cierre en ES/EN/DE |
| `workflows.py` | Define los prompts de cada workflow LLM multiidioma |
| `llm_service.py` | Cliente unificado para Ollama, Anthropic, OpenAI y endpoints genéricos |
| `vocab.py` | Vocabulario técnico para guiar el reconocimiento de Whisper |
| `config_panel.py` | Panel de configuración nativo (PyObjC): proveedor LLM, modelo, idioma, hotkey mode |
| `i18n.py` | Internacionalización de la UI en ES / EN / DE |
| `autostart.py` | Registra y gestiona el LaunchAgent de macOS |

#### Compatibilidad Python 3.13

Python 3.13 eliminó el acceso a variables de bloque `except ... as exc` desde closures internos. WisperBar captura el mensaje de error como string antes de que Python borre la variable, garantizando que el estado de la app se resetee correctamente ante cualquier falla de audio. Además, el motor de grabación reintenta abrir el stream de micrófono con un breve delay cuando PortAudio devuelve el error `-10851` (`kAudioUnitErr_InvalidPropertyValue`), que ocurre cuando otra app acaba de liberar el micrófono.

### ¿Qué es MLX Whisper en palabras simples?

Whisper es un modelo de inteligencia artificial creado por OpenAI que escucha audio y lo convierte en texto. Normalmente requiere una computadora muy potente o conexión a internet. Apple creó MLX, un framework que hace que ese mismo modelo corra directamente en el chip M1/M2/M3/M4 de tu Mac, usando la parte del chip dedicada a inteligencia artificial (Neural Engine), sin necesidad de internet ni de hardware especial.

WisperBar usa **large-v3-turbo**, una versión destilada que es ~8x más rápida que large-v3 con precisión casi idéntica. Además, al iniciar, la app ejecuta un **warmup** silencioso — transcribe un segundo de silencio — para que el primer dictado real no tenga el delay de carga del modelo.

---

## Dos versiones

Este repositorio contiene dos implementaciones independientes:

| | Swift nativa | Python + MLX Whisper |
|-|-------------|----------------------|
| **Ubicación** | `WisperBar/` | `wisperbar_py/` |
| **Motor de voz** | SFSpeechRecognizer (Apple) | Whisper large-v3-turbo (OpenAI vía MLX) |
| **Idiomas** | Español (`es-ES`) | Auto-detect + ES / EN / DE |
| **Primer arranque** | Instantáneo | Descarga el modelo (~800 MB, solo la primera vez) |
| **Precisión** | Alta para español | Muy alta, multiidioma |
| **NLP / puntuación** | No | Sí — comandos hablados + detección de preguntas |
| **Workflows LLM** | No | Sí — Ollama / Anthropic / OpenAI / genérico |
| **Cómo correr** | Xcode o `make run` | `./deploy.sh` |

---

## Requisitos

- macOS 13.0+ (Ventura o posterior)
- Apple Silicon (M1 / M2 / M3 / M4)
- **Para la versión Swift:** Xcode 15+
- **Para la versión Python:** Python 3.10+ (`brew install python`)

---

## Uso

| Acción | Tecla / Control |
|--------|-----------------|
| Iniciar dictado | Mantener **Opción derecha (⌥)** |
| Detener y pegar | Soltar **Opción derecha (⌥)** |
| Menú de opciones | Click en el ícono de la barra de menú |
| Configuración | Primer ítem del menú desplegable |

Al soltar la tecla, el texto transcripto se procesa (NLP + workflow LLM si está configurado), se copia al portapapeles y se pega automáticamente en el campo activo.

### Panel de configuración

Accesible desde el menú. Permite configurar:

- **Proveedor LLM** — Ollama (local), Anthropic, OpenAI, o endpoint genérico
- **Modelo** — selección dinámica según el proveedor
- **API Key** — guardada en Keychain, nunca en disco
- **Workflow activo** — el que se aplica a cada transcripción
- **Idioma de la UI** — Español / English / Deutsch
- **Modo hotkey** — hold (mantener) o toggle (presionar una vez)

---

## Deploy / Instalación

### Versión Swift (recomendada)

```bash
# 1. Clonar el repositorio
git clone https://github.com/albecabrera/WisperBar.git
cd WisperBar

# 2. Generar el proyecto Xcode y compilar
make run
```

O abrí `WisperBar.xcodeproj` en Xcode y presioná **⌘R**.

> La app se firma ad-hoc en modo Debug. Los permisos del sistema (micrófono, voz, accesibilidad) se piden en el primer arranque.

---

### Versión Python (deploy automatizado)

El script `deploy.sh` crea un entorno virtual Python aislado, instala las dependencias y lanza la app:

```bash
./deploy.sh
```

El script hace:
1. Verifica que Python 3.10+ y Homebrew estén disponibles
2. Crea un entorno virtual en `wisperbar_py/.venv`
3. Instala todas las dependencias del `requirements.txt`
4. Lanza WisperBar desde el entorno aislado

La primera vez descarga el modelo Whisper large-v3-turbo (~800 MB). Las siguientes veces arranca directamente.

---

### Inicio automático (LaunchAgent)

La versión Python se registra como **LaunchAgent** de macOS la primera vez que arranca. Esto significa que se inicia automáticamente con cada encendido o reinicio sin ninguna acción adicional.

**Cómo funciona:**

El módulo `autostart.py` genera y carga un plist en `~/Library/LaunchAgents/com.wisperbar.app.plist` con estas propiedades:

| Propiedad | Valor | Efecto |
|-----------|-------|--------|
| `RunAtLoad` | `true` | Arranca al hacer login |
| `KeepAlive.SuccessfulExit` | `false` | Se reinicia ante cualquier salida no exitosa (crash, excepción Python, kill) |
| `ProcessType` | `Interactive` | Acceso a micrófono y pantalla |
| Logs | `/tmp/wisperbar.log` / `/tmp/wisperbar.err` | stdout y stderr persistidos |

**Comandos de gestión manual:**

```bash
# Ver si está corriendo (primera columna = PID, - = detenido)
launchctl list | grep wisperbar

# Iniciar ahora (sin reiniciar)
launchctl kickstart gui/$(id -u)/com.wisperbar.app

# Detener
launchctl kill TERM gui/$(id -u)/com.wisperbar.app

# Deshabilitar inicio automático
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.wisperbar.app.plist

# Ver logs en tiempo real
tail -f /tmp/wisperbar.log /tmp/wisperbar.err
```

> **Nota:** Si `brew upgrade` actualiza Python, el plist queda apuntando al ejecutable viejo. En ese caso, borrá `~/Library/LaunchAgents/com.wisperbar.app.plist` y reiniciá la app manualmente — se auto-registra con la nueva ruta.

---

## Permisos necesarios

En el primer arranque macOS pide:

| Permiso | Para qué |
|---------|----------|
| **Micrófono** | Capturar el audio mientras hablás |
| **Reconocimiento de voz** | Transcribir con `SFSpeechRecognizer` (solo versión Swift) |
| **Accesibilidad** | Monitor global de teclado (Opción derecha) y Cmd+V automático |

Concedelos en **Configuración del Sistema → Privacidad y seguridad**.

---

## Arquitectura (versión Swift)

```
WisperBar/
├── App/
│   ├── WisperBarApp.swift          — punto de entrada SwiftUI
│   └── AppDelegate.swift           — barra de menú, overlay, hotkey, menú contextual
├── Managers/
│   ├── HotKeyManager.swift         — monitor global NSEvent para Opción derecha
│   └── WaveformOverlayManager.swift — gestiona el panel flotante de ondas
├── Models/
│   └── SpeechRecognizer.swift      — SFSpeechRecognizer (es-ES), auto-paste, guard idempotente
├── Views/
│   ├── FloatingWaveformView.swift  — overlay "liquid glass" con animación de barras
│   ├── PopoverView.swift           — UI del popover (transcripción, controles)
│   └── WaveformView.swift          — componente de visualización de audio
├── Extensions/
│   └── Notification+Names.swift   — nombres de notificaciones internas
└── Resources/
    ├── Info.plist
    └── WisperBar.entitlements
```

---

## Privacidad

Todo el procesamiento de audio y voz ocurre **en el dispositivo**. No se envía audio, texto ni metadatos a ningún servidor externo.
