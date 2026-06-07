// ─── ESCAPE ROOM — REACT COMPONENT ──────────────────────────────────────────
const { useState, useEffect, useRef } = React;

// ─── SOUNDS (Web Audio API — sintetizados, sin archivos externos) ────────────
function createSounds() {
  let ctx = null;
  function C() {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); }
    return ctx;
  }
  function tone(freq, type, vol, dur, t0 = 0) {
    const c = C(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t0);
    g.gain.setValueAtTime(vol, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.01);
  }
  return {
    click:   () => { tone(650, 'sine', 0.1, 0.07); tone(420, 'sine', 0.07, 0.07, 0.04); },
    found:   () => { [392, 523, 659].forEach((f, i) => tone(f, 'sine', 0.18, 0.38, i * 0.14)); },
    error:   () => { tone(190, 'sawtooth', 0.09, 0.22); tone(160, 'sawtooth', 0.07, 0.22, 0.18); },
    success: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.2, 0.55, i * 0.13)); },
    pageChange: () => { [280, 360, 460].forEach((f, i) => tone(f, 'sine', 0.1, 0.35, i * 0.1)); },
  };
}

// ─── TIMER HELPERS ───────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ─── DOCUMENT MODAL ──────────────────────────────────────────────────────────
function DocumentModal({ hotspot, room, onClose }) {
  const cfg = SOURCE_CONFIG[hotspot.sourceType] || SOURCE_CONFIG.objeto;
  const isPeriodico = hotspot.sourceType === "periodico";
  const isDiario    = hotspot.sourceType === "diario";
  const isCarta     = hotspot.sourceType === "carta";
  const isDoc       = hotspot.sourceType === "documento";
  const isMono      = hotspot.sourceType === "monologointerior";
  const isFoto      = hotspot.sourceType === "foto";

  return (
    <div
      style={{
        background: cfg.paper,
        color: "#1C1005",
        maxWidth: 620, width: "100%",
        maxHeight: "88vh", overflowY: "auto",
        animation: "modalIn 0.28s cubic-bezier(0.34,1.3,0.64,1) forwards",
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.15)",
      }}
      onClick={e => e.stopPropagation()}
    >

      {/* ── Newspaper header ── */}
      {isPeriodico && (
        <div style={{
          background: "#1C1C1C", color: "#F0EFEA", padding: "10px 20px",
          fontFamily: "var(--ff-display)", textAlign: "center",
          borderBottom: "3px double #888",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 4, fontFamily: "var(--ff-mono)", color: "#999", marginBottom: 2 }}>
            REPÚBLICA DE CHILE · EDICIÓN ESPECIAL
          </div>
          <div style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 700 }}>El Diario del Pueblo</div>
          <div style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: "#999", marginTop: 2, letterSpacing: 2 }}>
            12 DE OCTUBRE DE 1973
          </div>
        </div>
      )}

      {/* ── Official doc header ── */}
      {isDoc && (
        <div style={{
          background: "rgba(139,58,58,0.06)",
          borderBottom: "2px solid #8B3A3A",
          padding: "14px 24px 12px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#8B3A3A", marginBottom: 4 }}>
              {cfg.label}
            </div>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,19px)", fontWeight: 700, color: "#1C1005" }}>
              {hotspot.title}
            </h2>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "2px solid #8B3A3A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--ff-mono)", fontSize: 10, color: "#8B3A3A",
            flexShrink: 0, marginTop: 2, letterSpacing: 0, textAlign: "center", lineHeight: 1.2,
          }}>GOB<br/>CHI</div>
        </div>
      )}

      {/* ── Carta header ── */}
      {isCarta && (
        <div style={{
          background: "rgba(123,167,188,0.08)",
          borderBottom: "1px solid rgba(123,167,188,0.4)",
          padding: "14px 24px 12px",
        }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#7BA7BC", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>
            {hotspot.title}
          </h2>
        </div>
      )}

      {/* ── Diario header ── */}
      {isDiario && (
        <div style={{
          background: "rgba(139,115,85,0.08)",
          borderBottom: "2px solid rgba(139,115,85,0.5)",
          padding: "14px 24px 12px",
        }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#8B7355", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>
            {hotspot.title}
          </h2>
        </div>
      )}

      {/* ── Monólogo header ── */}
      {isMono && (
        <div style={{
          background: "rgba(155,107,155,0.08)",
          borderBottom: "2px solid rgba(155,107,155,0.4)",
          padding: "14px 24px 12px",
        }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#9B6B9B", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>
            {hotspot.title}
          </h2>
        </div>
      )}

      {/* ── Default header (novela, articulo, foto, objeto) ── */}
      {!isPeriodico && !isDoc && !isCarta && !isDiario && !isMono && (
        <div style={{
          borderBottom: `3px solid ${cfg.accent}`,
          background: `${cfg.accent}0d`,
          padding: "14px 24px 12px",
        }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: cfg.accent, marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,19px)", fontWeight: 700, color: "#1C1005" }}>
            {hotspot.title}
          </h2>
        </div>
      )}

      {/* ── Photo special treatment ── */}
      {isFoto && (
        <div style={{
          margin: "16px 24px 0",
          background: "#C8C8C8",
          border: "8px solid #E0E0E0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          height: 140,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 2, color: "#888",
        }}>
          [ FOTOGRAFÍA — B/N ]
        </div>
      )}

      {/* ── Ruled lines (diario) ── */}
      {isDiario && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(139,115,85,0.12) 31px, rgba(139,115,85,0.12) 32px)",
          backgroundPosition: "0 60px",
        }} />
      )}

      {/* ── Body ── */}
      <div style={{
        padding: "20px 24px",
        fontFamily: isPeriodico ? "var(--ff-ui)" : "var(--ff-body)",
        fontSize: isPeriodico ? 14 : 16,
        lineHeight: isPeriodico ? 1.6 : 1.85,
        whiteSpace: "pre-wrap",
        color: "#2A1A08",
        position: "relative", zIndex: 1,
        columns: isPeriodico ? "2" : "1",
        columnGap: isPeriodico ? 24 : undefined,
        fontStyle: isMono ? "italic" : "normal",
      }}>
        {hotspot.content}
      </div>

      {/* ── Key info ── */}
      {hotspot.keyInfo && (
        <div style={{
          margin: "0 24px 20px",
          background: `${cfg.accent}18`,
          borderLeft: `4px solid ${cfg.accent}`,
          padding: "10px 16px",
          fontFamily: "var(--ff-body)",
          fontStyle: "italic",
          fontSize: 14,
          color: "#2A1A08",
          lineHeight: 1.6,
          position: "relative", zIndex: 1,
        }}>
          <strong style={{ fontStyle: "normal" }}>Idea clave:</strong> {hotspot.keyInfo}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        padding: "12px 20px 16px",
        borderTop: `1px solid ${cfg.accent}30`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
        position: "sticky", bottom: 0,
        background: cfg.paper,
        zIndex: 2,
      }}>
        <button
          onClick={onClose}
          style={{
            background: "#2A1A08", color: "#E8D5B0",
            border: "none", padding: "9px 22px",
            fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 2,
            cursor: "pointer", borderRadius: 2, transition: "background 0.18s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#5A3A20"}
          onMouseLeave={e => e.currentTarget.style.background = "#2A1A08"}
        >
          Cerrar ✕
        </button>
        {hotspot.noteLabel && (
          <span style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: 12, color: "#8B7355" }}>
            {hotspot.keyInfo ? "✓ Guardado en el cuaderno" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function EscapeRoom() {
  // ── Persistent state ──
  const [screen,      setScreen]      = useState(() => localStorage.getItem("lc_screen")   || "start");
  const [currentRoom, setCurrentRoom] = useState(() => Math.min(+(localStorage.getItem("lc_room") || 0), ROOMS.length - 1));
  const [foundItems,  setFoundItems]  = useState(() => { try { return JSON.parse(localStorage.getItem("lc_found") || "{}"); } catch { return {}; } });
  const [noteItems,   setNoteItems]   = useState(() => { try { return JSON.parse(localStorage.getItem("lc_notes") || "[]"); } catch { return []; } });
  const [solvedRooms, setSolvedRooms] = useState(() => { try { return JSON.parse(localStorage.getItem("lc_solved") || "[]"); } catch { return []; } });

  // ── Transient state ──
  const [openHotspot, setOpenHotspot] = useState(null);
  const [noteOpen,    setNoteOpen]    = useState(false);
  const [pwInput,     setPwInput]     = useState("");
  const [pwState,     setPwState]     = useState("idle");
  const [tipLevel,    setTipLevel]    = useState(0);
  const [radioMsg,    setRadioMsg]    = useState("");

  const radioTimer  = useRef(null);
  const sfx          = useRef(null);
  const timerRef     = useRef(null);
  const [elapsed,    setElapsed]   = useState(() => {
    const ts = localStorage.getItem('lc_timer_start');
    return ts ? Math.floor((Date.now() - parseInt(ts)) / 1000) : 0;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem('lc_muted') === '1');
  const room = ROOMS[currentRoom];

  // ── Init sounds once ──
  useEffect(() => { sfx.current = createSounds(); }, []);

  // ── Timer: starts when entering game, stops on final ──
  useEffect(() => {
    clearInterval(timerRef.current);
    if (screen === 'game') {
      if (!localStorage.getItem('lc_timer_start')) {
        localStorage.setItem('lc_timer_start', String(Date.now()));
      }
      timerRef.current = setInterval(() => {
        const ts = parseInt(localStorage.getItem('lc_timer_start') || '0');
        setElapsed(Math.floor((Date.now() - ts) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen]);

  // ── Persist muted ──
  useEffect(() => { localStorage.setItem('lc_muted', muted ? '1' : '0'); }, [muted]);

  function play(name) { if (!muted && sfx.current) sfx.current[name]?.(); }

  // ── Persist ──
  useEffect(() => {
    localStorage.setItem("lc_screen",  screen);
    localStorage.setItem("lc_room",    String(currentRoom));
    localStorage.setItem("lc_found",   JSON.stringify(foundItems));
    localStorage.setItem("lc_notes",   JSON.stringify(noteItems));
    localStorage.setItem("lc_solved",  JSON.stringify(solvedRooms));
  }, [screen, currentRoom, foundItems, noteItems, solvedRooms]);

  function showRadio(msg, dur = 6500) {
    clearTimeout(radioTimer.current);
    setRadioMsg(msg);
    radioTimer.current = setTimeout(() => setRadioMsg(""), dur);
  }

  function handleHotspot(hs) {
    play('click');
    setOpenHotspot(hs);
    if (!foundItems[hs.id]) {
      setFoundItems(prev => ({ ...prev, [hs.id]: true }));
      if (!hs.irrelevant && hs.noteLabel) {
        setNoteItems(prev => prev.find(n => n.id === hs.id) ? prev : [...prev, { id: hs.id, label: hs.noteLabel, room: currentRoom }]);
        setTimeout(() => play('found'), 120);
      }
      if (hs.irrelevant) {
        showRadio(hs.content.split(".")[0] + ".", 3500);
      } else if (hs.keyInfo) {
        showRadio(hs.keyInfo, 5500);
      }
    }
  }

  function submitPassword() {
    if (pwState !== "idle") return;
    if (normalizePassword(pwInput) === normalizePassword(room.passwordWord)) {
      play('success');
      setPwState("success");
      setSolvedRooms(prev => prev.includes(currentRoom) ? prev : [...prev, currentRoom]);
      setTimeout(() => {
        play('pageChange');
        if (currentRoom < ROOMS.length - 1) {
          const next = currentRoom + 1;
          setCurrentRoom(next);
          setPwInput(""); setPwState("idle"); setTipLevel(0); setOpenHotspot(null);
          showRadio(ROOMS[next].radioComment, 8000);
        } else {
          setScreen("final");
        }
      }, 1500);
    } else {
      play('error');
      setPwState("error");
      setTimeout(() => setPwState("idle"), 1800);
    }
  }

  function resetGame() {
    const wasMuted = localStorage.getItem('lc_muted');
    localStorage.clear();
    if (wasMuted) localStorage.setItem('lc_muted', wasMuted);
    setScreen("start"); setCurrentRoom(0); setFoundItems({}); setNoteItems([]);
    setSolvedRooms([]); setPwInput(""); setPwState("idle"); setTipLevel(0);
    setRadioMsg(""); setOpenHotspot(null); setNoteOpen(false); setElapsed(0);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // START SCREEN — Buchcover-Ästhetik
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "start") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #7AAFC3 0%, #92BAB8 22%, #A8BEA0 45%, #BAA96E 68%, #A09060 82%, #88785A 100%)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div className="grain" style={{ opacity: 0.022 }} />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "52px 24px 130px", gap: 0 }}>

          <div style={{ fontFamily: "var(--ff-ui)", fontSize: 10, letterSpacing: 4, color: "rgba(15,10,4,0.44)", marginBottom: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Escape Room · Español Q1
          </div>

          <p style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: "clamp(13px,1.6vw,16px)", color: "rgba(15,10,4,0.56)", marginBottom: 12, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            Antonio Skármeta · Alfonso Ruano
          </p>

          <h1 style={{ fontFamily: "var(--ff-hand)", fontSize: "clamp(36px,5vw,58px)", fontWeight: 400, color: "#120E08", lineHeight: 1.1, marginBottom: 48, letterSpacing: "-1px", whiteSpace: "nowrap" }}>
            la composición
          </h1>

          {/* Folded paper — "La Composición de Pedro" */}
          <div style={{ position: "relative", width: 112, height: 148, background: "rgba(242,236,218,0.90)", border: "1px solid rgba(120,95,50,0.22)", borderRadius: 2, boxShadow: "3px 5px 24px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.55)", transform: "rotate(-2.2deg)", marginBottom: 32, flexShrink: 0, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: "14px 10px", backgroundImage: "repeating-linear-gradient(transparent, transparent 16px, rgba(165,145,105,0.24) 16px, rgba(165,145,105,0.24) 17px)", backgroundPosition: "0 20px" }} />
            <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 1, background: "rgba(180,75,75,0.17)" }} />
            <div style={{ position: "absolute", top: 16, left: 26, right: 8, fontFamily: "var(--ff-hand)", fontSize: 12, color: "rgba(28,18,6,0.55)", lineHeight: 2.2 }}>Lo que hace<br />mi familia<br />por las noches...</div>
          </div>

          <p style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(14px,1.8vw,16px)", maxWidth: 440, lineHeight: 1.85, color: "rgba(15,10,4,0.72)", marginBottom: 40, textWrap: "pretty" }}>
            Pedro tiene 9 años. Un capitán del Gobierno entra en su escuela con una misión peligrosa: pedir a los niños que escriban sobre lo que hace su familia por las noches.
          </p>

          <button onClick={() => setScreen("intro")} className="btn-primary" style={{ "--accent": "#C4813A" }}>
            ¡Empieza la aventura!
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 26, alignItems: "center" }}>
            {ROOMS.map((r, i) => (
              <div key={i} title={r.title} style={{ width: 10, height: 10, borderRadius: "50%", background: solvedRooms.includes(i) ? "#5C9E6F" : "rgba(15,10,4,0.18)", border: "1px solid rgba(15,10,4,0.25)", transition: "background 0.4s" }} />
            ))}
          </div>
          <p style={{ fontFamily: "var(--ff-ui)", fontSize: 11, color: "rgba(15,10,4,0.38)", marginTop: 9 }}>
            5 salas · ~25 minutos{solvedRooms.length > 0 ? ` · ${solvedRooms.length}/5 completadas` : ""}
          </p>
          <a href="Contraseñas.html" target="_blank"
            style={{ marginTop: 20, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 3, color: "rgba(15,10,4,0.28)", textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.15)", paddingBottom: 2, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(15,10,4,0.58)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(15,10,4,0.28)"}
          >🖨 Hoja para el/la docente</a>
        </div>

        {/* Soldier silhouettes */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 108, pointerEvents: "none" }}>
          <svg viewBox="0 0 1000 108" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMax slice">
            <rect x="0" y="86" width="1000" height="22" fill="rgba(72,68,46,0.65)" />
            {[
              { x: 52,  s: 0.88, f: false },
              { x: 195, s: 1.0,  f: false },
              { x: 412, s: 0.80, f: true  },
              { x: 715, s: 1.0,  f: true  },
              { x: 898, s: 0.86, f: false },
            ].map((sol, i) => (
              <g key={i} transform={`translate(${sol.f ? sol.x + 58 : sol.x}, ${86 - 78 * sol.s}) scale(${sol.f ? -sol.s : sol.s}, ${sol.s})`}>
                <path d="M14,6 Q29,-2 44,6 L47,17 L11,17 Z" fill="rgba(80,90,56,0.9)" />
                <rect x="9" y="15" width="40" height="5" rx="1" fill="rgba(66,76,44,0.92)" />
                <rect x="19" y="20" width="20" height="15" rx="5" fill="rgba(80,90,56,0.9)" />
                <path d="M13,35 L45,35 L47,80 L11,80 Z" fill="rgba(80,90,56,0.9)" />
                <rect x="11" y="54" width="36" height="5" fill="rgba(58,66,40,0.94)" />
                <path d="M13,43 L1,62" stroke="rgba(66,76,44,0.92)" strokeWidth="7" strokeLinecap="round" fill="none" />
                <rect x="-5" y="44" width="5" height="34" rx="2" transform="rotate(12 -5 44)" fill="rgba(50,44,28,0.92)" />
                <path d="M45,43 L57,58" stroke="rgba(66,76,44,0.92)" strokeWidth="7" strokeLinecap="round" fill="none" />
                <rect x="15" y="80" width="12" height="17" rx="2" fill="rgba(66,76,44,0.92)" />
                <rect x="31" y="80" width="12" height="17" rx="2" fill="rgba(66,76,44,0.92)" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #F0E8D4 0%, #E8DCC4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeUp 0.45s ease forwards" }}>
        <div style={{ maxWidth: 860, width: "100%" }}>
          <div style={{ background: "rgba(196,129,58,0.10)", border: "1px solid rgba(196,129,58,0.40)", padding: "30px 36px", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "#8B4A10", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4813A", animation: "pulse 1.6s infinite" }} />
              EL RADIO DICE:
            </div>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.85, color: "#2A1A08" }}>
              Hola. Soy la radio verde que escucha la familia de Pedro por las noches.<br /><br />
              Pedro es un niño de <strong style={{ color: "#8B4A10" }}>9 años</strong> que vive en Chile en 1973. Desde que los <strong style={{ color: "#8B4A10" }}>militares</strong> tomaron el Gobierno, algo ha cambiado: vecinos detenidos, miedos en silencio, una radio que dice la verdad en secreto.<br /><br />
              Hoy, un capitán entró en su escuela con una misión: pedir a los niños que escriban una composición sobre <em>"lo que hace su familia por las noches."</em><br /><br />
              <strong style={{ color: "#5A3010" }}>Vuestra misión:</strong> explorad cada sala, leed los documentos y encontrad la palabra clave que abre la siguiente sala.
            </p>
          </div>

          <div style={{ background: "rgba(196,129,58,0.10)", border: "1px solid rgba(196,129,58,0.35)", padding: "14px 20px", marginBottom: 28, fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 1, color: "#3A2010", lineHeight: 1.6 }}>
            📓 Usad el <strong style={{ color: "#C4813A" }}>Cuaderno de notas</strong> en la parte de abajo para recordar las pistas importantes.
          </div>

          <button
            onClick={() => { setScreen("game"); showRadio(ROOMS[currentRoom].radioComment, 8000); }}
            className="btn-primary"
            style={{ "--accent": "#C4813A", width: "100%", justifyContent: "center" }}
          >
            Explorar la primera sala →
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "final") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #080E09 0%, #0F1A12 55%, #080E09 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", animation: "fadeUp 0.45s ease forwards" }}>
        <div style={{ fontSize: 60, marginBottom: 24 }}>🏆</div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(28px,6vw,54px)", fontStyle: "italic", color: "#D4A843", marginBottom: 8 }}>
          ¡Lo habéis conseguido!
        </h1>
        <p style={{ fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 5, color: "#5C9E6F", marginBottom: 44 }}>
          LAS CINCO SALAS COMPLETADAS
        </p>

        <div style={{ background: "rgba(92,158,111,0.06)", border: "1px solid rgba(92,158,111,0.28)", padding: "30px 36px", maxWidth: 580, width: "100%", marginBottom: 40, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "#5C9E6F", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5C9E6F", animation: "pulse 1.6s infinite" }} />
            EL RADIO DICE:
          </div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.85, color: "#C9B99A" }}>
            Pedro leyó su composición a sus padres. Una mentira perfecta: una familia normal que juega al ajedrez por las noches.<br /><br />
            El capitán Romo la leyó y escribió: <strong style={{ color: "#D4A843" }}>"¡Bravo! ¡Te felicito!"</strong><br /><br />
            El padre de Pedro sonrió y dijo: <em>"Habrá que comprar un ajedrez, por si las moscas."</em><br /><br />
            Pedro no usó armas. Con nueve años y un lápiz, protegió a su familia. Eso también es <strong style={{ color: "#5C9E6F" }}>resistencia</strong>.
          </p>
        </div>

        {/* Password reveal */}
        <div style={{ marginBottom: 40, maxWidth: 580, width: "100%" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "#C4813A", marginBottom: 14 }}>
            LAS CINCO PALABRAS CLAVE:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {ROOMS.map((r, i) => (
              <div key={r.passwordWord} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${r.accentColor}55`, color: r.accentColor, padding: "8px 18px", fontFamily: "var(--ff-mono)", fontSize: 13, letterSpacing: 2 }}>
                {r.passwordWord}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="btn-primary"
          style={{ "--accent": "#5C9E6F" }}
        >
          Jugar otra vez
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GAME SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  const relevantHotspots  = room.hotspots.filter(h => !h.irrelevant);
  const foundRelevant     = relevantHotspots.filter(h => foundItems[h.id]).length;
  const allFound          = foundRelevant === relevantHotspots.length;

  return (
    <div style={{ minHeight: "100vh", background: room.bgGradient, display: "flex", flexDirection: "column", color: "#E8D5B0", transition: "background 0.9s ease", position: "relative" }}>
      {/* Atmospheric pattern overlay */}
      <div style={{ position: "fixed", inset: 0, background: room.bgPattern, pointerEvents: "none", zIndex: 0, transition: "background 0.9s ease" }} />
      {/* Grain */}
      <div className="grain" style={{ opacity: 0.025 }} />

      {/* ── HEADER ── */}
      <header style={{ position: "relative", zIndex: 10, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${room.accentColor}28`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => setScreen("start")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 1, cursor: "pointer", padding: "4px 0", transition: "color 0.15s", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
        >← Inicio</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 3, color: room.accentColor, textTransform: "uppercase" }}>
            Sala {currentRoom + 1} de 5 · {room.subtitle}
          </div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,22px)", fontWeight: 700, color: "#F0E0C0", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {room.title}
          </div>
        </div>

        {/* Timer */}
        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 2, flexShrink: 0 }}
          title="Tiempo transcurrido">⏱ {formatTime(elapsed)}</div>

        {/* Mute toggle */}
        <button
          onClick={() => setMuted(m => !m)}
          title={muted ? "Activar sonido" : "Silenciar"}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, opacity: muted ? 0.35 : 0.7, transition: "opacity 0.2s", padding: "2px 4px", flexShrink: 0 }}
        >{muted ? "🔇" : "🔊"}</button>

        {/* Progress pills */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
          {ROOMS.map((r, i) => (
            <div key={i} title={r.title} style={{
              height: 10,
              width: i === currentRoom ? 32 : 10,
              borderRadius: 5,
              background: solvedRooms.includes(i) ? "#5C9E6F" : i === currentRoom ? room.accentColor : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
            }} />
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="game-main" style={{ position: "relative", zIndex: 1, flex: 1, padding: "16px 20px 180px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── SCENE COL ── */}
        <div className="game-scene-col">
        <div style={{ position: "relative", width: "100%", paddingBottom: "58%", border: `1px solid ${room.accentColor}1a`, overflow: "hidden", borderRadius: 2 }}>
          {/* Vignette */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", zIndex: 2 }} />

          {/* Room watermark */}
          <div style={{ position: "absolute", bottom: 8, right: 12, fontFamily: "var(--ff-mono)", fontSize: 8, letterSpacing: 3, color: room.accentColor, opacity: 0.25, textTransform: "uppercase", pointerEvents: "none", zIndex: 3 }}>
            {room.title}
          </div>

          {/* Found counter */}
          <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 2, color: allFound ? "#5C9E6F" : room.accentColor, zIndex: 3, background: "rgba(0,0,0,0.45)", padding: "3px 8px", borderRadius: 2 }}>
            {foundRelevant}/{relevantHotspots.length} pistas
          </div>

          {/* HOTSPOTS */}
          {room.hotspots.map(hs => {
            const found = !!foundItems[hs.id];
            return (
              <button
                key={hs.id}
                onClick={() => handleHotspot(hs)}
                className="hotspot"
                style={{
                  position: "absolute",
                  left: `${hs.x}%`, top: `${hs.y}%`,
                  width: `${hs.w}%`, height: `${hs.h}%`,
                  "--room-accent": room.accentColor,
                  background: found ? "rgba(232,222,198,0.92)" : "rgba(242,234,214,0.80)",
                  border: found ? "1px solid rgba(120,95,50,0.55)" : "1px solid rgba(100,80,40,0.28)",
                  zIndex: 2,
                }}
                title={hs.label}
              >
                <span style={{ fontSize: "clamp(16px,2.8vw,26px)", display: "block", lineHeight: 1 }}>{hs.emoji}</span>
                <span style={{ fontFamily: "var(--ff-ui)", fontSize: "clamp(6px,1vw,9px)", color: "rgba(20,14,6,0.82)", textAlign: "center", lineHeight: 1.2, display: "block", fontWeight: 500 }}>{hs.label}</span>
                {found && <span style={{ fontSize: 7, color: "#5A3010", fontFamily: "var(--ff-mono)", marginTop: 1, display: "block" }}>✓</span>}
              </button>
            );
          })}
        </div>
        </div>{/* /game-scene-col */}

        {/* ── PASSWORD COL ── */}
        <div className="game-pw-col">
        <div style={{ background: "rgba(0,0,0,0.42)", border: `1px solid ${room.accentColor}30`, backdropFilter: "blur(10px)", padding: "20px 20px", borderRadius: 2 }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: room.accentColor, marginBottom: 8 }}>
            🔐 CERRADURA DE LA SALA
          </div>
          <p style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: "clamp(14px,2vw,16px)", color: "#C9B99A", marginBottom: 14, lineHeight: 1.5, textWrap: "pretty" }}>
            {room.passwordQuestion}
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); if (pwState === "error") setPwState("idle"); }}
              onKeyDown={e => e.key === "Enter" && submitPassword()}
              placeholder="Escribe la palabra clave..."
              className={`pw-input ${pwState}`}
              style={{ flex: 1 }}
            />
            <button
              onClick={submitPassword}
              className="btn-submit"
              style={{ "--accent": room.accentColor, background: pwState === "success" ? "#5C9E6F" : room.accentColor }}
            >
              {pwState === "success" ? "✓ ¡Correcto!" : pwState === "error" ? "✗ Inténtalo" : "Abrir →"}
            </button>
          </div>

          {tipLevel < 2 && (
            <button
              onClick={() => setTipLevel(t => t + 1)}
              className="btn-tip"
            >
              💡 {tipLevel === 0 ? "Ver una pista" : "Ver pista más concreta"}
            </button>
          )}
          {tipLevel > 0 && (
            <div className="tip-box" style={{ "--accent": room.accentColor, marginTop: 10 }}>
              💡 {tipLevel === 1 ? room.passwordHint1 : room.passwordHint2}
            </div>
          )}
        </div>
        </div>{/* /game-pw-col */}
      </main>

      {/* ── RADIO BUBBLE ── */}
      {radioMsg && (
        <div className="radio-bubble" style={{ "--accent": room.accentColor }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: room.accentColor, marginBottom: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: room.accentColor, animation: "pulse 1.5s infinite" }} />
            EL RADIO DICE:
          </div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: 14, color: "#C9B99A", lineHeight: 1.55 }}>{radioMsg}</p>
        </div>
      )}

      {/* ── NOTEBOOK ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        <button
          onClick={() => setNoteOpen(o => !o)}
          className="notebook-tab"
        >
          <span>📓 Cuaderno de notas</span>
          <span className="note-count">{noteItems.length}</span>
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>{noteOpen ? "▼" : "▲"}</span>
        </button>
        {noteOpen && (
          <div className="notebook-content" style={{ animation: "slideDown 0.2s ease forwards" }}>
            {noteItems.length === 0 ? (
              <p style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", color: "#5A4A3A", fontSize: 13 }}>
                Aún no habéis encontrado nada. Haced clic en los objetos de la sala.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {noteItems.map(n => (
                  <div key={n.id} style={{ fontFamily: "var(--ff-body)", fontSize: 13, color: "#C9B99A", paddingLeft: 10, borderLeft: `2px solid ${ROOMS[n.room].accentColor}`, lineHeight: 1.4 }}>
                    {n.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DOCUMENT MODAL ── */}
      {openHotspot && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease forwards" }}
          onClick={() => setOpenHotspot(null)}
        >
          <DocumentModal hotspot={openHotspot} room={room} onClose={() => setOpenHotspot(null)} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(EscapeRoom));
