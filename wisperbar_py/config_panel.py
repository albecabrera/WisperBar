"""
Config panel — panel lateral sin pestañas.
Header con título + botón Guardar arriba a la derecha.
Todo en una sola vista scrollable.
"""
from pathlib import Path
import ctypes
import subprocess
import threading
import objc
from AppKit import (
    NSWindow, NSView, NSScrollView, NSTextField, NSSecureTextField,
    NSButton, NSPopUpButton, NSSegmentedControl,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable,
    NSWindowStyleMaskResizable, NSBackingStoreBuffered,
    NSColor, NSFont, NSMakeRect, NSApplication, NSObject,
)
from i18n import t
from workflows import WORKFLOWS
from llm_service import (
    keychain_save, keychain_load, keychain_delete,
    ANTHROPIC_MODELS_FALLBACK, OPENAI_MODELS_FALLBACK,
    PROVIDERS,
)

PANEL_W   = 460
PANEL_H   = 720
HDR_H     = 52          # fixed header height
BODY_H    = PANEL_H - HDR_H
CONTENT_H = 1600        # scrollable content height
LBL_W     = 140         # left-side label column width
CTRL_X    = LBL_W + 12  # x where controls start
CTRL_W    = PANEL_W - CTRL_X - 20  # width of right-side controls

WHISPER_MODELS = [
    ("Tiny   (~40 MB)",     "mlx-community/whisper-tiny-mlx"),
    ("Base   (~74 MB)",     "mlx-community/whisper-base-mlx"),
    ("Small  (~244 MB)",    "mlx-community/whisper-small-mlx"),
    ("Medium (~769 MB)",    "mlx-community/whisper-medium-mlx"),
    ("Large v3  (~1.5 GB)", "mlx-community/whisper-large-v3-mlx"),
]

_DENSITY_KEYS = ["low", "mid", "high"]
_DENSITY_VALS = ["poca", "media", "mucha"]


def _model_installed(repo: str) -> bool:
    snaps = (Path.home() / ".cache" / "huggingface" / "hub"
             / ("models--" + repo.replace("/", "--")) / "snapshots")
    try:
        return snaps.exists() and any(snaps.iterdir())
    except Exception:
        return False


# ── Action delegate (module-level — never inside methods) ─────────────────────

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


# ── Layout primitives ─────────────────────────────────────────────────────────

def _lbl(parent, text, x, y, w, h=18, small=False, secondary=False, wrap=False):
    f = NSTextField.labelWithString_(text)
    f.setFrame_(NSMakeRect(x, y, w, h))
    f.setFont_(NSFont.systemFontOfSize_(11 if small else 13))
    if secondary:
        f.setTextColor_(NSColor.secondaryLabelColor())
    if wrap:
        f.setLineBreakMode_(0)
        f.setMaximumNumberOfLines_(4)
    parent.addSubview_(f)
    return f


def _section_header(parent, text, y, w):
    lbl = NSTextField.labelWithString_(text.upper())
    lbl.setFrame_(NSMakeRect(20, y, w - 40, 15))
    lbl.setFont_(NSFont.boldSystemFontOfSize_(9))
    lbl.setTextColor_(NSColor.tertiaryLabelColor())
    parent.addSubview_(lbl)


def _separator(parent, y, w):
    sep = NSView.alloc().initWithFrame_(NSMakeRect(20, y, w - 40, 1))
    sep.setWantsLayer_(True)
    layer = sep.layer()
    if layer:
        layer.setBackgroundColor_(NSColor.separatorColor().CGColor())
    parent.addSubview_(sep)


def _row_bg(parent, y, h, w):
    """Subtle alternating background for readability."""
    bg = NSView.alloc().initWithFrame_(NSMakeRect(0, y, w, h))
    bg.setWantsLayer_(True)
    layer = bg.layer()
    if layer:
        layer.setBackgroundColor_(NSColor.quaternaryLabelColor().CGColor())
    parent.addSubview_(bg)


def _field(parent, x, y, w, placeholder, value, key, refs):
    f = NSTextField.alloc().initWithFrame_(NSMakeRect(x, y, w, 24))
    f.setPlaceholderString_(placeholder)
    f.setStringValue_(value or "")
    f.setFont_(NSFont.systemFontOfSize_(12))
    parent.addSubview_(f)
    refs[key] = f
    return f


def _secure_field(parent, x, y, w, placeholder, key, refs):
    f = NSSecureTextField.alloc().initWithFrame_(NSMakeRect(x, y, w, 24))
    f.setPlaceholderString_(placeholder)
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


def _btn(parent, x, y, w, h, title, key, refs, action=None, keep=None):
    b = NSButton.alloc().initWithFrame_(NSMakeRect(x, y, w, h))
    b.setTitle_(title)
    b.setBezelStyle_(4)
    parent.addSubview_(b)
    if key:
        refs[key] = b
    if action is not None:
        tgt = _Btn.alloc().init().bind(action)
        b.setTarget_(tgt)
        b.setAction_(b"fire:")
        if keep is not None:
            keep.append(tgt)
    return b


def _link_btn(parent, x, y, w, title, url, keep):
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
    keep.append(tgt)
    parent.addSubview_(b)
    return b


# ── ConfigPanel ────────────────────────────────────────────────────────────────

class ConfigPanel:

    def __init__(self, cfg, llm_service, on_save, lang_fn):
        self._cfg        = cfg
        self._llm        = llm_service
        self._on_save    = on_save
        self._lang_fn    = lang_fn
        self._win        = None
        self._refs: dict = {}
        self._delegates: list = []
        self._terms: list[str] = list(cfg.get("user_terms", []))
        self._chips_view: NSView | None = None

    @property
    def _lg(self) -> str:
        lg = self._lang_fn()
        return lg if lg != "auto" else "es"

    # ── Public ────────────────────────────────────────────────────────────────

    def show(self, llm_models: list[str]):
        if self._win is None or not self._win.isVisible():
            self._win       = None
            self._refs      = {}
            self._delegates = []
            self._terms     = list(self._cfg.get("user_terms", []))
            self._chips_view = None
            self._build(llm_models)
        NSApplication.sharedApplication().activateIgnoringOtherApps_(True)
        self._win.makeKeyAndOrderFront_(None)
        self._win.orderFrontRegardless()

    # ── Build window ──────────────────────────────────────────────────────────

    def _build(self, llm_models: list[str]):
        lg   = self._lg
        keep = self._delegates
        style = (NSWindowStyleMaskTitled | NSWindowStyleMaskClosable
                 | NSWindowStyleMaskResizable)
        win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            ((240, 60), (PANEL_W, PANEL_H)), style, NSBackingStoreBuffered, False,
        )
        win.setTitle_("")
        win.setReleasedWhenClosed_(False)
        win.setMinSize_((PANEL_W, 500))
        cv = win.contentView()

        # ── Header ────────────────────────────────────────────────────────────
        hdr = NSView.alloc().initWithFrame_(NSMakeRect(0, PANEL_H - HDR_H, PANEL_W, HDR_H))
        hdr.setWantsLayer_(True)
        hl = hdr.layer()
        if hl:
            hl.setBackgroundColor_(NSColor.windowBackgroundColor().CGColor())

        # Title
        title_lbl = NSTextField.labelWithString_(t("config_title", lg))
        title_lbl.setFrame_(NSMakeRect(16, 14, 260, 22))
        title_lbl.setFont_(NSFont.boldSystemFontOfSize_(13))
        hdr.addSubview_(title_lbl)

        # Separator line
        sep = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, PANEL_W, 1))
        sep.setWantsLayer_(True)
        sl = sep.layer()
        if sl:
            sl.setBackgroundColor_(NSColor.separatorColor().CGColor())
        hdr.addSubview_(sep)

        # ── Botones arriba a la derecha ───────────────────────────────────────
        cancel_btn = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 196, 12, 84, 28))
        cancel_btn.setTitle_(t("btn_cancel", lg))
        cancel_btn.setBezelStyle_(1)
        cancel_btn.setTarget_(win)
        cancel_btn.setAction_(b"performClose:")
        hdr.addSubview_(cancel_btn)

        save_btn = NSButton.alloc().initWithFrame_(NSMakeRect(PANEL_W - 106, 12, 88, 28))
        save_btn.setTitle_(t("btn_save", lg))
        save_btn.setBezelStyle_(1)
        save_btn.setKeyEquivalent_("\r")
        save_tgt = _Btn.alloc().init().bind(
            lambda w=win: (self._collect(), w.performClose_(None))
        )
        save_btn.setTarget_(save_tgt)
        save_btn.setAction_(b"fire:")
        keep.append(save_tgt)
        hdr.addSubview_(save_btn)

        cv.addSubview_(hdr)

        # ── Body scroll ───────────────────────────────────────────────────────
        scroll = NSScrollView.alloc().initWithFrame_(
            NSMakeRect(0, 0, PANEL_W, PANEL_H - HDR_H)
        )
        scroll.setHasVerticalScroller_(True)
        scroll.setHasHorizontalScroller_(False)
        scroll.setAutohidesScrollers_(True)

        body = self._build_body(lg, llm_models)
        scroll.setDocumentView_(body)
        cv.addSubview_(scroll)

        self._win = win

    # ── Body (todo en una sola vista) ─────────────────────────────────────────

    def _build_body(self, lg: str, llm_models: list[str]) -> NSView:
        keep  = self._delegates
        w     = PANEL_W
        body  = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, w, CONTENT_H))
        y     = CONTENT_H - 12   # cursor: top → bottom

        def gap(n=8):
            nonlocal y; y -= n

        def section(key):
            nonlocal y
            y -= 10
            _separator(body, y, w)
            y -= 20
            _section_header(body, t(key, lg), y, w)
            y -= 8

        def row_label(text):
            nonlocal y
            _lbl(body, text, 20, y + 5, LBL_W, secondary=True, small=True)

        # ════════════════════════════════════════════════════════════════════
        # MODELO LOCAL WHISPER
        # ════════════════════════════════════════════════════════════════════
        section("sec_local_model")

        cur_wm       = self._cfg.get("whisper_model", "mlx-community/whisper-large-v3-mlx")
        wm_labels    = [lbl for lbl, _ in WHISPER_MODELS]
        wm_repos     = [repo for _, repo in WHISPER_MODELS]
        cur_wm_label = next((l for l, r in WHISPER_MODELS if r == cur_wm), wm_labels[-1])

        # Row: model picker
        y -= 28
        row_label(t("lbl_whisper_model", lg))
        _popup(body, CTRL_X, y, CTRL_W, wm_labels, cur_wm_label, "wm_popup", self._refs)
        self._refs["_wm_labels"] = wm_labels
        self._refs["_wm_repos"]  = wm_repos

        # Status row
        y -= 22
        installed = _model_installed(cur_wm)
        st_txt = t("model_installed" if installed else "model_not_downloaded", lg)
        st = _lbl(body, st_txt, CTRL_X, y, CTRL_W, small=True)
        st.setTextColor_(NSColor.systemGreenColor() if installed else NSColor.systemOrangeColor())

        # Link
        y -= 20
        _link_btn(body, CTRL_X, y, CTRL_W,
                  t("link_model_page", lg),
                  f"https://huggingface.co/{cur_wm}", keep)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # ATAJO DE TECLADO
        # ════════════════════════════════════════════════════════════════════
        section("sec_hotkey")

        mode = self._cfg.get("hotkey_mode", "hold")
        y -= 28
        row_label(t("hotkey_mode", lg))
        _seg(body, CTRL_X, y, CTRL_W,
             [t("hotkey_hold", lg), t("hotkey_toggle", lg)],
             0 if mode == "hold" else 1, "hotkey_mode_seg", self._refs)

        y -= 20
        desc_key = "hotkey_hold_desc" if mode == "hold" else "hotkey_toggle_desc"
        _lbl(body, t(desc_key, lg), CTRL_X, y, CTRL_W, small=True, secondary=True)

        # Shortcuts table
        y -= 24
        _lbl(body, t("hotkeys_header", lg), 20, y, w - 40, small=True, secondary=True)
        for wf in WORKFLOWS:
            y -= 20
            name = getattr(wf, f"label_{lg}", wf.label_en)
            _lbl(body, f"{wf.icon}  {name}", 32, y, 200, small=True)
            _lbl(body, wf.hotkey_label, 248, y, 120, small=True, secondary=True)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # WORKFLOW PREDETERMINADO
        # ════════════════════════════════════════════════════════════════════
        section("sec_workflow")

        wf_ids    = [wf.id for wf in WORKFLOWS]
        wf_labels = [
            f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}"
            for wf in WORKFLOWS
        ]
        cur_wf_lbl = next(
            (f"{wf.icon}  {getattr(wf, f'label_{lg}', wf.label_en)}"
             for wf in WORKFLOWS if wf.id == self._cfg.get("workflow", "transcribir")),
            wf_labels[0],
        )
        y -= 28
        row_label(t("lbl_default", lg))
        _popup(body, CTRL_X, y, CTRL_W, wf_labels, cur_wf_lbl, "wf_popup", self._refs)
        self._refs["_wf_ids"]    = wf_ids
        self._refs["_wf_labels"] = wf_labels
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # MEJORA DE TEXTO
        # ════════════════════════════════════════════════════════════════════
        section("sec_improve")

        tone_vals = ["formal", "neutral", "casual"]
        tone_opts = [t(f"tone_{v}", lg) for v in tone_vals]
        cur_tone  = self._cfg.get("tone_mejorar", "neutral")
        y -= 28
        row_label(t("lbl_tone", lg))
        _seg(body, CTRL_X, y, CTRL_W, tone_opts,
             tone_vals.index(cur_tone) if cur_tone in tone_vals else 1,
             "tone_seg", self._refs)
        self._refs["_tone_vals"] = tone_vals

        y -= 30
        _lbl(body, t("lbl_custom_prompt", lg), 20, y, w - 40, small=True, secondary=True)
        y -= 26
        _field(body, 20, y, w - 40, t("ph_custom_prompt", lg),
               self._cfg.get("custom_prompt_mejorar", ""),
               "custom_prompt_mejorar", self._refs)

        y -= 28
        _lbl(body, t("lbl_context", lg), 20, y, w - 40, small=True, secondary=True)
        y -= 26
        _field(body, 20, y, w - 40, t("ph_context", lg),
               self._cfg.get("context_mejorar", ""),
               "context_mejorar", self._refs)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # DESAHOGO
        # ════════════════════════════════════════════════════════════════════
        section("sec_desahogo")

        y -= 28
        _lbl(body, t("lbl_desahogo_prompt", lg), 20, y, w - 40, small=True, secondary=True)
        y -= 26
        _field(body, 20, y, w - 40, t("ph_desahogo_prompt", lg),
               self._cfg.get("custom_prompt_desahogo", ""),
               "custom_prompt_desahogo", self._refs)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # EMOJI
        # ════════════════════════════════════════════════════════════════════
        section("sec_emoji")

        density_opts = [t(f"density_{k}", lg) for k in _DENSITY_KEYS]
        cur_density  = self._cfg.get("emoji_density", "media")
        cur_didx     = _DENSITY_VALS.index(cur_density) if cur_density in _DENSITY_VALS else 1
        y -= 28
        row_label(t("lbl_density", lg))
        _seg(body, CTRL_X, y, CTRL_W, density_opts, cur_didx, "density_seg", self._refs)
        self._refs["_density_vals"] = _DENSITY_VALS
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # VOCABULARIO
        # ════════════════════════════════════════════════════════════════════
        section("sec_terms")

        y -= 20
        _lbl(body, t("terms_hint", lg), 20, y - 12, w - 40, h=32,
             small=True, secondary=True, wrap=True)
        y -= 48

        chips_h = max(len(self._terms) * 30 + 16, 44)
        self._chips_view = NSView.alloc().initWithFrame_(
            NSMakeRect(20, y - chips_h, w - 40, chips_h)
        )
        self._chips_view.setWantsLayer_(True)
        cl = self._chips_view.layer()
        if cl:
            cl.setCornerRadius_(6.0)
            cl.setBackgroundColor_(NSColor.quaternaryLabelColor().CGColor())
        body.addSubview_(self._chips_view)
        self._render_chips(lg)
        y -= chips_h + 8

        y -= 30
        _field(body, 20, y, w - 110, t("ph_new_term", lg), "", "new_term", self._refs)
        _btn(body, w - 84, y + 1, 70, 26, t("btn_add", lg), "btn_add", self._refs,
             action=lambda: self._add_term(lg), keep=keep)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # PROVEEDOR LLM
        # ════════════════════════════════════════════════════════════════════
        section("sec_provider")

        cur_provider  = self._cfg.get("llm_provider", "ollama")
        cur_pidx      = PROVIDERS.index(cur_provider) if cur_provider in PROVIDERS else 0
        prov_labels   = [
            t("provider_ollama", lg), t("provider_anthropic", lg),
            t("provider_openai", lg), t("provider_generic", lg),
        ]
        y -= 28
        _seg(body, 20, y, w - 40, prov_labels, cur_pidx, "provider_seg", self._refs)
        self._refs["_providers"] = PROVIDERS

        # Modelo
        y -= 34
        row_label(t("lbl_model", lg))
        if cur_provider == "ollama":
            init_models = llm_models if llm_models else [self._cfg.get("ollama_model", "") or "—"]
            cur_model   = self._cfg.get("ollama_model", "")
        elif cur_provider == "anthropic":
            init_models = list(ANTHROPIC_MODELS_FALLBACK)
            cur_model   = self._cfg.get("anthropic_model", "claude-sonnet-4-6")
        elif cur_provider == "openai":
            init_models = list(OPENAI_MODELS_FALLBACK)
            cur_model   = self._cfg.get("openai_model", "gpt-4o")
        else:
            init_models = [self._cfg.get("generic_model", "") or "—"]
            cur_model   = self._cfg.get("generic_model", "")
        _popup(body, CTRL_X, y, CTRL_W - 96, init_models, cur_model,
               "llm_model_popup", self._refs)
        _btn(body, w - 106, y - 1, 88, 28, t("btn_refresh", lg),
             "btn_refresh", self._refs,
             action=self._refresh_models, keep=keep)

        # URL base
        y -= 34
        row_label(t("lbl_base_url", lg))
        if cur_provider == "ollama":
            url_val, url_ph = self._cfg.get("ollama_url", ""), "http://localhost:11434"
        elif cur_provider == "anthropic":
            url_val, url_ph = self._cfg.get("anthropic_base_url", ""), "https://api.anthropic.com"
        elif cur_provider == "openai":
            url_val, url_ph = self._cfg.get("openai_base_url", ""), "https://api.openai.com"
        else:
            url_val, url_ph = self._cfg.get("generic_base_url", ""), "https://su-api.ejemplo.com"
        _field(body, CTRL_X, y, CTRL_W, url_ph, url_val, "llm_base_url", self._refs)

        # Timeout
        y -= 34
        row_label(t("lbl_timeout", lg))
        _field(body, CTRL_X, y, 80, "60",
               str(self._cfg.get("ollama_timeout", 60)),
               "ollama_timeout", self._refs)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # API KEY
        # ════════════════════════════════════════════════════════════════════
        section("sec_api_key")

        y -= 26
        row_label(t("lbl_api_key", lg))
        _secure_field(body, CTRL_X, y, CTRL_W, "sk-…", "api_key_field", self._refs)

        y -= 22
        existing = keychain_load(f"{cur_provider}_api_key") if cur_provider != "ollama" else ""
        st_txt = t("key_present", lg) if existing else t("key_absent", lg)
        kst = _lbl(body, st_txt, CTRL_X, y, CTRL_W, small=True)
        kst.setTextColor_(
            NSColor.systemGreenColor() if existing else NSColor.secondaryLabelColor()
        )
        self._refs["_key_status_lbl"] = kst

        y -= 30
        _btn(body, CTRL_X, y, 170, 26, t("btn_save_key", lg),
             "btn_save_key", self._refs,
             action=lambda: self._save_api_key(lg), keep=keep)
        _btn(body, CTRL_X + 178, y, 72, 26, t("key_clear", lg),
             "btn_clear_key", self._refs,
             action=lambda: self._clear_api_key(lg), keep=keep)
        gap(12)

        # ════════════════════════════════════════════════════════════════════
        # PERMISOS
        # ════════════════════════════════════════════════════════════════════
        section("sec_perms")

        ok = self._ax_ok()
        y -= 26
        pf = _lbl(body, t("perm_ok" if ok else "perm_missing", lg), 20, y, w - 40)
        pf.setTextColor_(NSColor.systemGreenColor() if ok else NSColor.systemOrangeColor())

        if not ok:
            y -= 22
            _lbl(body, t("perm_detail", lg), 20, y - 16, w - 40, h=40,
                 small=True, secondary=True, wrap=True)
            y -= 56
            _btn(body, 20, y, 240, 28, t("btn_open_acc", lg),
                 "btn_open_acc", self._refs,
                 action=lambda: subprocess.run([
                     "open",
                     "x-apple.systempreferences:"
                     "com.apple.preference.security?Privacy_Accessibility",
                 ]),
                 keep=keep)

        gap(30)
        return body

    # ── Chips ─────────────────────────────────────────────────────────────────

    def _render_chips(self, lg: str):
        if self._chips_view is None:
            return
        for sv in list(self._chips_view.subviews()):
            sv.removeFromSuperview()
        cw   = self._chips_view.frame().size.width
        x, cy = 8.0, 8.0
        for term in self._terms:
            chip_w = min(len(term) * 7.5 + 36, cw - 16)
            b = NSButton.alloc().initWithFrame_(NSMakeRect(x, cy, chip_w, 22))
            b.setTitle_(f"{term}  ×")
            b.setFont_(NSFont.systemFontOfSize_(11))
            b.setBezelStyle_(4)
            tgt = _Btn.alloc().init().bind(lambda t_=term: self._remove_term(t_, lg))
            b.setTarget_(tgt)
            b.setAction_(b"fire:")
            self._delegates.append(tgt)
            self._chips_view.addSubview_(b)
            x += chip_w + 6
            if x + 80 > cw:
                x   = 8.0
                cy += 28

    def _add_term(self, lg: str):
        f = self._refs.get("new_term")
        if f is None:
            return
        term = f.stringValue().strip()
        if term and term not in self._terms:
            self._terms.append(term)
            self._render_chips(lg)
        f.setStringValue_("")

    def _remove_term(self, term: str, lg: str):
        if term in self._terms:
            self._terms.remove(term)
            self._render_chips(lg)

    # ── API key actions ───────────────────────────────────────────────────────

    def _save_api_key(self, lg: str):
        field    = self._refs.get("api_key_field")
        st_lbl   = self._refs.get("_key_status_lbl")
        seg      = self._refs.get("provider_seg")
        providers = self._refs.get("_providers", PROVIDERS)
        provider = providers[seg.selectedSegment()] if seg else "ollama"
        if field is None or provider == "ollama":
            return
        key = field.stringValue().strip()
        if key:
            ok = keychain_save(f"{provider}_api_key", key)
            if st_lbl:
                st_lbl.setStringValue_(t("key_saved" if ok else "key_absent", lg))
                st_lbl.setTextColor_(
                    NSColor.systemGreenColor() if ok else NSColor.systemRedColor()
                )
            field.setStringValue_("")

    def _clear_api_key(self, lg: str):
        seg       = self._refs.get("provider_seg")
        providers = self._refs.get("_providers", PROVIDERS)
        provider  = providers[seg.selectedSegment()] if seg else "ollama"
        st_lbl    = self._refs.get("_key_status_lbl")
        if provider == "ollama":
            return
        keychain_delete(f"{provider}_api_key")
        if st_lbl:
            st_lbl.setStringValue_(t("key_absent", lg))
            st_lbl.setTextColor_(NSColor.secondaryLabelColor())

    # ── Model refresh ─────────────────────────────────────────────────────────

    def _refresh_models(self):
        seg       = self._refs.get("provider_seg")
        providers = self._refs.get("_providers", PROVIDERS)
        provider  = providers[seg.selectedSegment()] if seg else "ollama"

        base_url_f = self._refs.get("llm_base_url")
        base_url   = base_url_f.stringValue().strip() if base_url_f else ""

        api_key_f  = self._refs.get("api_key_field")
        field_key  = api_key_f.stringValue().strip() if api_key_f else ""
        api_key    = field_key or keychain_load(f"{provider}_api_key")

        def _fetch():
            models = self._llm.list_models(provider, base_url, api_key)
            popup  = self._refs.get("llm_model_popup")
            if popup and models:
                popup.removeAllItems()
                for m in models:
                    popup.addItemWithTitle_(m)
                cur_key = "ollama_model" if provider == "ollama" else f"{provider}_model"
                cur = self._cfg.get(cur_key, "")
                if cur in models:
                    popup.selectItemWithTitle_(cur)
        threading.Thread(target=_fetch, daemon=True).start()

    # ── Collect & save ────────────────────────────────────────────────────────

    def _collect(self):
        refs = self._refs
        cfg  = self._cfg

        # Provider
        provider_seg = refs.get("provider_seg")
        providers    = refs.get("_providers", PROVIDERS)
        provider     = providers[provider_seg.selectedSegment()] if provider_seg else "ollama"
        cfg["llm_provider"] = provider

        # Model (per-provider key)
        model_popup = refs.get("llm_model_popup")
        if model_popup:
            model = model_popup.titleOfSelectedItem() or ""
            cfg["ollama_model" if provider == "ollama" else f"{provider}_model"] = model

        # Base URL (per-provider key)
        base_url_f = refs.get("llm_base_url")
        if base_url_f:
            url = base_url_f.stringValue().strip()
            if provider == "ollama":
                cfg["ollama_url"] = url or "http://localhost:11434"
            else:
                cfg[f"{provider}_base_url"] = url

        # API key → Keychain (save if field not empty)
        api_key_f = refs.get("api_key_field")
        if api_key_f and provider != "ollama":
            key = api_key_f.stringValue().strip()
            if key:
                keychain_save(f"{provider}_api_key", key)

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

        # Text prompts/context
        for key in ("custom_prompt_mejorar", "context_mejorar", "custom_prompt_desahogo"):
            f = refs.get(key)
            if f:
                cfg[key] = f.stringValue().strip()

        # Emoji density
        dseg  = refs.get("density_seg")
        dvals = refs.get("_density_vals", _DENSITY_VALS)
        if dseg:
            idx = dseg.selectedSegment()
            if 0 <= idx < len(dvals):
                cfg["emoji_density"] = dvals[idx]

        # Terms (chips)
        cfg["user_terms"] = list(self._terms)

        # Timeout
        tf = refs.get("ollama_timeout")
        if tf:
            try:
                cfg["ollama_timeout"] = int(tf.stringValue())
            except ValueError:
                pass

        self._on_save(cfg)

    # ── Accessibility ─────────────────────────────────────────────────────────

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
