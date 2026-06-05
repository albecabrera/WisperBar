from pathlib import Path
import ctypes
import subprocess
import threading
import objc
from AppKit import (
    NSWindow, NSView, NSScrollView, NSTextField, NSTextView, NSButton,
    NSPopUpButton, NSSegmentedControl, NSTabView, NSTabViewItem,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable,
    NSWindowStyleMaskResizable, NSBackingStoreBuffered,
    NSColor, NSFont, NSMakeRect, NSApplication,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
    NSObject,
)
from i18n import t
from workflows import WORKFLOWS

PANEL_W   = 520
PANEL_H   = 700
TAB_H     = PANEL_H - 80
CONTENT_H = 1100   # scroll height for tab 1

WHISPER_MODELS = [
    ("Tiny   (~40 MB)",     "mlx-community/whisper-tiny-mlx"),
    ("Base   (~74 MB)",     "mlx-community/whisper-base-mlx"),
    ("Small  (~244 MB)",    "mlx-community/whisper-small-mlx"),
    ("Medium (~769 MB)",    "mlx-community/whisper-medium-mlx"),
    ("Large v3  (~1.5 GB)", "mlx-community/whisper-large-v3-mlx"),
]


def _model_installed(repo: str) -> bool:
    cache  = Path.home() / ".cache" / "huggingface" / "hub"
    folder = "models--" + repo.replace("/", "--")
    snaps  = cache / folder / "snapshots"
    try:
        return snaps.exists() and any(snaps.iterdir())
    except Exception:
        return False


# ── Generic action target — defined ONCE at module level ─────────────────────
# Using anonymous inner classes causes ObjC class re-registration crashes.
# One module-level class, many instances, each with its own _fn.

class _Btn(NSObject):
    @objc.python_method
    def bind(self, fn):
        self._fn = fn
        return self

    def fire_(self, sender):
        try:
            self._fn()
        except Exception as exc:
            print(f"[ConfigPanel] {exc}", flush=True)


# ── Layout helpers ─────────────────────────────────────────────────────────────

def _lbl(parent, text, x, y, w, h=18, bold=False, small=False, secondary=False, wrap=False):
    f = NSTextField.labelWithString_(text)
    f.setFrame_(NSMakeRect(x, y, w, h))
    size = 11 if small else 13
    if bold:
        f.setFont_(NSFont.boldSystemFontOfSize_(size))
    elif small:
        f.setFont_(NSFont.systemFontOfSize_(size))
    if secondary:
        f.setTextColor_(NSColor.secondaryLabelColor())
    if wrap:
        f.setLineBreakMode_(0)
        f.setMaximumNumberOfLines_(3)
    parent.addSubview_(f)
    return f


def _sec(parent, text, y, w):
    lbl = NSTextField.labelWithString_(text)
    lbl.setFrame_(NSMakeRect(20, y, w - 40, 16))
    lbl.setFont_(NSFont.boldSystemFontOfSize_(9))
    lbl.setTextColor_(NSColor.tertiaryLabelColor())
    parent.addSubview_(lbl)
    return lbl


def _field(parent, x, y, w, placeholder, value, key, refs):
    f = NSTextField.alloc().initWithFrame_(NSMakeRect(x, y, w, 24))
    f.setPlaceholderString_(placeholder)
    f.setStringValue_(value or "")
    f.setFont_(NSFont.systemFontOfSize_(12))
    parent.addSubview_(f)
    refs[key] = f
    return f


def _popup(parent, x, y, w, items, selected, key, refs):
    btn = NSPopUpButton.alloc().initWithFrame_pullsDown_(NSMakeRect(x, y, w, 26), False)
    for it in items:
        btn.addItemWithTitle_(it)
    if selected in items:
        btn.selectItemWithTitle_(selected)
    elif items:
        btn.selectItemAtIndex_(0)
    parent.addSubview_(btn)
    refs[key] = btn
    return btn


def _seg(parent, x, y, w, items, idx, key, refs):
    ctrl = NSSegmentedControl.alloc().initWithFrame_(NSMakeRect(x, y, w, 26))
    ctrl.setSegmentCount_(len(items))
    for i, lbl in enumerate(items):
        ctrl.setLabel_forSegment_(lbl, i)
    ctrl.setSelectedSegment_(idx)
    ctrl.setSegmentStyle_(1)
    parent.addSubview_(ctrl)
    refs[key] = ctrl
    return ctrl


def _btn(parent, x, y, w, h, title, key, refs, action=None):
    b = NSButton.alloc().initWithFrame_(NSMakeRect(x, y, w, h))
    b.setTitle_(title)
    b.setBezelStyle_(4)
    parent.addSubview_(b)
    refs[key] = b
    if action:
        tgt = _Btn.alloc().init().bind(action)
        b.setTarget_(tgt)
        b.setAction_(b"fire:")
        b._tgt = tgt
    return b


def _link_btn(parent, x, y, w, title, url):
    b = NSButton.alloc().initWithFrame_(NSMakeRect(x, y, w, 18))
    b.setTitle_(title)
    b.setBezelStyle_(0)
    b.setBordered_(False)
    b.setFont_(NSFont.systemFontOfSize_(10.5))
    try:
        b.setContentTintColor_(NSColor.linkColor())
    except Exception:
        pass
    tgt = _Btn.alloc().init().bind(lambda u=url: subprocess.run(["open", u]))
    b.setTarget_(tgt)
    b.setAction_(b"fire:")
    b._tgt = tgt
    parent.addSubview_(b)
    return b


def _scroll(content, frame):
    sv = NSScrollView.alloc().initWithFrame_(frame)
    sv.setHasVerticalScroller_(True)
    sv.setHasHorizontalScroller_(False)
    sv.setAutohidesScrollers_(True)
    sv.setDocumentView_(content)
    return sv


# ── ConfigPanel ────────────────────────────────────────────────────────────────

class ConfigPanel:

    def __init__(self, cfg, ollama_service, on_save, lang_fn):
        self._cfg     = cfg
        self._ollama  = ollama_service
        self._on_save = on_save
        self._lang_fn = lang_fn
        self._win     = None
        self._refs    = {}
        self._terms: list[str] = list(cfg.get("user_terms", []))
        self._chips_view: NSView | None = None
        self._chips_scroll: NSScrollView | None = None

    @property
    def _lg(self) -> str:
        lg = self._lang_fn()
        return lg if lg != "auto" else "es"

    # ── Public ────────────────────────────────────────────────────────────────

    def show(self, models: list[str]):
        if self._win is None or not self._win.isVisible():
            self._win  = None
            self._refs = {}
            self._terms = list(self._cfg.get("user_terms", []))
            self._chips_view   = None
            self._chips_scroll = None
            self._build(models)
        NSApplication.sharedApplication().activateIgnoringOtherApps_(True)
        self._win.makeKeyAndOrderFront_(None)
        self._win.orderFrontRegardless()

    # ── Build window ──────────────────────────────────────────────────────────

    def _build(self, models: list[str]):
        lg    = self._lg
        style = NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable
        win   = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            ((200, 100), (PANEL_W, PANEL_H)), style, NSBackingStoreBuffered, False,
        )
        win.setTitle_(t("config_title", lg))
        win.setReleasedWhenClosed_(False)
        win.setMinSize_((PANEL_W, 500))

        cv = win.contentView()

        # Tab view
        tv = NSTabView.alloc().initWithFrame_(NSMakeRect(0, 48, PANEL_W, PANEL_H - 48))
        i1 = NSTabViewItem.alloc().init()
        i1.setLabel_(t("tab_customize", lg))
        i1.setView_(self._tab_customize(lg))
        i2 = NSTabViewItem.alloc().init()
        i2.setLabel_(t("tab_access", lg))
        i2.setView_(self._tab_access(lg, models))
        tv.addTabViewItem_(i1)
        tv.addTabViewItem_(i2)
        cv.addSubview_(tv)

        # Cancel
        bc = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 210, 10, 96, 30))
        bc.setTitle_(t("btn_cancel", lg))
        bc.setBezelStyle_(1)
        bc.setTarget_(win)
        bc.setAction_(b"performClose:")
        cv.addSubview_(bc)

        # Save
        bs = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 108, 10, 92, 30))
        bs.setTitle_(t("btn_save", lg))
        bs.setBezelStyle_(1)
        bs.setKeyEquivalent_("\r")
        tgt = _Btn.alloc().init().bind(lambda w=win: (self._collect(), w.performClose_(None)))
        bs.setTarget_(tgt)
        bs.setAction_(b"fire:")
        bs._tgt = tgt
        cv.addSubview_(bs)

        self._win = win

    # ── Tab 1: Personalizar ───────────────────────────────────────────────────

    def _tab_customize(self, lg: str) -> NSView:
        cw      = PANEL_W - 24
        content = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, cw, CONTENT_H))
        y       = CONTENT_H - 16   # top → bottom layout

        def gap(n=10): nonlocal y; y -= n
        def sec(key):
            nonlocal y; y -= 26
            _sec(content, t(key, lg), y, cw)
            y -= 6

        # ── Modelo local Whisper ──────────────────────────────────────────────
        sec("sec_local_model")

        cur_wm       = self._cfg.get("whisper_model", "mlx-community/whisper-large-v3-mlx")
        wm_labels    = [lbl for lbl, _ in WHISPER_MODELS]
        wm_repos     = [repo for _, repo in WHISPER_MODELS]
        cur_wm_label = next((l for l, r in WHISPER_MODELS if r == cur_wm), wm_labels[-1])

        y -= 28
        _lbl(content, t("lbl_whisper_model", lg), 20, y + 4, 110)
        _popup(content, 136, y, 280, wm_labels, cur_wm_label, "wm_popup", self._refs)
        self._refs["_wm_labels"] = wm_labels
        self._refs["_wm_repos"]  = wm_repos

        y -= 22
        installed = _model_installed(cur_wm)
        st_txt = t("model_installed" if installed else "model_not_downloaded", lg)
        st = _lbl(content, st_txt, 136, y, cw - 156, small=True)
        st.setTextColor_(NSColor.systemGreenColor() if installed else NSColor.systemOrangeColor())

        y -= 20
        _link_btn(content, 136, y, 300,
                  t("link_model_page", lg),
                  f"https://huggingface.co/{cur_wm}")

        gap(22)

        # ── Atajo de teclado ──────────────────────────────────────────────────
        sec("sec_hotkey")

        mode = self._cfg.get("hotkey_mode", "hold")
        y -= 28
        _lbl(content, t("hotkey_mode", lg), 20, y + 4, 110)
        _seg(content, 136, y, 220,
             [t("hotkey_hold", lg), t("hotkey_toggle", lg)],
             0 if mode == "hold" else 1, "hotkey_mode_seg", self._refs)

        y -= 22
        desc_text = t("hotkey_hold_desc" if mode == "hold" else "hotkey_toggle_desc", lg)
        _lbl(content, desc_text, 136, y, cw - 156, small=True, secondary=True)

        y -= 28
        _lbl(content, t("hotkeys_header", lg), 20, y, cw - 40, small=True, secondary=True)
        for wf in WORKFLOWS:
            y -= 20
            name = getattr(wf, f"label_{lg}", wf.label_en)
            _lbl(content, f"{wf.icon}  {name}", 32, y, 200, small=True)
            _lbl(content, wf.hotkey_label, 250, y, 120, small=True, secondary=True)

        gap(22)

        # ── Workflow predeterminado ───────────────────────────────────────────
        sec("sec_workflow")

        wf_ids    = [wf.id for wf in WORKFLOWS]
        wf_labels = [f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}" for wf in WORKFLOWS]
        cur_wf_lbl = next(
            (f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}"
             for wf in WORKFLOWS if wf.id == self._cfg.get("workflow", "transcribir")),
            wf_labels[0],
        )
        y -= 28
        _lbl(content, t("lbl_default", lg), 20, y + 4, 110)
        _popup(content, 136, y, 280, wf_labels, cur_wf_lbl, "wf_popup", self._refs)
        self._refs["_wf_ids"]    = wf_ids
        self._refs["_wf_labels"] = wf_labels

        gap(22)

        # ── Mejora de texto ───────────────────────────────────────────────────
        sec("sec_improve")

        tone_vals = ["formal", "neutral", "casual"]
        tone_opts = [t(f"tone_{v}", lg) for v in tone_vals]
        cur_tone  = self._cfg.get("tone_mejorar", "neutral")
        y -= 28
        _lbl(content, t("lbl_tone", lg), 20, y + 4, 110)
        _seg(content, 136, y, 240, tone_opts,
             tone_vals.index(cur_tone) if cur_tone in tone_vals else 1,
             "tone_seg", self._refs)
        self._refs["_tone_vals"] = tone_vals

        y -= 30
        _lbl(content, t("lbl_custom_prompt", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _field(content, 20, y, cw - 40,
               t("ph_custom_prompt", lg),
               self._cfg.get("custom_prompt_mejorar", ""),
               "custom_prompt_mejorar", self._refs)

        y -= 30
        _lbl(content, t("lbl_context", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _field(content, 20, y, cw - 40,
               t("ph_context", lg),
               self._cfg.get("context_mejorar", ""),
               "context_mejorar", self._refs)

        gap(22)

        # ── Desahogo ──────────────────────────────────────────────────────────
        sec("sec_desahogo")

        y -= 30
        _lbl(content, t("lbl_desahogo_prompt", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _field(content, 20, y, cw - 40,
               t("ph_desahogo_prompt", lg),
               self._cfg.get("custom_prompt_desahogo", ""),
               "custom_prompt_desahogo", self._refs)

        gap(22)

        # ── Emoji ─────────────────────────────────────────────────────────────
        sec("sec_emoji")

        density_vals = ["poca", "media", "mucha"]
        density_opts = [t(f"density_{["low","mid","high"][i]}", lg) for i in range(3)]
        cur_density  = self._cfg.get("emoji_density", "media")
        y -= 28
        _lbl(content, t("lbl_density", lg), 20, y + 4, 110)
        _seg(content, 136, y, 240, density_opts,
             density_vals.index(cur_density) if cur_density in density_vals else 1,
             "density_seg", self._refs)
        self._refs["_density_vals"] = density_vals

        gap(22)

        # ── Vocabulario personalizado ─────────────────────────────────────────
        sec("sec_terms")

        y -= 22
        _lbl(content, t("terms_hint", lg), 20, y - 10, cw - 40, h=32,
             small=True, secondary=True, wrap=True)
        y -= 42

        # Terms list — chips rendered as simple buttons
        chips_h = max(len(self._terms) * 28 + 12, 40)
        chips_frame = NSMakeRect(20, y - chips_h, cw - 40, chips_h)
        self._chips_view = NSView.alloc().initWithFrame_(chips_frame)
        self._chips_view.setWantsLayer_(True)
        layer = self._chips_view.layer()
        if layer:
            layer.setCornerRadius_(6.0)
            layer.setBackgroundColor_(NSColor.quaternaryLabelColor().CGColor())
        content.addSubview_(self._chips_view)
        self._render_chips(lg)
        y -= chips_h + 4

        # Add term row
        y -= 30
        new_term_field = _field(content, 20, y, cw - 110,
                                t("ph_new_term", lg), "", "new_term", self._refs)
        _btn(content, cw - 84, y, 70, 26, t("btn_add", lg), "btn_add", self._refs,
             action=lambda: self._add_term(lg))

        gap(20)
        return _scroll(content, NSMakeRect(0, 0, PANEL_W - 24, TAB_H))

    # ── Tab 2: Acceso ─────────────────────────────────────────────────────────

    def _tab_access(self, lg: str, models: list[str]) -> NSView:
        cw  = PANEL_W - 24
        tab = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, cw, TAB_H))
        y   = TAB_H - 16

        def gap(n=10): nonlocal y; y -= n
        def sec(key):
            nonlocal y; y -= 26
            _sec(tab, t(key, lg), y, cw)
            y -= 6

        # ── Ollama ────────────────────────────────────────────────────────────
        sec("sec_ollama")

        model_items = models if models else [self._cfg.get("ollama_model", "") or "—"]
        cur_model   = self._cfg.get("ollama_model", "")

        y -= 28
        _lbl(tab, t("lbl_model", lg), 20, y + 4, 110)
        _popup(tab, 136, y, 240, model_items, cur_model, "ollama_model", self._refs)
        _btn(tab, cw - 106, y - 2, 88, 28, t("btn_refresh", lg), "btn_refresh", self._refs,
             action=self._refresh_models)

        y -= 34
        _lbl(tab, t("lbl_url", lg), 20, y + 4, 110)
        _field(tab, 136, y, cw - 156,
               "http://localhost:11434",
               self._cfg.get("ollama_url", "http://localhost:11434"),
               "ollama_url", self._refs)

        y -= 34
        _lbl(tab, t("lbl_timeout", lg), 20, y + 4, 110)
        _field(tab, 136, y, 80, "60",
               str(self._cfg.get("ollama_timeout", 60)),
               "ollama_timeout", self._refs)

        gap(30)

        # ── Permisos ──────────────────────────────────────────────────────────
        sec("sec_perms")

        ok = self._ax_ok()
        y -= 28
        pf = _lbl(tab, t("perm_ok" if ok else "perm_missing", lg), 20, y, cw - 40)
        pf.setTextColor_(NSColor.systemGreenColor() if ok else NSColor.systemOrangeColor())

        if not ok:
            y -= 24
            _lbl(tab, t("perm_detail", lg), 20, y - 18, cw - 40, h=40,
                 small=True, secondary=True, wrap=True)
            y -= 56
            b = NSButton.alloc().initWithFrame_(NSMakeRect(20, y, 220, 28))
            b.setTitle_(t("btn_open_acc", lg))
            b.setBezelStyle_(4)
            tgt = _Btn.alloc().init().bind(lambda: subprocess.run([
                "open",
                "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
            ]))
            b.setTarget_(tgt)
            b.setAction_(b"fire:")
            b._tgt = tgt
            tab.addSubview_(b)

        return tab

    # ── Chips ─────────────────────────────────────────────────────────────────

    def _render_chips(self, lg: str):
        if self._chips_view is None:
            return
        for sv in list(self._chips_view.subviews()):
            sv.removeFromSuperview()

        chips_w = self._chips_view.frame().size.width
        x, cy   = 8.0, 8.0
        for term in self._terms:
            chip_w  = min(len(term) * 7.5 + 36, chips_w - 16)
            b = NSButton.alloc().initWithFrame_(NSMakeRect(x, cy, chip_w, 22))
            b.setTitle_(f"{term}  ×")
            b.setFont_(NSFont.systemFontOfSize_(11))
            b.setBezelStyle_(4)
            tgt = _Btn.alloc().init().bind(lambda term_=term, lg_=lg: self._remove_term(term_, lg_))
            b.setTarget_(tgt)
            b.setAction_(b"fire:")
            b._tgt = tgt
            self._chips_view.addSubview_(b)
            x += chip_w + 6
            if x + 80 > chips_w:
                x   = 8.0
                cy += 28

    def _add_term(self, lg: str):
        field = self._refs.get("new_term")
        if field is None:
            return
        term = field.stringValue().strip()
        if term and term not in self._terms:
            self._terms.append(term)
            self._render_chips(lg)
        field.setStringValue_("")

    def _remove_term(self, term: str, lg: str):
        if term in self._terms:
            self._terms.remove(term)
            self._render_chips(lg)

    # ── Ollama refresh ────────────────────────────────────────────────────────

    def _refresh_models(self):
        def _do():
            models = self._ollama.list_models()
            def _upd():
                popup = self._refs.get("ollama_model")
                if popup and models:
                    popup.removeAllItems()
                    for m in models:
                        popup.addItemWithTitle_(m)
                    cur = self._cfg.get("ollama_model", "")
                    if cur in models:
                        popup.selectItemWithTitle_(cur)
            # run on main thread via a short timer tick — safe
            import rumps
            _upd()  # already on main since called from timer tick; else just update
        threading.Thread(target=_do, daemon=True).start()

    # ── Collect & save ────────────────────────────────────────────────────────

    def _collect(self):
        refs = self._refs
        cfg  = self._cfg

        # Whisper model
        wm_popup  = refs.get("wm_popup")
        wm_labels = refs.get("_wm_labels", [])
        wm_repos  = refs.get("_wm_repos", [])
        if wm_popup and wm_labels and wm_repos:
            sel = wm_popup.titleOfSelectedItem() or ""
            if sel in wm_labels:
                cfg["whisper_model"] = wm_repos[wm_labels.index(sel)]

        # Hotkey mode
        seg = refs.get("hotkey_mode_seg")
        if seg:
            cfg["hotkey_mode"] = "toggle" if seg.selectedSegment() == 1 else "hold"

        # Default workflow
        wf_popup  = refs.get("wf_popup")
        wf_ids    = refs.get("_wf_ids", [])
        wf_labels = refs.get("_wf_labels", [])
        if wf_popup and wf_ids and wf_labels:
            sel = wf_popup.titleOfSelectedItem() or ""
            if sel in wf_labels:
                cfg["workflow"] = wf_ids[wf_labels.index(sel)]

        # Tone
        tone_seg  = refs.get("tone_seg")
        tone_vals = refs.get("_tone_vals", ["formal", "neutral", "casual"])
        if tone_seg:
            idx = tone_seg.selectedSegment()
            if 0 <= idx < len(tone_vals):
                cfg["tone_mejorar"]     = tone_vals[idx]
                cfg["tone_profesional"] = tone_vals[idx]

        # Text fields
        for key in ("custom_prompt_mejorar", "context_mejorar", "custom_prompt_desahogo"):
            f = refs.get(key)
            if f:
                cfg[key] = f.stringValue().strip()

        # Emoji density
        dseg  = refs.get("density_seg")
        dvals = refs.get("_density_vals", ["poca", "media", "mucha"])
        if dseg:
            idx = dseg.selectedSegment()
            if 0 <= idx < len(dvals):
                cfg["emoji_density"] = dvals[idx]

        # Terms
        cfg["user_terms"] = list(self._terms)

        # Ollama model
        mp = refs.get("ollama_model")
        if mp:
            cfg["ollama_model"] = mp.titleOfSelectedItem() or ""

        # Ollama URL
        uf = refs.get("ollama_url")
        if uf:
            v = uf.stringValue().strip()
            if v:
                cfg["ollama_url"] = v

        # Ollama timeout
        tf = refs.get("ollama_timeout")
        if tf:
            try:
                cfg["ollama_timeout"] = int(tf.stringValue())
            except ValueError:
                pass

        self._on_save(cfg)

    # ── Accessibility check ───────────────────────────────────────────────────

    @staticmethod
    def _ax_ok() -> bool:
        try:
            lib = ctypes.cdll.LoadLibrary(
                "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"
            )
            lib.AXIsProcessTrusted.restype = ctypes.c_bool
            return bool(lib.AXIsProcessTrusted())
        except Exception:
            return False
