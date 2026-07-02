// HotKeyManager.swift
// Erkennt die linke Wahltaste (Left Option, keyCode 58) via NSEvent.flagsChanged.
// Push-to-Talk: gedrückt = aufnehmen, losgelassen = stoppen.
// Kein Carbon nötig – kein separater API-Key für reine Modifier-Tasten.
import AppKit

final class HotKeyManager {

    /// Hardware-keyCode der linken Wahltaste (kVK_Option).
    private static let leftOptionKeyCode: UInt16 = 58

    // MARK: – Eigenschaften

    private var globalMonitor: Any?
    private var localMonitor: Any?

    /// Letzter bekannter Zustand der linken Wahltaste (Edge-Detection).
    private var leftOptionDown = false

    // Statisch, damit Callback aus dem Monitor-Block erreichbar ist.
    // Bool: true = gerade gedrückt, false = gerade losgelassen.
    nonisolated(unsafe) static var onChange: ((Bool) -> Void)?

    // MARK: – Öffentliche API

    /// Monitor für die linke Wahltaste registrieren (Push-to-Talk).
    func register(callback: @escaping (Bool) -> Void) {
        HotKeyManager.onChange = callback
        installMonitors()
    }

    // MARK: – Monitor-Setup

    private func installMonitors() {
        let handler: (NSEvent) -> Void = { [weak self] event in
            self?.handleFlagsChanged(event)
        }

        // Global: greift wenn eine andere App im Vordergrund ist
        globalMonitor = NSEvent.addGlobalMonitorForEvents(matching: .flagsChanged) { event in
            handler(event)
        }

        // Lokal: greift wenn der Popover fokussiert ist
        localMonitor = NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { event in
            handler(event)
            return event
        }
    }

    /// Erkennt Drücken/Loslassen der linken Wahltaste über ihren keyCode.
    private func handleFlagsChanged(_ event: NSEvent) {
        // Nur Ereignisse der linken Wahltaste betrachten – alle anderen Modifier ignorieren.
        guard event.keyCode == HotKeyManager.leftOptionKeyCode else { return }

        // Gedrückt, wenn das Option-Flag jetzt gesetzt ist.
        let isDown = event.modifierFlags.contains(.option)

        // Nur bei echtem Zustandswechsel feuern (Edge-Detection).
        guard isDown != leftOptionDown else { return }
        leftOptionDown = isDown
        HotKeyManager.onChange?(isDown)
    }

    // MARK: – Aufräumen

    deinit {
        if let m = globalMonitor { NSEvent.removeMonitor(m) }
        if let m = localMonitor  { NSEvent.removeMonitor(m) }
        HotKeyManager.onChange = nil
    }
}
