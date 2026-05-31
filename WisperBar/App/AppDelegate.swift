// AppDelegate.swift
import AppKit
import ServiceManagement
import SwiftUI

final class AppDelegate: NSObject, NSApplicationDelegate {

    private var statusItem:   NSStatusItem?
    private var popover:      NSPopover?
    private var hotKeyManager: HotKeyManager?

    let speechRecognizer = SpeechRecognizer()

    private var overlayPanel: NSPanel!
    private var overlayView:  PremiumWaveformView!
    private var displayTimer: Timer?

    // MARK: – Lifecycle

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        registerLaunchAtLogin()
        setupStatusItem()
        setupPopover()
        setupHotKey()
        setupOverlay()
        registerNotifications()
    }

    // MARK: – Inicio automático con el sistema

    private func registerLaunchAtLogin() {
        guard SMAppService.mainApp.status != .enabled else { return }
        try? SMAppService.mainApp.register()
    }

    // MARK: – Status item

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        guard let btn = statusItem?.button else { return }
        let img = NSImage(systemSymbolName: "waveform.and.mic", accessibilityDescription: "WisperBar")
        img?.isTemplate = true
        btn.image  = img
        btn.action = #selector(handleStatusItemClick)
        btn.target = self
        btn.sendAction(on: [.leftMouseUp, .rightMouseUp])
    }

    // MARK: – Popover

    private func setupPopover() {
        let pop = NSPopover()
        pop.contentViewController = NSHostingController(
            rootView: PopoverView().environmentObject(speechRecognizer)
        )
        pop.contentSize = NSSize(width: 400, height: 520)
        pop.behavior    = .transient
        pop.animates    = true
        popover = pop
    }

    // MARK: – HotKey

    private func setupHotKey() {
        hotKeyManager = HotKeyManager()
        hotKeyManager?.register { [weak self] pressed in
            DispatchQueue.main.async { self?.handleHotKey(pressed: pressed) }
        }
    }

    /// Push-to-Talk: rechte Wahltaste gedrückt = aufnehmen, losgelassen = stoppen.
    /// Kein Popover öffnen → Fokus bleibt im Zieltextfeld, damit Cmd+V dort einfügt.
    private func handleHotKey(pressed: Bool) {
        if pressed {
            if !speechRecognizer.recordingState.isRecording {
                speechRecognizer.startRecording()  // Overlay via .wbRecordingStarted
            }
        } else {
            if speechRecognizer.recordingState.isRecording {
                speechRecognizer.stopRecording()   // Overlay via .wbRecordingStopped
            }
        }
    }

    // MARK: – Overlay premium

    private func setupOverlay() {
        let W: CGFloat = 340, H: CGFloat = 60
        let vf = NSScreen.main?.visibleFrame ?? CGRect(x: 0, y: 80, width: 1440, height: 900)

        let panel = NSPanel(
            contentRect: CGRect(x: vf.midX - W / 2, y: vf.minY + 24, width: W, height: H),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        panel.level               = NSWindow.Level(rawValue: 20)
        panel.isOpaque            = false
        panel.backgroundColor     = .clear
        panel.hasShadow           = true
        panel.ignoresMouseEvents  = true
        panel.isReleasedWhenClosed = false
        panel.hidesOnDeactivate   = false
        panel.collectionBehavior  = [.canJoinAllSpaces, .stationary,
                                     .ignoresCycle, .fullScreenAuxiliary]

        let view = PremiumWaveformView(frame: CGRect(x: 0, y: 0, width: W, height: H))
        panel.contentView = view

        overlayPanel = panel
        overlayView  = view

        // Timer solo para animación de barras (60fps)
        let t = Timer(timeInterval: 1.0 / 60.0, repeats: true) { [self] _ in
            overlayView?.targetLevels = speechRecognizer.audioLevels
            overlayView?.tick()
        }
        RunLoop.main.add(t, forMode: .common)
        displayTimer = t
    }

    // MARK: – Show / hide overlay

    func showOverlay() {
        overlayPanel.orderFrontRegardless()
    }

    func hideOverlay() {
        overlayPanel.orderOut(nil)
    }

    // MARK: – Notificaciones

    private func registerNotifications() {
        NotificationCenter.default.addObserver(
            self, selector: #selector(closePopover),
            name: .wbClosePopover, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(handleRecordingStarted),
            name: .wbRecordingStarted, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(handleRecordingStopped),
            name: .wbRecordingStopped, object: nil
        )
    }

    @objc private func handleRecordingStarted() {
        overlayPanel.orderFrontRegardless()
    }

    @objc private func handleRecordingStopped() {
        overlayPanel.orderOut(nil)
    }

    // MARK: – Acciones

    @objc private func handleStatusItemClick(_ sender: NSStatusBarButton) {
        if NSApp.currentEvent?.type == .rightMouseUp {
            showContextMenu()
        } else {
            togglePopover()
        }
    }

    private func showContextMenu() {
        let menu = NSMenu()
        let rec  = speechRecognizer.recordingState == .recording
        menu.addItem(withTitle: rec ? "Aufnahme stoppen" : "Aufnahme starten",
                     action: #selector(toggleRecordingFromMenu), keyEquivalent: "")
        menu.addItem(.separator())
        menu.addItem(withTitle: "Beenden",
                     action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        statusItem?.menu = menu
        statusItem?.button?.performClick(nil)
        DispatchQueue.main.async { self.statusItem?.menu = nil }
    }

    @objc private func toggleRecordingFromMenu() {
        if speechRecognizer.recordingState.isRecording {
            speechRecognizer.toggle()
            overlayPanel.orderOut(nil)
        } else {
            speechRecognizer.toggle()
            overlayPanel.orderFrontRegardless()
        }
    }

    func togglePopover() {
        guard let button = statusItem?.button else { return }
        if let pop = popover, pop.isShown {
            pop.performClose(nil)
        } else {
            popover?.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
        }
    }

    private func toggleRecordingWithOverlay() {
        speechRecognizer.toggle()
        // Show/hide via NotificationCenter (.wbRecordingStarted / .wbRecordingStopped)
    }

    @objc private func closePopover() {
        popover?.performClose(nil)
        hideOverlay()
    }
}
