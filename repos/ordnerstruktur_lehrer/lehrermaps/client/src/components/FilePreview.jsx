import { useState, useEffect, useRef } from 'react';
import FileBadge from './FileBadge';
import { detectKind } from '../constants/structure';
import { downloadFile, viewFile, previewFile } from '../lib/api';

export default function FilePreview({ file, accent = '#E8472A' }) {
  const border = '#E5E7EB';
  const surface = '#F8F9FB';
  const muted = '#6B7280';

  if (!file) {
    return (
      <div style={{
        height: '100%', background: surface, borderLeft: `1px solid ${border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', color: muted, fontSize: 12,
        padding: 24, textAlign: 'center', gap: 8,
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
          <rect x="6" y="4" width="16" height="20" rx="2" stroke={muted} strokeWidth="1.5"/>
          <path d="M10 10h8M10 14h8M10 18h5" stroke={muted} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ color: '#9CA3AF' }}>Datei auswählen<br/>zum Anzeigen</span>
      </div>
    );
  }

  const kind = detectKind(file.original_name);
  const sizeFmt = formatBytes(file.size_bytes);
  const dateFmt = file.uploaded_at
    ? new Date(file.uploaded_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const ext = file.original_name.split('.').pop().toLowerCase();
  const convertible = new Set(['doc', 'docx', 'odt', 'rtf', 'ppt', 'pptx', 'odp', 'xls', 'xlsx', 'ods']);
  const canOpenInline = ['pdf', 'img', 'video', 'audio', 'text', 'markdown', 'code', 'notebook'].includes(kind)
    || convertible.has(ext);

  return (
    <div style={{
      height: '100%', background: surface, borderLeft: `1px solid ${border}`,
      display: 'flex', flexDirection: 'column', color: '#111827',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${border}`,
        display: 'flex', gap: 10, alignItems: 'flex-start', flexShrink: 0,
      }}>
        <FileBadge kind={kind} name={file.original_name} size={32} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, lineHeight: 1.3,
            wordBreak: 'break-word', color: '#111827',
          }}>{file.original_name}</div>
          <div style={{
            fontSize: 11, color: muted, marginTop: 3,
            fontFamily: '"DM Mono", monospace',
          }}>{sizeFmt} · {dateFmt}</div>
        </div>
      </div>

      {/* Preview surface */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <PreviewSurface file={file} kind={kind} accent={accent} />
      </div>

      {/* Actions */}
      <div style={{
        padding: '10px 14px', borderTop: `1px solid ${border}`,
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        {canOpenInline && (
          <a
            href={convertible.has(ext) ? previewFile(file.id) : viewFile(file.id)}
            target="_blank"
            rel="noreferrer"
            style={btnStyle('#374151', '#F3F4F6')}
          >Im Browser öffnen</a>
        )}
        <a
          href={downloadFile(file.id)}
          target="_blank"
          rel="noreferrer"
          style={btnStyle('#fff', accent)}
        >Herunterladen</a>
      </div>
    </div>
  );
}

function btnStyle(color, bg) {
  return {
    height: 28, padding: '0 14px', border: 'none', borderRadius: 6,
    background: bg, color, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
    display: 'flex', alignItems: 'center',
  };
}

function PreviewSurface({ file, kind, accent }) {
  const src = viewFile(file.id);

  if (kind === 'pdf') {
    return (
      <iframe
        src={src}
        title={file.original_name}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    );
  }

  if (kind === 'img') {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#F3F4F6', padding: 12, boxSizing: 'border-box',
      }}>
        <img
          src={src}
          alt={file.original_name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }}
        />
      </div>
    );
  }

  if (kind === 'video') {
    return (
      <video
        controls
        src={src}
        style={{ width: '100%', height: '100%', background: '#000', display: 'block' }}
      />
    );
  }

  if (kind === 'audio') {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, background: '#F8F9FB', padding: 24, boxSizing: 'border-box',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill={`${accent}18`}/>
          <path d="M17 28V12l18-4v16" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="11" cy="28" r="5" stroke={accent} strokeWidth="1.8"/>
          <circle cx="29" cy="24" r="5" stroke={accent} strokeWidth="1.8"/>
        </svg>
        <audio controls src={src} style={{ width: '100%' }} />
      </div>
    );
  }

  if (kind === 'text' || kind === 'markdown' || kind === 'code' || kind === 'notebook') {
    return <TextPreview src={src} />;
  }

  if (kind === 'doc' || kind === 'slide') {
    const ext = file.original_name.split('.').pop().toLowerCase();
    const convertible = new Set(['doc', 'docx', 'odt', 'rtf', 'ppt', 'pptx', 'odp']);
    if (convertible.has(ext)) {
      return <ConvertedPdfPreview fileId={file.id} />;
    }
    return <FallbackPreview file={file} kind={kind} accent={accent} />;
  }

  // sheet, archive — browser can't render natively
  return <FallbackPreview file={file} kind={kind} accent={accent} />;
}

function TextPreview({ src }) {
  const [content, setContent] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setContent(null);
    setErr(false);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
      })
      .then(setContent)
      .catch(() => setErr(true));
  }, [src]);

  if (err) return (
    <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF' }}>Vorschau nicht verfügbar</div>
  );
  if (!content) return (
    <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF' }}>Lädt…</div>
  );

  return (
    <pre style={{
      margin: 0, width: '100%', height: '100%', padding: 14, boxSizing: 'border-box',
      background: '#1F2937', color: '#e8e8ea', overflow: 'auto',
      fontFamily: '"DM Mono", ui-monospace, monospace', fontSize: 11, lineHeight: 1.7,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>
      {content.length > 60000 ? content.slice(0, 60000) + '\n\n[…Datei abgeschnitten]' : content}
    </pre>
  );
}

function DocxPreview({ src }) {
  const containerRef = useRef(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr(false);
    let cancelled = false;

    import('docx-preview').then(({ renderAsync }) => {
      return fetch(src)
        .then((r) => {
          if (!r.ok) throw new Error('fetch failed');
          return r.arrayBuffer();
        })
        .then((buf) => {
          if (cancelled || !containerRef.current) return;
          containerRef.current.innerHTML = '';
          return renderAsync(buf, containerRef.current, undefined, {
            className: 'docx-preview',
            inWrapper: false,
            ignoreWidth: true,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
          });
        });
    })
      .then(() => { if (!cancelled) setLoading(false); })
      .catch(() => { if (!cancelled) { setErr(true); setLoading(false); } });

    return () => { cancelled = true; };
  }, [src]);

  if (err) return (
    <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF' }}>Vorschau nicht verfügbar</div>
  );

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#525659', position: 'relative' }}>
      {loading && (
        <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF', background: '#F8F9FB' }}>Lädt…</div>
      )}
      <div
        ref={containerRef}
        style={{ padding: '12px 8px', boxSizing: 'border-box' }}
      />
    </div>
  );
}

function ConvertedPdfPreview({ fileId }) {
  const [state, setState] = useState('loading');
  const src = previewFile(fileId);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {state === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 8,
          background: '#F8F9FB', fontSize: 12, color: '#6B7280',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="10" cy="10" r="8" stroke="#E5E7EB" strokeWidth="2"/>
            <path d="M10 2a8 8 0 0 1 8 8" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Wird konvertiert…
        </div>
      )}
      {state === 'error' && (
        <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF' }}>Konvertierung fehlgeschlagen</div>
      )}
      <iframe
        src={src}
        title="Vorschau"
        style={{ width: '100%', height: '100%', border: 'none', display: state === 'ready' ? 'block' : 'none' }}
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
      />
    </div>
  );
}

function FallbackPreview({ file, kind, accent }) {
  const labels = {
    doc: 'Word-Dokument', slide: 'Präsentation', sheet: 'Tabelle',
    archive: 'Archiv', notebook: 'Notebook',
  };
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 12,
      background: '#F8F9FB', padding: 24, boxSizing: 'border-box',
    }}>
      <FileBadge kind={kind} name={file.original_name} size={48} />
      <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
        {labels[kind] || 'Datei'} · Keine Browser-Vorschau
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
        Zum Öffnen herunterladen
      </div>
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
