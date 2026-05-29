// FloatingWaveformView.swift
// Overlay de dictado estilo Apple "liquid glass".
// Fondo con blur real (NSVisualEffectView) + barras con degradado Siri
// que reaccionan en altura (volumen) y color/brillo (intensidad/tono).
import AppKit

final class PremiumWaveformView: NSView {

    /// Niveles RMS por banda, escritos por AppDelegate a 60fps.
    var targetLevels: [Float] = Array(repeating: 0, count: 32) {
        didSet { bars.targetLevels = targetLevels }
    }

    private let glass = NSVisualEffectView()
    private let bars  = WaveBarsView()

    override init(frame: NSRect) {
        super.init(frame: frame)
        wantsLayer = true
        setupGlass()
        setupBars()
    }
    required init?(coder: NSCoder) { fatalError() }

    // MARK: – Capa de cristal (blur translúcido + borde sutil)

    private func setupGlass() {
        glass.material         = .hudWindow
        glass.blendingMode     = .behindWindow
        glass.state            = .active
        glass.wantsLayer       = true
        glass.frame            = bounds
        glass.autoresizingMask = [.width, .height]
        glass.layer?.cornerRadius  = bounds.height / 2
        glass.layer?.masksToBounds = true
        glass.layer?.borderWidth   = 1
        glass.layer?.borderColor   = NSColor(white: 1, alpha: 0.16).cgColor
        addSubview(glass)
    }

    // MARK: – Capa de barras (dibujo encima del cristal)

    private func setupBars() {
        bars.frame            = bounds
        bars.autoresizingMask = [.width, .height]
        addSubview(bars)
    }

    /// Llamado por AppDelegate a 60fps.
    func tick() { bars.tick() }

    override func layout() {
        super.layout()
        glass.layer?.cornerRadius = bounds.height / 2
    }

    override var isOpaque: Bool { false }
}

// MARK: – Barras animadas

private final class WaveBarsView: NSView {

    var targetLevels: [Float] = Array(repeating: 0, count: 32)

    private let n = 36
    private let barW: CGFloat = 3
    private let gap:  CGFloat = 4
    private var heights: [CGFloat]
    private var dotPulse: CGFloat = 0   // intensidad media suavizada → pulso del punto
    private var phase:    CGFloat = 0   // animación idle "respirando"

    override init(frame: NSRect) {
        heights = Array(repeating: 2, count: n)
        super.init(frame: frame)
        wantsLayer = true
    }
    required init?(coder: NSCoder) { fatalError() }

    // MARK: – Física: lerp con ataque rápido / caída lenta

    func tick() {
        let maxH  = bounds.height * 0.62
        let count = targetLevels.count
        var avg: CGFloat = 0

        phase += 0.09
        for i in 0..<n {
            let lv  = level(at: i, count: count)
            avg    += lv
            // Línea base viva incluso en silencio (respiración suave).
            let idle   = (sin(phase + CGFloat(i) * 0.45) + 1) * 1.4
            let target = max(2 + idle, lv * maxH)
            let up     = target > heights[i]
            heights[i] += (target - heights[i]) * (up ? 0.45 : 0.16)
        }
        avg /= CGFloat(n)
        dotPulse += (avg - dotPulse) * 0.2
        setNeedsDisplay(bounds)
    }

    /// Nivel interpolado para la banda `i` (mapea 36 barras sobre 32 niveles).
    private func level(at i: Int, count: Int) -> CGFloat {
        guard count > 0 else { return 0 }
        let src = Int(CGFloat(i) / CGFloat(n) * CGFloat(count))
        return CGFloat(targetLevels[min(src, count - 1)])
    }

    // MARK: – Render

    override func draw(_ dirtyRect: NSRect) {
        guard let ctx = NSGraphicsContext.current?.cgContext else { return }
        let count = targetLevels.count

        // Punto de grabación con halo que pulsa según el volumen.
        let dotR    = 5 + dotPulse * 3.5
        let dotRect = CGRect(x: 24 - dotR, y: bounds.midY - dotR, width: dotR * 2, height: dotR * 2)
        ctx.saveGState()
        ctx.setShadow(offset: .zero,
                      blur: 8 + dotPulse * 12,
                      color: NSColor.systemRed.withAlphaComponent(0.85).cgColor)
        NSColor.systemRed.withAlphaComponent(0.95).setFill()
        NSBezierPath(ovalIn: dotRect).fill()
        ctx.restoreGState()

        // Geometría de las barras, centradas en el espacio restante.
        let leftInset:  CGFloat = 48
        let rightInset: CGFloat = 20
        let totalW = CGFloat(n) * barW + CGFloat(n - 1) * gap
        let startX = leftInset + (bounds.width - leftInset - rightInset - totalW) / 2

        // Glow general teñido por la intensidad (tono más cálido al gritar).
        ctx.setShadow(offset: .zero,
                      blur: 6 + dotPulse * 8,
                      color: siriColor(at: 0.6, intensity: dotPulse).withAlphaComponent(0.6).cgColor)

        for i in 0..<n {
            let h = heights[i]
            let x = startX + CGFloat(i) * (barW + gap)
            let y = (bounds.height - h) / 2
            let path = NSBezierPath(
                roundedRect: CGRect(x: x, y: y, width: barW, height: h),
                xRadius: barW / 2, yRadius: barW / 2
            )
            let t  = CGFloat(i) / CGFloat(n - 1)
            let lv = level(at: i, count: count)
            siriColor(at: t, intensity: lv).setFill()
            path.fill()
        }
    }

    // MARK: – Color Siri (azul → púrpura → rosa), brillo por intensidad

    private func siriColor(at t: CGFloat, intensity: CGFloat) -> NSColor {
        let blue   = NSColor(srgbRed: 0.30, green: 0.68, blue: 1.00, alpha: 1)
        let purple = NSColor(srgbRed: 0.62, green: 0.40, blue: 1.00, alpha: 1)
        let pink   = NSColor(srgbRed: 1.00, green: 0.42, blue: 0.72, alpha: 1)
        let base = t < 0.5 ? lerp(blue, purple, t * 2)
                           : lerp(purple, pink, (t - 0.5) * 2)
        return base.withAlphaComponent(0.40 + intensity * 0.60)
    }

    private func lerp(_ a: NSColor, _ b: NSColor, _ t: CGFloat) -> NSColor {
        NSColor(srgbRed: a.redComponent   + (b.redComponent   - a.redComponent)   * t,
                green:   a.greenComponent + (b.greenComponent - a.greenComponent) * t,
                blue:    a.blueComponent  + (b.blueComponent  - a.blueComponent)  * t,
                alpha: 1)
    }

    override var isOpaque: Bool { false }
}
