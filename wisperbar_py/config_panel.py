import ctypes
import subprocess
import threading
import objc
from AppKit import (
    NSWindow, NSView, NSScrollView, NSTextField, NSButton,
    NSPopUpButton, NSSegmentedControl, NSTabView, NSTabViewItem,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable,
    NSWindowStyleMaskResizable, NSBackingStoreBuffered,
    NSColor, NSFont, NSMakeRect, NSRect,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
    NSClipView,
)
from i18n import t
from workflows import WORKFLOWS

PANEL_W = 500
PANEL_H = 620
TAB_H   = PANEL_H - 100  # height available for tab content


# ── Helpers ───────────────────────────────────────────────────────────────────

def _label(parent, text: str, x, y, w, bold=False, small=False, secondary=False):
    f = NSTextField.labelWithString_(text)
    size = 11 if small else 13
    f.setFrame_(NSMakeRect(x, y, w, 20))
    if bold:
        f.setFont_(NSFont.boldSystemFontOfSize_(size))
    elif small:
        f.setFont_(NSFont.systemFontOfSize_(size))
    if secondary:
        f.setTextColor_(NSColor.secondaryLabelColor())
    parent.addSubview_(f)
    return f


def _section_label(parent, text: str, y: float, w: float):
    f = NSTextField.labelWithString_(text)
    f.setFrame_(NSMakeRect(20, y, w - 40, 18))
    f.setFont_(NSFont.boldSystemFontOfSize_(10))
    f.setTextColor_(NSColor.secondaryLabelColor())
    parent.addSubview_(f)
    return f


def _text_field(parent, x, y, w, placeholder: str, value: str, key: str, refs: dict):
    f = NSTextField.alloc().initWithFrame_(NSMakeRect(x, y, w, 24))
    f.setPlaceholderString_(placeholder)
    f.setStringValue_(value or "")
    f.setFont_(NSFont.systemFontOfSize_(12))
    parent.addSubview_(f)
    refs[key] = f
    return f


def _popup(parent, x, y, w, items: list, selected: str, key: str, refs: dict):
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


def _segmented(parent, x, y, w, items: list, selected_idx: int, key: str, refs: dict):
    ctrl = NSSegmentedControl.alloc().initWithFrame_(NSMakeRect(x, y, w, 26))
    ctrl.setSegmentCount_(len(items))
    for i, label in enumerate(items):
        ctrl.setLabel_forSegment_(label, i)
    ctrl.setSelectedSegment_(selected_idx)
    ctrl.setSegmentStyle_(1)  # NSSegmentStyleRounded
    parent.addSubview_(ctrl)
    refs[key] = ctrl
    return ctrl


def _button(parent, x, y, w, h, title: str, key: str, refs: dict):
    btn = NSButton.alloc().initWithFrame_(NSMakeRect(x, y, w, h))
    btn.setTitle_(title)
    btn.setBezelStyle_(4)  # NSBezelStyleRoundRect
    parent.addSubview_(btn)
    refs[key] = btn
    return btn


def _scroll_wrap(content_view: NSView, frame: NSRect) -> NSScrollView:
    sv = NSScrollView.alloc().initWithFrame_(frame)
    sv.setHasVerticalScroller_(True)
    sv.setHasHorizontalScroller_(False)
    sv.setAutohidesScrollers_(True)
    sv.setDocumentView_(content_view)
    content_view.setFrame_(NSMakeRect(0, 0, frame.size.width - 16, frame.size.height))
    return sv


# ── Chips view (terms) ────────────────────────────────────────────────────────

class ChipsView:
    CHIP_H     = 24
    CHIP_PAD_X = 10
    ROW_GAP    = 6
    COL_GAP    = 6

    def __init__(self, parent, x, y, w, terms: list[str], on_remove):
        self._parent    = parent
        self._x         = x
        self._w         = w
        self._terms     = list(terms)
        self._on_remove = on_remove
        self._buttons: dict[str, NSButton] = {}
        self._base_y    = y
        self._rebuild()

    @property
    def height(self) -> float:
        return self._height

    def get_terms(self) -> list[str]:
        return list(self._terms)

    def add_term(self, term: str):
        if term and term not in self._terms:
            self._terms.append(term)
            self._rebuild()

    def _rebuild(self):
        for btn in self._buttons.values():
            btn.removeFromSuperview()
        self._buttons.clear()

        cx    = self._x
        cy    = self._base_y
        row_h = self.CHIP_H + self.ROW_GAP

        for term in self._terms:
            char_w  = len(term) * 7.5 + 28 + self.CHIP_PAD_X * 2
            chip_w  = max(char_w, 60.0)
            if cx + chip_w > self._x + self._w and cx > self._x:
                cx  = self._x
                cy -= row_h

            btn = NSButton.alloc().initWithFrame_(NSMakeRect(cx, cy, chip_w, self.CHIP_H))
            btn.setTitle_(f"{term}  ×")
            btn.setFont_(NSFont.systemFontOfSize_(11))
            btn.setBezelStyle_(4)
            self._parent.addSubview_(btn)
            self._buttons[term] = btn

            t_ref = term
            panel_ref = self

            class RemoveAction(objc.lookUpClass("NSObject")):
                @objc.python_method
                def act(self_inner):
                    panel_ref._remove_term(t_ref)

            delegate = RemoveAction.alloc().init()
            btn.setTarget_(delegate)
            btn.setAction_(objc.selector(
                delegate.act, selector=b"act", signature=b"v@:",
            ))
            btn._delegate_ref = delegate  # keep alive

            cx += chip_w + self.COL_GAP

        last_row_items = [t for t in self._terms]
        self._height = row_h * (len(last_row_items) // max(1, int((self._w) / 80)) + 1) if self._terms else 0

    def _remove_term(self, term: str):
        if term in self._terms:
            self._terms.remove(term)
            self._on_remove(term)
            self._rebuild()


# ── Main ConfigPanel ──────────────────────────────────────────────────────────

class ConfigPanel:

    def __init__(self, cfg: dict, ollama_service, on_save, lang_fn):
        self._cfg          = cfg
        self._ollama       = ollama_service
        self._on_save      = on_save
        self._lang_fn      = lang_fn
        self._win          = None
        self._refs: dict   = {}
        self._chips: ChipsView | None = None

    @property
    def _lang(self) -> str:
        l = self._lang_fn()
        return l if l != "auto" else "es"

    def show(self, models: list[str]):
        if self._win is None or not self._win.isVisible():
            self._win = None
            self._refs.clear()
            self._chips = None
            self._build(models)
        self._win.makeKeyAndOrderFront_(None)
        self._win.orderFrontRegardless()

    # ── Build window ──────────────────────────────────────────────────────────

    def _build(self, models: list[str]):
        lg = self._lang
        style = (NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable)
        win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            ((200, 150), (PANEL_W, PANEL_H)), style, NSBackingStoreBuffered, False,
        )
        win.setTitle_(t("config_title", lg))
        win.setReleasedWhenClosed_(False)
        win.setCollectionBehavior_(NSWindowCollectionBehaviorCanJoinAllSpaces)
        win.setMinSize_((PANEL_W, 480))

        cv = win.contentView()

        # ── NSTabView ─────────────────────────────────────────────────────────
        tab_view = NSTabView.alloc().initWithFrame_(
            NSMakeRect(0, 50, PANEL_W, PANEL_H - 50)
        )

        item_customize = NSTabViewItem.alloc().init()
        item_customize.setLabel_(t("tab_customize", lg))
        item_access = NSTabViewItem.alloc().init()
        item_access.setLabel_(t("tab_access", lg))

        item_customize.setView_(self._build_customize_tab(models))
        item_access.setView_(self._build_access_tab(models))

        tab_view.addTabViewItem_(item_customize)
        tab_view.addTabViewItem_(item_access)
        cv.addSubview_(tab_view)

        # ── Bottom buttons ────────────────────────────────────────────────────
        btn_cancel = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 206, 12, 96, 30))
        btn_cancel.setTitle_(t("btn_cancel", lg))
        btn_cancel.setBezelStyle_(1)
        btn_cancel.setTarget_(win)
        btn_cancel.setAction_("performClose:")
        cv.addSubview_(btn_cancel)

        btn_save = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 104, 12, 88, 30))
        btn_save.setTitle_(t("btn_save", lg))
        btn_save.setBezelStyle_(1)
        btn_save.setKeyEquivalent_("\r")
        cv.addSubview_(btn_save)
        self._refs["_btn_save"] = btn_save
        self._setup_save(btn_save, win)

        self._win = win

    # ── Tab 1: Personalizar ───────────────────────────────────────────────────

    def _build_customize_tab(self, models: list[str]) -> NSView:
        lg  = self._lang
        tab = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, PANEL_W - 20, TAB_H))
        cw  = PANEL_W - 20
        y   = TAB_H - 20

        def gap(n=8):
            nonlocal y; y -= n

        def sec(key):
            nonlocal y; y -= 24
            _section_label(tab, t(key, lg), y, cw)
            y -= 4

        # ── Atajo de teclado ──────────────────────────────────────────────────
        sec("sec_hotkey")

        # Mode segmented
        y -= 28
        _label(tab, t("hotkey_mode", lg), 20, y, 120)
        mode = self._cfg.get("hotkey_mode", "hold")
        _segmented(tab, 140, y - 2, 200,
                   [t("hotkey_hold", lg), t("hotkey_toggle", lg)],
                   0 if mode == "hold" else 1, "hotkey_mode_seg", self._refs)

        # Mode description
        y -= 26
        mode_desc = t("hotkey_hold_desc" if mode == "hold" else "hotkey_toggle_desc", lg)
        desc_f = NSTextField.labelWithString_(mode_desc)
        desc_f.setFrame_(NSMakeRect(20, y, cw - 40, 16))
        desc_f.setFont_(NSFont.systemFontOfSize_(10.5))
        desc_f.setTextColor_(NSColor.secondaryLabelColor())
        tab.addSubview_(desc_f)
        self._refs["_hotkey_desc"] = desc_f

        # Hotkey table
        y -= 30
        _label(tab, t("hotkeys_header", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 4
        for wf in WORKFLOWS:
            y -= 22
            name = getattr(wf, f"label_{lg}", wf.label_en)
            _label(tab, f"{wf.icon}  {name}", 28, y, 200, small=True)
            _label(tab, wf.hotkey_label, 240, y, 120, small=True, secondary=True)

        gap(20)

        # ── Workflow predeterminado ───────────────────────────────────────────
        sec("sec_workflow")
        y -= 28
        _label(tab, t("lbl_default", lg), 20, y, 140)
        wf_ids    = [wf.id for wf in WORKFLOWS]
        wf_labels = [f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}" for wf in WORKFLOWS]
        cur_wf_label = next(
            (f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}"
             for wf in WORKFLOWS if wf.id == self._cfg.get("workflow", "transcribir")),
            wf_labels[0],
        )
        _popup(tab, 140, y - 2, 240, wf_labels, cur_wf_label, "workflow_label", self._refs)
        self._refs["_wf_ids"]    = wf_ids
        self._refs["_wf_labels"] = wf_labels

        gap(20)

        # ── Mejora + Profesional ──────────────────────────────────────────────
        sec("sec_improve")

        # Tone
        y -= 28
        _label(tab, t("lbl_tone", lg), 20, y, 140)
        tone_opts = [t("tone_formal", lg), t("tone_neutral", lg), t("tone_casual", lg)]
        tone_vals = ["formal", "neutral", "casual"]
        cur_tone  = self._cfg.get("tone_mejorar", "neutral")
        _segmented(tab, 140, y - 2, 240, tone_opts,
                   tone_vals.index(cur_tone) if cur_tone in tone_vals else 1,
                   "tone_seg", self._refs)
        self._refs["_tone_vals"] = tone_vals

        # Custom prompt
        y -= 32
        _label(tab, t("lbl_custom_prompt", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _text_field(tab, 20, y, cw - 40,
                    t("ph_custom_prompt", lg),
                    self._cfg.get("custom_prompt_mejorar", ""),
                    "custom_prompt_mejorar", self._refs)

        # Context
        y -= 30
        _label(tab, t("lbl_context", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _text_field(tab, 20, y, cw - 40,
                    t("ph_context", lg),
                    self._cfg.get("context_mejorar", ""),
                    "context_mejorar", self._refs)

        gap(20)

        # ── Desahogo ──────────────────────────────────────────────────────────
        sec("sec_desahogo")
        y -= 28
        _label(tab, t("lbl_desahogo_prompt", lg), 20, y, cw - 40, small=True, secondary=True)
        y -= 28
        _text_field(tab, 20, y, cw - 40,
                    t("ph_desahogo_prompt", lg),
                    self._cfg.get("custom_prompt_desahogo", ""),
                    "custom_prompt_desahogo", self._refs)

        gap(20)

        # ── Emoji ─────────────────────────────────────────────────────────────
        sec("sec_emoji")
        y -= 28
        _label(tab, t("lbl_density", lg), 20, y, 140)
        density_opts = [t("density_low", lg), t("density_mid", lg), t("density_high", lg)]
        density_vals = ["poca", "media", "mucha"]
        cur_density  = self._cfg.get("emoji_density", "media")
        _segmented(tab, 140, y - 2, 240, density_opts,
                   density_vals.index(cur_density) if cur_density in density_vals else 1,
                   "emoji_density_seg", self._refs)
        self._refs["_density_vals"] = density_vals

        gap(20)

        # ── Vocabulario personalizado ─────────────────────────────────────────
        sec("sec_terms")
        y -= 18
        hint = NSTextField.labelWithString_(t("terms_hint", lg))
        hint.setFrame_(NSMakeRect(20, y - 18, cw - 40, 36))
        hint.setFont_(NSFont.systemFontOfSize_(10.5))
        hint.setTextColor_(NSColor.secondaryLabelColor())
        hint.setLineBreakMode_(0)  # byWordWrapping
        tab.addSubview_(hint)
        y -= 44

        # Chips
        user_terms = self._cfg.get("user_terms", [])
        self._chips = ChipsView(tab, 20, y - 30, cw - 40, user_terms,
                                on_remove=lambda _term: None)
        y -= max(self._chips.height + 10, 10)

        # Add term input
        y -= 28
        field = _text_field(tab, 20, y, cw - 100,
                            t("ph_new_term", lg), "", "new_term", self._refs)
        add_btn = _button(tab, cw - 74, y, 60, 28, t("btn_add", lg), "btn_add_term", self._refs)
        self._setup_add_term(add_btn, field)

        gap(30)

        # Adjust content height
        content_h = max(TAB_H, TAB_H - y + 20)
        tab.setFrame_(NSMakeRect(0, 0, cw, content_h))

        # Wrap in scroll view
        sv = NSScrollView.alloc().initWithFrame_(NSMakeRect(0, 0, PANEL_W - 20, TAB_H))
        sv.setHasVerticalScroller_(True)
        sv.setHasHorizontalScroller_(False)
        sv.setAutohidesScrollers_(True)
        sv.setDocumentView_(tab)
        return sv

    # ── Tab 2: Acceso ─────────────────────────────────────────────────────────

    def _build_access_tab(self, models: list[str]) -> NSView:
        lg  = self._lang
        tab = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, PANEL_W - 20, TAB_H))
        cw  = PANEL_W - 20
        y   = TAB_H - 20

        def gap(n=8):
            nonlocal y; y -= n

        def sec(key):
            nonlocal y; y -= 24
            _section_label(tab, t(key, lg), y, cw)
            y -= 4

        # ── Ollama ────────────────────────────────────────────────────────────
        sec("sec_ollama")

        # Model
        y -= 28
        _label(tab, t("lbl_model", lg), 20, y, 120)
        model_items = models if models else [self._cfg.get("ollama_model", "") or "—"]
        cur_model   = self._cfg.get("ollama_model", "")
        _popup(tab, 140, y - 2, 240, model_items, cur_model, "ollama_model", self._refs)

        # Refresh button
        refresh_btn = _button(tab, cw - 110, y - 2, 90, 28,
                              t("btn_refresh", lg), "btn_refresh", self._refs)
        self._setup_refresh(refresh_btn)

        # URL
        y -= 36
        _label(tab, t("lbl_url", lg), 20, y, 120)
        _text_field(tab, 140, y, cw - 160,
                    "http://localhost:11434",
                    self._cfg.get("ollama_url", "http://localhost:11434"),
                    "ollama_url", self._refs)

        # Timeout
        y -= 32
        _label(tab, t("lbl_timeout", lg), 20, y, 120)
        _text_field(tab, 140, y, 80, "60",
                    str(self._cfg.get("ollama_timeout", 60)),
                    "ollama_timeout", self._refs)

        gap(24)

        # ── Permisos ──────────────────────────────────────────────────────────
        sec("sec_perms")

        ok = self._check_accessibility()
        y -= 28
        perm_text = t("perm_ok" if ok else "perm_missing", lg)
        perm_f    = NSTextField.labelWithString_(perm_text)
        perm_f.setFrame_(NSMakeRect(20, y, cw - 40, 20))
        perm_f.setFont_(NSFont.systemFontOfSize_(12.5))
        perm_f.setTextColor_(NSColor.systemGreenColor() if ok else NSColor.systemOrangeColor())
        tab.addSubview_(perm_f)

        if not ok:
            y -= 28
            detail = NSTextField.labelWithString_(t("perm_detail", lg))
            detail.setFrame_(NSMakeRect(20, y - 18, cw - 40, 36))
            detail.setFont_(NSFont.systemFontOfSize_(10.5))
            detail.setTextColor_(NSColor.secondaryLabelColor())
            tab.addSubview_(detail)
            y -= 46

            open_btn = _button(tab, 20, y, 200, 28,
                               t("btn_open_acc", lg), "btn_open_acc", self._refs)
            self._setup_open_accessibility(open_btn)

        return tab

    # ── Actions ───────────────────────────────────────────────────────────────

    def _setup_add_term(self, btn: NSButton, field: NSTextField):
        panel_ref = self

        class AddAction(objc.lookUpClass("NSObject")):
            @objc.python_method
            def act(self_inner):
                term = field.stringValue().strip()
                if term and panel_ref._chips:
                    panel_ref._chips.add_term(term)
                    field.setStringValue_("")

        delegate = AddAction.alloc().init()
        btn.setTarget_(delegate)
        btn.setAction_(objc.selector(delegate.act, selector=b"act", signature=b"v@:"))
        btn._add_delegate = delegate

    def _setup_refresh(self, btn: NSButton):
        panel_ref = self

        class RefreshAction(objc.lookUpClass("NSObject")):
            @objc.python_method
            def act(self_inner):
                def _do():
                    models = panel_ref._ollama.list_models()
                    def _upd():
                        popup = panel_ref._refs.get("ollama_model")
                        if popup and models:
                            popup.removeAllItems()
                            for m in models:
                                popup.addItemWithTitle_(m)
                            cur = panel_ref._cfg.get("ollama_model", "")
                            if cur in models:
                                popup.selectItemWithTitle_(cur)
                    import threading
                    threading.Timer(0, _upd).start()
                threading.Thread(target=_do, daemon=True).start()

        delegate = RefreshAction.alloc().init()
        btn.setTarget_(delegate)
        btn.setAction_(objc.selector(delegate.act, selector=b"act", signature=b"v@:"))
        btn._refresh_delegate = delegate

    def _setup_open_accessibility(self, btn: NSButton):
        class OpenAction(objc.lookUpClass("NSObject")):
            @objc.python_method
            def act(self_inner):
                subprocess.run([
                    "open",
                    "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
                ])

        delegate = OpenAction.alloc().init()
        btn.setTarget_(delegate)
        btn.setAction_(objc.selector(delegate.act, selector=b"act", signature=b"v@:"))
        btn._open_delegate = delegate

    def _setup_save(self, btn: NSButton, win: NSWindow):
        panel_ref = self

        class SaveAction(objc.lookUpClass("NSObject")):
            @objc.python_method
            def act(self_inner):
                panel_ref._collect_and_save()
                win.performClose_(None)

        delegate = SaveAction.alloc().init()
        btn.setTarget_(delegate)
        btn.setAction_(objc.selector(delegate.act, selector=b"act", signature=b"v@:"))
        btn._save_delegate = delegate

    def _collect_and_save(self):
        refs = self._refs
        cfg  = self._cfg

        # Hotkey mode
        seg = refs.get("hotkey_mode_seg")
        if seg:
            cfg["hotkey_mode"] = "toggle" if seg.selectedSegment() == 1 else "hold"

        # Default workflow
        wf_popup  = refs.get("workflow_label")
        wf_ids    = refs.get("_wf_ids", [])
        wf_labels = refs.get("_wf_labels", [])
        if wf_popup and wf_ids:
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

        # Custom prompts
        for key in ("custom_prompt_mejorar", "custom_prompt_desahogo", "context_mejorar"):
            f = refs.get(key)
            if f:
                cfg[key] = f.stringValue().strip()

        # Emoji density
        density_seg  = refs.get("emoji_density_seg")
        density_vals = refs.get("_density_vals", ["poca", "media", "mucha"])
        if density_seg:
            idx = density_seg.selectedSegment()
            if 0 <= idx < len(density_vals):
                cfg["emoji_density"] = density_vals[idx]

        # Terms from chips
        if self._chips:
            cfg["user_terms"] = self._chips.get_terms()

        # Ollama model
        model_popup = refs.get("ollama_model")
        if model_popup:
            cfg["ollama_model"] = model_popup.titleOfSelectedItem() or ""

        # Ollama URL
        url_f = refs.get("ollama_url")
        if url_f:
            val = url_f.stringValue().strip()
            if val:
                cfg["ollama_url"] = val

        # Ollama timeout
        timeout_f = refs.get("ollama_timeout")
        if timeout_f:
            try:
                cfg["ollama_timeout"] = int(timeout_f.stringValue())
            except ValueError:
                pass

        self._on_save(cfg)

    @staticmethod
    def _check_accessibility() -> bool:
        try:
            ax = ctypes.cdll.LoadLibrary(
                "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"
            )
            ax.AXIsProcessTrusted.restype = ctypes.c_bool
            return bool(ax.AXIsProcessTrusted())
        except Exception:
            return False
