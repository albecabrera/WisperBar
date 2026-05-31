# WisperBar

Aplicación nativa Swift para la barra de menú de macOS. Dictado por voz local usando el reconocimiento de Apple (`SFSpeechRecognizer`), con pegado automático en cualquier campo de texto.

## Requisitos

- macOS 13.0+
- Apple Silicon (arm64)
- Xcode 15+ para compilar y ejecutar

## Cómo ejecutar

Abrir `WisperBar.xcodeproj` en Xcode y darle **Run** (⌘R). La app aparece en la barra de menú (ícono de onda + micrófono).

> **Nota:** la app se firma ad-hoc en modo Debug. Los permisos del sistema (micrófono, voz, accesibilidad) quedan atados al binario de Xcode — concedelos en el primer arranque.

## Uso

| Acción | Tecla / Control |
|--------|-----------------|
| Iniciar dictado | Mantener **Opción derecha (⌥)** |
| Detener y pegar | Soltar **Opción derecha (⌥)** |
| Menú de opciones | Click derecho en el ícono de la barra |

Al soltar la tecla, el texto transcripto se copia al portapapeles y se pega automáticamente en el campo activo.

## Funcionalidades

- **Dictado en español** (`es-ES`) con reconocimiento on-device cuando está disponible
- **Puntuación automática** — punto, coma, signos de apertura y cierre (`¿?`, `¡!`)
- **Overlay animado** — panel flotante estilo "liquid glass" con barras de onda durante el dictado
- **Push-to-Talk** — graba solo mientras se mantiene presionada la tecla; suelta y pega
- **Guard anti-pegado doble** — evita que el texto se inserte dos veces si la tecla dispara dos eventos al soltarse

## Permisos necesarios

En el primer arranque macOS pide:

1. **Micrófono** — para capturar el audio
2. **Reconocimiento de voz** — para la transcripción con `SFSpeechRecognizer`
3. **Accesibilidad** — para el monitor global de teclado (Opción derecha) y el Cmd+V automático

Conceder los tres en **Ajustes → Privacidad y seguridad**.

## Arquitectura

```
WisperBar/
├── App/
│   ├── WisperBarApp.swift       — punto de entrada SwiftUI
│   └── AppDelegate.swift        — barra de menú, overlay, hotkey, menú contextual
├── Managers/
│   └── HotKeyManager.swift      — monitor global NSEvent para Opción derecha
├── Models/
│   └── SpeechRecognizer.swift   — SFSpeechRecognizer (es-ES), auto-paste, guard idempotente
├── Views/
│   ├── FloatingWaveformView.swift — overlay "liquid glass" con animación de barras
│   ├── PopoverView.swift          — UI del popover (transcripción, controles)
│   └── WaveformView.swift
├── Extensions/
│   └── Notification+Names.swift  — nombres de notificaciones internas
└── Resources/
    ├── Info.plist
    └── WisperBar.entitlements
```

## Reconocimiento

Todo el procesamiento ocurre en el dispositivo. No se envía audio a ningún servidor.
