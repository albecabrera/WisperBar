// ─── ESCAPE ROOM — REACT COMPONENT ──────────────────────────────────────────
const { useState, useEffect, useRef } = React;
const LEVELS = window.LEVELS;

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
    click:      () => { tone(650, 'sine', 0.1, 0.07); tone(420, 'sine', 0.07, 0.07, 0.04); },
    found:      () => { [392, 523, 659].forEach((f, i) => tone(f, 'sine', 0.18, 0.38, i * 0.14)); },
    error:      () => { tone(190, 'sawtooth', 0.09, 0.22); tone(160, 'sawtooth', 0.07, 0.22, 0.18); },
    success:    () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.2, 0.55, i * 0.13)); },
    pageChange: () => { [280, 360, 460].forEach((f, i) => tone(f, 'sine', 0.1, 0.35, i * 0.1)); },
    levelUp:    () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.22, 0.6, i * 0.15)); },
  };
}

// ─── TIMER HELPER ────────────────────────────────────────────────────────────
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
        maxWidth: "min(760px, 94vw)", width: "100%",
        maxHeight: "92vh", overflowY: "auto",
        animation: "modalIn 0.28s cubic-bezier(0.34,1.3,0.64,1) forwards",
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.15)",
      }}
      onClick={e => e.stopPropagation()}
    >
      {isPeriodico && (
        <div style={{ background: "#1C1C1C", color: "#F0EFEA", padding: "10px 20px", fontFamily: "var(--ff-display)", textAlign: "center", borderBottom: "3px double #888" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, fontFamily: "var(--ff-mono)", color: "#999", marginBottom: 2 }}>REPÚBLICA DE CHILE · EDICIÓN ESPECIAL</div>
          <div style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 700 }}>El Diario del Pueblo</div>
          <div style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: "#999", marginTop: 2, letterSpacing: 2 }}>12 DE OCTUBRE DE 1973</div>
        </div>
      )}
      {isDoc && (
        <div style={{ background: "rgba(139,58,58,0.06)", borderBottom: "2px solid #8B3A3A", padding: "14px 24px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#8B3A3A", marginBottom: 4 }}>{cfg.label}</div>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,19px)", fontWeight: 700, color: "#1C1005" }}>{hotspot.title}</h2>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #8B3A3A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ff-mono)", fontSize: 10, color: "#8B3A3A", flexShrink: 0, marginTop: 2, letterSpacing: 0, textAlign: "center", lineHeight: 1.2 }}>GOB<br/>CHI</div>
        </div>
      )}
      {isCarta && (
        <div style={{ background: "rgba(123,167,188,0.08)", borderBottom: "1px solid rgba(123,167,188,0.4)", padding: "14px 24px 12px" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#7BA7BC", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>{hotspot.title}</h2>
        </div>
      )}
      {isDiario && (
        <div style={{ background: "rgba(139,115,85,0.08)", borderBottom: "2px solid rgba(139,115,85,0.5)", padding: "14px 24px 12px" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#8B7355", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>{hotspot.title}</h2>
        </div>
      )}
      {isMono && (
        <div style={{ background: "rgba(155,107,155,0.08)", borderBottom: "2px solid rgba(155,107,155,0.4)", padding: "14px 24px 12px" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: "#9B6B9B", marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "clamp(15px,3vw,19px)", color: "#1C1005" }}>{hotspot.title}</h2>
        </div>
      )}
      {!isPeriodico && !isDoc && !isCarta && !isDiario && !isMono && (
        <div style={{ borderBottom: `3px solid ${cfg.accent}`, background: `${cfg.accent}0d`, padding: "14px 24px 12px" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: cfg.accent, marginBottom: 6 }}>{cfg.label}</div>
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,19px)", fontWeight: 700, color: "#1C1005" }}>{hotspot.title}</h2>
        </div>
      )}
      {isFoto && (
        <div style={{ margin: "16px 24px 0", background: "#C8C8C8", border: "8px solid #E0E0E0", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 2, color: "#888" }}>
          [ FOTOGRAFÍA — B/N ]
        </div>
      )}
      {isDiario && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(139,115,85,0.12) 31px, rgba(139,115,85,0.12) 32px)", backgroundPosition: "0 60px" }} />
      )}
      <div style={{ padding: "20px 24px", fontFamily: isPeriodico ? "var(--ff-ui)" : "var(--ff-body)", fontSize: isPeriodico ? 14 : 16, lineHeight: isPeriodico ? 1.6 : 1.85, whiteSpace: "pre-wrap", color: "#2A1A08", position: "relative", zIndex: 1, columns: isPeriodico ? "2" : "1", columnGap: isPeriodico ? 24 : undefined, fontStyle: isMono ? "italic" : "normal" }}>
        {hotspot.content}
      </div>
      {hotspot.keyInfo && (
        <div style={{ margin: "0 24px 20px", background: `${cfg.accent}18`, borderLeft: `4px solid ${cfg.accent}`, padding: "10px 16px", fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: 14, color: "#2A1A08", lineHeight: 1.6, position: "relative", zIndex: 1 }}>
          <strong style={{ fontStyle: "normal" }}>Idea clave:</strong> {hotspot.keyInfo}
        </div>
      )}
      <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${cfg.accent}30`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", position: "sticky", bottom: 0, background: cfg.paper, zIndex: 2 }}>
        <button
          onClick={onClose}
          style={{ background: "#2A1A08", color: "#E8D5B0", border: "none", padding: "9px 22px", fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 2, cursor: "pointer", borderRadius: 2, transition: "background 0.18s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#5A3A20"}
          onMouseLeave={e => e.currentTarget.style.background = "#2A1A08"}
        >Cerrar ✕</button>
        {hotspot.keyInfo && hotspot.noteLabel && (
          <span style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: 12, color: "#8B7355" }}>✓ Guardado en el cuaderno</span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function EscapeRoom() {
  // ── One-time init helpers ──
  const initLevel = Math.min(+(localStorage.getItem("lc_level") || 0), LEVELS.length - 1);

  // ── Persistent state ──
  const [currentLevel,    setCurrentLevel]    = useState(initLevel);
  const [levelsCompleted, setLevelsCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lc_levels_done") || "[]"); } catch { return []; }
  });
  const [screen, setScreen] = useState(() => {
    const s = localStorage.getItem("lc_screen") || "start";
    return s === "levelcomplete" ? "start" : s;
  });
  const [currentRoom, setCurrentRoom] = useState(() => {
    const r = localStorage.getItem(`lc_room_${initLevel}`);
    return r ? Math.min(+r, LEVELS[initLevel].rooms.length - 1) : 0;
  });
  const [foundItems, setFoundItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lc_found_${initLevel}`) || "{}"); } catch { return {}; }
  });
  const [noteItems, setNoteItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lc_notes_${initLevel}`) || "[]"); } catch { return []; }
  });
  const [solvedRooms, setSolvedRooms] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lc_solved_${initLevel}`) || "[]"); } catch { return []; }
  });

  // ── Transient state ──
  const [openHotspot, setOpenHotspot] = useState(null);
  const [noteOpen,    setNoteOpen]    = useState(false);
  const [pwInput,     setPwInput]     = useState("");
  const [pwState,     setPwState]     = useState("idle");
  const [tipLevel,    setTipLevel]    = useState(0);
  const [radioMsg,    setRadioMsg]    = useState("");

  const radioTimer = useRef(null);
  const sfx        = useRef(null);
  const timerRef   = useRef(null);
  const [elapsed, setElapsed] = useState(() => {
    const ts = localStorage.getItem('lc_timer_start');
    return ts ? Math.floor((Date.now() - parseInt(ts)) / 1000) : 0;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem('lc_muted') === '1');

  const level = LEVELS[currentLevel];
  const room  = level.rooms[currentRoom];

  // ── Effects ──
  useEffect(() => { sfx.current = createSounds(); }, []);

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

  useEffect(() => { localStorage.setItem('lc_muted', muted ? '1' : '0'); }, [muted]);

  useEffect(() => {
    localStorage.setItem("lc_screen",  screen);
    localStorage.setItem("lc_level",   String(currentLevel));
    localStorage.setItem(`lc_room_${currentLevel}`,  String(currentRoom));
    localStorage.setItem(`lc_found_${currentLevel}`, JSON.stringify(foundItems));
    localStorage.setItem(`lc_notes_${currentLevel}`, JSON.stringify(noteItems));
    localStorage.setItem(`lc_solved_${currentLevel}`, JSON.stringify(solvedRooms));
  }, [screen, currentLevel, currentRoom, foundItems, noteItems, solvedRooms]);

  useEffect(() => {
    localStorage.setItem("lc_levels_done", JSON.stringify(levelsCompleted));
  }, [levelsCompleted]);

  // ── Helpers ──
  function play(name) { if (!muted && sfx.current) sfx.current[name]?.(); }

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
        setNoteItems(prev => prev.find(n => n.id === hs.id) ? prev : [...prev, { id: hs.id, label: hs.noteLabel, room: currentRoom, level: currentLevel }]);
        setTimeout(() => play('found'), 120);
      }
      if (hs.irrelevant) showRadio(hs.content.split(".")[0] + ".", 3500);
      else if (hs.keyInfo) showRadio(hs.keyInfo, 5500);
    }
  }

  function submitPassword() {
    if (pwState !== "idle") return;
    const capLevel = currentLevel;
    const capRoom  = currentRoom;
    const capLevelObj = LEVELS[capLevel];

    if (normalizePassword(pwInput) === normalizePassword(room.passwordWord)) {
      play('success');
      setPwState("success");
      setSolvedRooms(prev => prev.includes(capRoom) ? prev : [...prev, capRoom]);
      setTimeout(() => {
        play('pageChange');
        if (capRoom < capLevelObj.rooms.length - 1) {
          const next = capRoom + 1;
          setCurrentRoom(next);
          setPwInput(""); setPwState("idle"); setTipLevel(0); setOpenHotspot(null);
          showRadio(capLevelObj.rooms[next].radioComment, 8000);
        } else {
          setLevelsCompleted(prev => prev.includes(capLevel) ? prev : [...prev, capLevel]);
          play('levelUp');
          if (capLevel >= LEVELS.length - 1) {
            setScreen("final");
          } else {
            setScreen("levelcomplete");
          }
        }
      }, 1500);
    } else {
      play('error');
      setPwState("error");
      setTimeout(() => setPwState("idle"), 1800);
    }
  }

  function selectLevel(lvl) {
    const savedRoom = Math.min(+(localStorage.getItem(`lc_room_${lvl}`) || 0), LEVELS[lvl].rooms.length - 1);
    setCurrentLevel(lvl);
    setCurrentRoom(savedRoom);
    try { setFoundItems(JSON.parse(localStorage.getItem(`lc_found_${lvl}`) || "{}")); } catch { setFoundItems({}); }
    try { setNoteItems(JSON.parse(localStorage.getItem(`lc_notes_${lvl}`) || "[]")); } catch { setNoteItems([]); }
    try { setSolvedRooms(JSON.parse(localStorage.getItem(`lc_solved_${lvl}`) || "[]")); } catch { setSolvedRooms([]); }
    setPwInput(""); setPwState("idle"); setTipLevel(0); setOpenHotspot(null); setNoteOpen(false);
    setScreen("intro");
  }

  function resetGame() {
    const wasMuted = localStorage.getItem('lc_muted');
    localStorage.clear();
    if (wasMuted) localStorage.setItem('lc_muted', wasMuted);
    setScreen("start"); setCurrentLevel(0); setCurrentRoom(0); setFoundItems({});
    setNoteItems([]); setSolvedRooms([]); setLevelsCompleted([]);
    setPwInput(""); setPwState("idle"); setTipLevel(0);
    setRadioMsg(""); setOpenHotspot(null); setNoteOpen(false); setElapsed(0);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // START SCREEN — level selection
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "start") {
    const getLevelSolved = (lvl) => {
      try { return JSON.parse(localStorage.getItem(`lc_solved_${lvl}`) || "[]"); } catch { return []; }
    };
    const totalSolved = LEVELS.reduce((acc, _, i) => acc + getLevelSolved(i).length, 0);
    const totalRooms  = LEVELS.reduce((acc, l) => acc + l.rooms.length, 0);

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #7AAFC3 0%, #92BAB8 22%, #A8BEA0 45%, #BAA96E 68%, #A09060 82%, #88785A 100%)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div className="grain" style={{ opacity: 0.022 }} />

        {/* Book cover header */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 24px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--ff-ui)", fontSize: 10, letterSpacing: 4, color: "rgba(15,10,4,0.44)", marginBottom: 8, textTransform: "uppercase" }}>
            Escape Room · Español Q1
          </div>
          <p style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: "clamp(13px,1.5vw,15px)", color: "rgba(15,10,4,0.52)", marginBottom: 10, letterSpacing: "0.5px" }}>
            Antonio Skármeta · Alfonso Ruano
          </p>
          <h1 style={{ fontFamily: "var(--ff-hand)", fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 400, color: "#120E08", lineHeight: 1.1, marginBottom: 20, letterSpacing: "-1px" }}>
            la composición
          </h1>

          {/* Folded paper */}
          <div style={{ position: "relative", width: 86, height: 114, background: "rgba(242,236,218,0.90)", border: "1px solid rgba(120,95,50,0.22)", borderRadius: 2, boxShadow: "3px 5px 24px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.55)", transform: "rotate(-2.2deg)", marginBottom: 18, flexShrink: 0, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: "10px 8px", backgroundImage: "repeating-linear-gradient(transparent, transparent 14px, rgba(165,145,105,0.24) 14px, rgba(165,145,105,0.24) 15px)", backgroundPosition: "0 18px" }} />
            <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 1, background: "rgba(180,75,75,0.17)" }} />
            <div style={{ position: "absolute", top: 12, left: 20, right: 6, fontFamily: "var(--ff-hand)", fontSize: 10, color: "rgba(28,18,6,0.55)", lineHeight: 2.1 }}>Lo que hace<br />mi familia<br />por las noches...</div>
          </div>

          <p style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(13px,1.6vw,15px)", maxWidth: 480, lineHeight: 1.85, color: "rgba(15,10,4,0.68)", marginBottom: 8 }}>
            Pedro tiene 9 años. Un capitán del Gobierno entra en su escuela con una misión peligrosa.
          </p>

          {totalSolved > 0 && (
            <div style={{ fontFamily: "var(--ff-mono)", fontSize: 11, color: "rgba(15,10,4,0.42)", marginBottom: 4, letterSpacing: 1 }}>
              {totalSolved}/{totalRooms} salas completadas en total
            </div>
          )}
        </div>

        {/* Level cards */}
        <div style={{ width: "100%", maxWidth: 920, padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "rgba(15,10,4,0.38)", textAlign: "center", marginBottom: 4, textTransform: "uppercase" }}>
            Elige tu nivel
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {LEVELS.map((lvl, i) => {
              const solved       = getLevelSolved(i);
              const isCompleted  = levelsCompleted.includes(i);
              const isLocked     = i > 0 && !levelsCompleted.includes(i - 1);
              const inProgress   = !isLocked && !isCompleted && solved.length > 0;
              const accent       = lvl.accentColor;

              return (
                <div key={i} style={{
                  flex: "1 1 240px", maxWidth: 288,
                  background: isLocked ? "rgba(10,8,4,0.42)" : "rgba(10,8,4,0.58)",
                  border: `1px solid ${isLocked ? "rgba(255,255,255,0.08)" : isCompleted ? accent + "88" : accent + "44"}`,
                  backdropFilter: "blur(12px)",
                  borderRadius: 3,
                  padding: "20px 20px 18px",
                  opacity: isLocked ? 0.58 : 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                  onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4)`; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  onClick={() => !isLocked && selectLevel(i)}
                >
                  {/* Accent glow */}
                  {!isLocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: isCompleted ? accent : `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: isCompleted ? 0.9 : 0.6 }} />}

                  {/* Status badge */}
                  {isCompleted && (
                    <div style={{ position: "absolute", top: 12, right: 14, background: accent + "22", border: `1px solid ${accent}55`, color: accent, fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 2, padding: "3px 8px", borderRadius: 2 }}>
                      ✓ COMPLETADO
                    </div>
                  )}
                  {isLocked && (
                    <div style={{ position: "absolute", top: 12, right: 14, color: "rgba(255,255,255,0.2)", fontSize: 18 }}>🔒</div>
                  )}

                  <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 3, color: isLocked ? "rgba(255,255,255,0.22)" : accent, marginBottom: 6, textTransform: "uppercase" }}>
                    {String(i + 1).padStart(2, "0")} · {lvl.title}
                  </div>
                  <div style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(16px,2.2vw,20px)", fontWeight: 700, color: isLocked ? "rgba(232,213,176,0.3)" : "#F0E0C0", lineHeight: 1.2, marginBottom: 4 }}>
                    {lvl.subtitle}
                  </div>
                  <div style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: "clamp(12px,1.4vw,13px)", color: isLocked ? "rgba(201,185,154,0.3)" : "rgba(201,185,154,0.7)", marginBottom: 14, lineHeight: 1.4 }}>
                    {lvl.detail}
                  </div>

                  {/* Room progress dots */}
                  <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                    {lvl.rooms.map((_, ri) => (
                      <div key={ri} style={{
                        width: ri === (isCompleted ? lvl.rooms.length - 1 : solved.length - 1) && !isLocked ? 20 : 8,
                        height: 8, borderRadius: 4,
                        background: isLocked ? "rgba(255,255,255,0.06)" : isCompleted ? accent : solved.includes(ri) ? accent + "cc" : "rgba(255,255,255,0.14)",
                        transition: "all 0.35s ease",
                      }} />
                    ))}
                  </div>

                  {!isLocked && (
                    <button
                      className="btn-primary"
                      style={{ "--accent": accent, width: "100%", justifyContent: "center", fontSize: 12, padding: "10px 16px", letterSpacing: 2, pointerEvents: "none" }}
                    >
                      {isCompleted ? "Repasar nivel" : inProgress ? `Continuar · Sala ${solved.length + 1}` : "Empezar →"}
                    </button>
                  )}
                  {isLocked && (
                    <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 1, color: "rgba(255,255,255,0.18)", textAlign: "center" }}>
                      Completa el Nivel {i} primero
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ paddingBottom: 36, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 2, color: "rgba(15,10,4,0.30)" }}>🖨 Docente:</span>
            {[
              { href: "Contraseñas.html",  label: "Nivel 1" },
              { href: "Contraseñas2.html", label: "Nivel 2" },
              { href: "Contraseñas3.html", label: "Nivel 3" },
            ].map(({ href, label }) => (
              <a key={label} href={href} target="_blank"
                style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 2, color: "rgba(15,10,4,0.30)", textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.14)", paddingBottom: 1, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(15,10,4,0.58)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(15,10,4,0.30)"}
              >{label}</a>
            ))}
          </div>
          {totalSolved > 0 && (
            <button onClick={resetGame}
              style={{ background: "transparent", border: "none", fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 3, color: "rgba(15,10,4,0.22)", cursor: "pointer", textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.1)", paddingBottom: 2, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(139,58,58,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(15,10,4,0.22)"}
            >↺ Reiniciar todo</button>
          )}
        </div>

        {/* Soldier silhouettes */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 108, pointerEvents: "none" }}>
          <svg viewBox="0 0 1000 108" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMax slice">
            <rect x="0" y="86" width="1000" height="22" fill="rgba(72,68,46,0.65)" />
            {[{ x: 52, s: 0.88, f: false }, { x: 195, s: 1.0, f: false }, { x: 412, s: 0.80, f: true }, { x: 715, s: 1.0, f: true }, { x: 898, s: 0.86, f: false }].map((sol, i) => (
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
  // INTRO SCREEN — per-level
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "intro") {
    const introLines = level.introText.split("\n\n");
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #F0E8D4 0%, #E8DCC4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeUp 0.45s ease forwards" }}>
        <div style={{ maxWidth: 860, width: "100%" }}>

          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: level.accentColor, marginBottom: 14, textTransform: "uppercase" }}>
            {level.title} · {level.subtitle}
          </div>

          <div style={{ background: "rgba(196,129,58,0.10)", border: "1px solid rgba(196,129,58,0.40)", padding: "26px 32px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "#8B4A10", marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4813A", animation: "pulse 1.6s infinite" }} />
              EL RADIO DICE:
            </div>
            <div style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.85, color: "#2A1A08" }}>
              {introLines.map((para, i) => (
                <p key={i} style={{ marginBottom: i < introLines.length - 1 ? 14 : 0 }}>{para}</p>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(196,129,58,0.10)", border: "1px solid rgba(196,129,58,0.35)", padding: "14px 20px", marginBottom: 24, fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 1, color: "#3A2010", lineHeight: 1.6 }}>
            {level.introTip}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => { setScreen("game"); showRadio(level.rooms[currentRoom].radioComment, 8000); }}
              className="btn-primary"
              style={{ "--accent": level.accentColor, flex: 1, justifyContent: "center", minWidth: 200 }}
            >
              {level.introButton}
            </button>
            <button
              onClick={() => setScreen("start")}
              style={{ background: "transparent", border: "1px solid rgba(58,32,16,0.25)", color: "rgba(58,32,16,0.55)", padding: "13px 22px", fontFamily: "var(--ff-mono)", fontSize: 12, letterSpacing: 2, cursor: "pointer", borderRadius: 2, transition: "border-color 0.18s, color 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(58,32,16,0.5)"; e.currentTarget.style.color = "rgba(58,32,16,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(58,32,16,0.25)"; e.currentTarget.style.color = "rgba(58,32,16,0.55)"; }}
            >← Elegir nivel</button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // LEVEL COMPLETE SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "levelcomplete") {
    const nextLevel = LEVELS[currentLevel + 1];
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(155deg, #080E09 0%, #0F1A12 55%, #080E09 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", animation: "fadeUp 0.45s ease forwards" }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🏅</div>
        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 5, color: level.accentColor, marginBottom: 10 }}>
          {level.title.toUpperCase()} COMPLETADO
        </div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(24px,5vw,46px)", fontStyle: "italic", color: level.accentColor, marginBottom: 8 }}>
          {level.subtitle}
        </h1>
        <p style={{ fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>
          5 salas · {formatTime(elapsed)}
        </p>

        <div style={{ background: `rgba(0,0,0,0.35)`, border: `1px solid ${level.accentColor}30`, padding: "22px 28px", maxWidth: 520, width: "100%", marginBottom: 32, textAlign: "left" }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: level.accentColor, marginBottom: 14 }}>
            CONTRASEÑAS DEL {level.title.toUpperCase()}:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {level.rooms.map((r) => (
              <div key={r.passwordWord} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${r.accentColor}55`, color: r.accentColor, padding: "6px 14px", fontFamily: "var(--ff-mono)", fontSize: 12, letterSpacing: 2 }}>
                {r.passwordWord}
              </div>
            ))}
          </div>
        </div>

        {nextLevel && (
          <div style={{ background: `rgba(0,0,0,0.28)`, border: `1px solid ${nextLevel.accentColor}30`, padding: "16px 24px", maxWidth: 520, width: "100%", marginBottom: 32, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 3, color: nextLevel.accentColor, marginBottom: 6 }}>SIGUIENTE: {nextLevel.title.toUpperCase()}</div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: 18, color: "#F0E0C0", fontWeight: 700, marginBottom: 2 }}>{nextLevel.subtitle}</div>
            <div style={{ fontFamily: "var(--ff-body)", fontStyle: "italic", fontSize: 13, color: "rgba(201,185,154,0.65)" }}>{nextLevel.detail}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {nextLevel && (
            <button onClick={() => selectLevel(currentLevel + 1)} className="btn-primary" style={{ "--accent": nextLevel.accentColor }}>
              Continuar con {nextLevel.title} →
            </button>
          )}
          <button
            onClick={() => setScreen("start")}
            style={{ background: "transparent", border: `1px solid ${level.accentColor}44`, color: level.accentColor, padding: "13px 28px", fontFamily: "var(--ff-mono)", fontSize: 12, letterSpacing: 2, cursor: "pointer", borderRadius: 2, transition: "border-color 0.18s" }}
          >Volver al inicio</button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL SCREEN — all levels complete
  // ────────────────────────────────────────────────────────────────────────────
  if (screen === "final") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #080E09 0%, #0F1A12 55%, #080E09 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", animation: "fadeUp 0.45s ease forwards" }}>
        <div style={{ fontSize: 60, marginBottom: 24 }}>🏆</div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(28px,6vw,54px)", fontStyle: "italic", color: "#D4A843", marginBottom: 8 }}>
          ¡Lo habéis conseguido!
        </h1>
        <p style={{ fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 5, color: "#5C9E6F", marginBottom: 44 }}>
          LOS TRES NIVELES COMPLETADOS
        </p>

        <div style={{ background: "rgba(92,158,111,0.06)", border: "1px solid rgba(92,158,111,0.28)", padding: "26px 32px", maxWidth: 580, width: "100%", marginBottom: 36, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 4, color: "#5C9E6F", marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5C9E6F", animation: "pulse 1.6s infinite" }} />
            EL RADIO DICE:
          </div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.85, color: "#C9B99A" }}>
            Pedro leyó su composición a sus padres. Una mentira perfecta: una familia normal que juega al ajedrez por las noches.<br /><br />
            El capitán Romo la leyó y escribió: <strong style={{ color: "#D4A843" }}>"¡Bravo! ¡Te felicito!"</strong><br /><br />
            El padre de Pedro sonrió: <em>"Habrá que comprar un ajedrez, por si las moscas."</em><br /><br />
            Pedro no usó armas. Con nueve años y un lápiz, protegió a su familia. Eso también es <strong style={{ color: "#5C9E6F" }}>resistencia</strong>.<br /><br />
            Antonio Skármeta lo vivió. Por eso pudo escribirlo. <em>«Muy pronto se abrirán las grandes alamedas.»</em>
          </p>
        </div>

        {/* All passwords by level */}
        <div style={{ maxWidth: 580, width: "100%", marginBottom: 40 }}>
          {LEVELS.map((lvl, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 4, color: lvl.accentColor, marginBottom: 8 }}>
                {lvl.title.toUpperCase()} — {lvl.subtitle.toUpperCase()}:
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {lvl.rooms.map(r => (
                  <div key={r.passwordWord} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${r.accentColor}55`, color: r.accentColor, padding: "6px 14px", fontFamily: "var(--ff-mono)", fontSize: 12, letterSpacing: 2 }}>
                    {r.passwordWord}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={resetGame} className="btn-primary" style={{ "--accent": "#5C9E6F" }}>
          Jugar otra vez
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GAME SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  const relevantHotspots = room.hotspots.filter(h => !h.irrelevant);
  const foundRelevant    = relevantHotspots.filter(h => foundItems[h.id]).length;
  const allFound         = foundRelevant === relevantHotspots.length;

  return (
    <div style={{ minHeight: "100vh", background: room.bgGradient, display: "flex", flexDirection: "column", color: "#E8D5B0", transition: "background 0.9s ease", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: room.bgPattern, pointerEvents: "none", zIndex: 0, transition: "background 0.9s ease" }} />
      <div className="grain" style={{ opacity: 0.025 }} />

      {/* ── HEADER ── */}
      <header style={{ position: "relative", zIndex: 10, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${room.accentColor}28`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => setScreen("start")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: 1, cursor: "pointer", padding: "4px 0", transition: "color 0.15s", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
        >← Inicio</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 3, color: room.accentColor, textTransform: "uppercase" }}>
            {level.title} · Sala {currentRoom + 1} de 5 · {room.subtitle}
          </div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(15px,3vw,22px)", fontWeight: 700, color: "#F0E0C0", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {room.title}
          </div>
        </div>

        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 2, flexShrink: 0 }} title="Tiempo transcurrido">⏱ {formatTime(elapsed)}</div>

        <button onClick={() => setMuted(m => !m)} title={muted ? "Activar sonido" : "Silenciar"}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, opacity: muted ? 0.35 : 0.7, transition: "opacity 0.2s", padding: "2px 4px", flexShrink: 0 }}
        >{muted ? "🔇" : "🔊"}</button>

        {/* Progress pills: rooms in current level */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
          {level.rooms.map((r, i) => (
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
          <div className="game-scene" style={{ position: "relative", width: "100%", paddingBottom: "58%", border: `1px solid ${room.accentColor}1a`, overflow: "hidden", borderRadius: 2 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", zIndex: 2 }} />
            <div style={{ position: "absolute", bottom: 8, right: 12, fontFamily: "var(--ff-mono)", fontSize: 8, letterSpacing: 3, color: room.accentColor, opacity: 0.25, textTransform: "uppercase", pointerEvents: "none", zIndex: 3 }}>{room.title}</div>
            <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--ff-mono)", fontSize: 10, letterSpacing: 2, color: allFound ? "#5C9E6F" : room.accentColor, zIndex: 3, background: "rgba(0,0,0,0.45)", padding: "3px 8px", borderRadius: 2 }}>
              {foundRelevant}/{relevantHotspots.length} pistas
            </div>

            {/* Padlock */}
            <div style={{ position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)", zIndex: 4, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                background: solvedRooms.includes(currentRoom) ? "rgba(92,158,111,0.18)" : "rgba(0,0,0,0.42)",
                border: `1.5px solid ${solvedRooms.includes(currentRoom) ? "rgba(92,158,111,0.55)" : room.accentColor + "44"}`,
                borderRadius: 12,
                padding: "7px 14px 6px",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                transition: "background 0.6s ease, border-color 0.6s ease",
              }}>
                <span
                  key={`lock-${currentRoom}-${pwState}`}
                  style={{
                    fontSize: "clamp(22px, 3.2vw, 36px)",
                    lineHeight: 1,
                    display: "block",
                    animation: pwState === "success" ? "padlockUnlock 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
                    filter: solvedRooms.includes(currentRoom) ? "drop-shadow(0 0 6px rgba(92,158,111,0.75))" : "none",
                  }}
                >
                  {solvedRooms.includes(currentRoom) ? "🔓" : "🔒"}
                </span>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "clamp(5px, 0.75vw, 8px)", letterSpacing: 2, color: solvedRooms.includes(currentRoom) ? "#5C9E6F" : room.accentColor + "88", textTransform: "uppercase" }}>
                  {solvedRooms.includes(currentRoom) ? "abierta" : "cerrada"}
                </span>
              </div>
            </div>

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
              <button onClick={() => setTipLevel(t => t + 1)} className="btn-tip">
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
        <button onClick={() => setNoteOpen(o => !o)} className="notebook-tab">
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
                {noteItems.map(n => {
                  const noteLvl  = n.level !== undefined ? n.level : 0;
                  const noteAcc  = LEVELS[noteLvl]?.rooms[n.room]?.accentColor || "#C4813A";
                  return (
                    <div key={n.id} style={{ fontFamily: "var(--ff-body)", fontSize: 13, color: "#C9B99A", paddingLeft: 10, borderLeft: `2px solid ${noteAcc}`, lineHeight: 1.4 }}>
                      {n.label}
                    </div>
                  );
                })}
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
