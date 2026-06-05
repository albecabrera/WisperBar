import objc
from AppKit import (
    NSWindow, NSView, NSTextField, NSButton, NSPopUpButton,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable,
    NSWindowStyleMaskResizable, NSBackingStoreBuffered,
    NSColor, NSFont, NSMakeRect,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
)
from workflows import WORKFLOWS

PANEL_W, PANEL_H = 460, 540


class ConfigPanel:

    def __init__(self, cfg: dict, ollama_service, on_save):
        self._cfg    = cfg
        self._ollama = ollama_service
        self._on_save = on_save
        self._win    = None
        self._refs   = {}

    def show(self, models: list[str]):
        if self._win and not self._win.isVisible():
            self._win = None

        if self._win is None:
            self._build(models)

        self._win.makeKeyAndOrderFront_(None)
        self._win.orderFrontRegardless()

    def _build(self, models: list[str]):
        style = (NSWindowStyleMaskTitled |
                 NSWindowStyleMaskClosable |
                 NSWindowStyleMaskResizable)
        win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            ((200, 200), (PANEL_W, PANEL_H)),
            style,
            NSBackingStoreBuffered,
            False,
        )
        win.setTitle_("WisperBar — Configuración")
        win.setReleasedWhenClosed_(False)
        win.setCollectionBehavior_(NSWindowCollectionBehaviorCanJoinAllSpaces)
        win.setBackgroundColor_(NSColor.windowBackgroundColor())

        cv = win.contentView()
        y  = PANEL_H - 30

        def label(text, x, lw, bold=False):
            nonlocal y
            f = NSTextField.labelWithString_(text)
            f.setFrame_(NSMakeRect(x, y - 4, lw, 22))
            if bold:
                f.setFont_(NSFont.boldSystemFontOfSize_(13))
            cv.addSubview_(f)

        def section(title):
            nonlocal y
            y -= 30
            label(title, 20, PANEL_W - 40, bold=True)
            y -= 4

        def row_label(text):
            label(text, 20, 160)

        def popup(x, pw, items, selected, key):
            nonlocal y
            btn = NSPopUpButton.alloc().initWithFrame_pullsDown_(
                NSMakeRect(x, y - 2, pw, 26), False
            )
            for it in items:
                btn.addItemWithTitle_(it)
            if selected in items:
                btn.selectItemWithTitle_(selected)
            elif items:
                btn.selectItemAtIndex_(0)
            cv.addSubview_(btn)
            self._refs[key] = btn
            return btn

        def text_field(x, tw, placeholder, value, key):
            nonlocal y
            f = NSTextField.alloc().initWithFrame_(NSMakeRect(x, y - 2, tw, 24))
            f.setPlaceholderString_(placeholder)
            f.setStringValue_(value or "")
            cv.addSubview_(f)
            self._refs[key] = f
            return f

        # ── Sección Ollama ────────────────────────────────────────────────────
        section("Ollama")
        y -= 26

        row_label("Modelo:")
        model_items = models if models else [self._cfg.get("ollama_model", "") or "—"]
        current_model = self._cfg.get("ollama_model", "")
        popup(190, 240, model_items, current_model, "ollama_model")
        y -= 32

        row_label("URL:")
        text_field(190, 240, "http://localhost:11434",
                   self._cfg.get("ollama_url", "http://localhost:11434"), "ollama_url")
        y -= 32

        row_label("Timeout (s):")
        text_field(190, 80, "60",
                   str(self._cfg.get("ollama_timeout", 60)), "ollama_timeout")
        y -= 36

        # ── Sección Workflows ─────────────────────────────────────────────────
        section("Workflow por defecto")
        y -= 26

        row_label("Workflow:")
        wf_ids    = [wf.id for wf in WORKFLOWS]
        wf_labels = [f"{wf.icon}  {wf.label_es}" for wf in WORKFLOWS]
        current_wf_label = next(
            (f"{wf.icon}  {wf.label_es}" for wf in WORKFLOWS
             if wf.id == self._cfg.get("workflow", "transcribir")),
            wf_labels[0]
        )
        popup(190, 240, wf_labels, current_wf_label, "workflow_label")
        self._refs["_wf_ids"]    = wf_ids
        self._refs["_wf_labels"] = wf_labels
        y -= 32

        row_label("Densidad emoji:")
        popup(190, 160, ["poca", "media", "mucha"],
              self._cfg.get("emoji_density", "media"), "emoji_density")
        y -= 36

        # ── Sección Vocabulario ───────────────────────────────────────────────
        section("Vocabulario personalizado")
        y -= 4
        hint = NSTextField.labelWithString_(
            "Términos separados por comas (p. ej. Kubernetes, WisperBar, MLX)"
        )
        hint.setFrame_(NSMakeRect(20, y - 18, PANEL_W - 40, 18))
        hint.setTextColor_(NSColor.secondaryLabelColor())
        hint.setFont_(NSFont.systemFontOfSize_(11))
        cv.addSubview_(hint)
        y -= 30

        terms_str = ", ".join(self._cfg.get("user_terms", []))
        text_field(20, PANEL_W - 40, "Ej: Kubernetes, WisperBar, MLX",
                   terms_str, "user_terms_str")
        y -= 42

        # ── Botones ───────────────────────────────────────────────────────────
        btn_cancel = NSButton.alloc().initWithFrame_(
            NSMakeRect(PANEL_W - 200, 16, 90, 30)
        )
        btn_cancel.setTitle_("Cancelar")
        btn_cancel.setTarget_(win)
        btn_cancel.setAction_("performClose:")
        cv.addSubview_(btn_cancel)

        btn_save = NSButton.alloc().initWithFrame_(
            NSMakeRect(PANEL_W - 100, 16, 84, 30)
        )
        btn_save.setTitle_("Guardar")
        btn_save.setBezelStyle_(1)  # NSBezelStyleRounded
        btn_save.setKeyEquivalent_("\r")
        cv.addSubview_(btn_save)
        self._refs["_btn_save"] = btn_save

        self._win = win
        self._setup_save_action(btn_save)

    def _setup_save_action(self, btn):
        panel_ref = self

        class SaveDelegate(objc.lookUpClass("NSObject")):
            @objc.python_method
            def save_action(self):
                panel_ref._collect_and_save()

        delegate = SaveDelegate.alloc().init()
        self._refs["_delegate"] = delegate
        btn.setTarget_(delegate)
        btn.setAction_(objc.selector(
            delegate.save_action,
            selector=b"save_action",
            signature=b"v@:",
        ))

    def _collect_and_save(self):
        refs = self._refs

        # Modelo Ollama
        model_popup = refs.get("ollama_model")
        if model_popup:
            self._cfg["ollama_model"] = model_popup.titleOfSelectedItem() or ""

        # URL
        url_field = refs.get("ollama_url")
        if url_field:
            val = url_field.stringValue().strip()
            if val:
                self._cfg["ollama_url"] = val

        # Timeout
        timeout_field = refs.get("ollama_timeout")
        if timeout_field:
            try:
                self._cfg["ollama_timeout"] = int(timeout_field.stringValue())
            except ValueError:
                pass

        # Workflow
        wf_popup = refs.get("workflow_label")
        wf_ids   = refs.get("_wf_ids", [])
        wf_labels = refs.get("_wf_labels", [])
        if wf_popup and wf_ids:
            sel = wf_popup.titleOfSelectedItem() or ""
            if sel in wf_labels:
                self._cfg["workflow"] = wf_ids[wf_labels.index(sel)]

        # Emoji density
        emoji_popup = refs.get("emoji_density")
        if emoji_popup:
            self._cfg["emoji_density"] = emoji_popup.titleOfSelectedItem() or "media"

        # User terms
        terms_field = refs.get("user_terms_str")
        if terms_field:
            raw = terms_field.stringValue()
            self._cfg["user_terms"] = [
                t.strip() for t in raw.split(",") if t.strip()
            ]

        self._on_save(self._cfg)
        if self._win:
            self._win.performClose_(None)
