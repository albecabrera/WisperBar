import { useState } from 'react';
import FileBadge from './FileBadge';
import { detectKind } from '../constants/structure';
import { downloadFile } from '../lib/api';

export default function FileTable({
  files, activeFileId, onFileSelect, accent = '#E8472A',
  query, onDelete, onUpload,
}) {
  const [menuFile, setMenuFile] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const filtered = query
    ? files.filter((f) => f.original_name.toLowerCase().includes(query.toLowerCase()))
    : files;

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setMenuFile(file);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ position: 'relative' }}>
      {filtered.length === 0 ? (
        <EmptyState query={query} accent={accent} onUpload={onUpload} />
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB',
          borderRadius: 12, overflow: 'hidden',
          containerType: 'inline-size',
        }}>
          {/* Table header */}
          <div className="lm-filerow" style={{
            padding: '8px 16px', borderBottom: '1px solid #E5E7EB',
            fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
            textTransform: 'uppercase', color: '#9CA3AF',
          }}>
            <span />
            <span>Name</span>
            <span className="lm-col-size">Größe</span>
            <span className="lm-col-date">Datum</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((file, i) => {
            const on = file.id === activeFileId;
            const kind = detectKind(file.original_name);
            const sizeFmt = file.size_bytes ? formatBytes(file.size_bytes) : '—';
            const dateFmt = file.uploaded_at
              ? new Date(file.uploaded_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
              : '—';

            return (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
                className="lm-filerow"
                style={{
                  appearance: 'none', border: 'none', font: 'inherit',
                  textAlign: 'left', width: '100%',
                  padding: '10px 16px', alignItems: 'center', cursor: 'pointer',
                  background: on ? `${accent}0F` : 'transparent',
                  borderTop: i > 0 ? '1px solid #E5E7EB' : 'none',
                  transition: 'background .1s',
                }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = on ? `${accent}0F` : 'transparent'; }}
              >
                <FileBadge kind={kind} name={file.original_name} size={26} />
                <span style={{
                  fontSize: 13, fontWeight: on ? 600 : 500,
                  color: '#111827', minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {file.original_name}
                </span>
                <span className="lm-col-size" style={{
                  fontSize: 11, color: '#9CA3AF',
                  fontFamily: '"DM Mono", monospace',
                }}>{sizeFmt}</span>
                <span className="lm-col-date" style={{
                  fontSize: 11, color: '#9CA3AF',
                  fontFamily: '"DM Mono", monospace',
                }}>{dateFmt}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file); }}
                  style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: 6, color: '#9CA3AF',
                    fontSize: 14, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >⋯</span>
              </button>
            );
          })}
        </div>
      )}

      {menuFile && (
        <FileContextMenu
          file={menuFile}
          x={menuPos.x} y={menuPos.y}
          accent={accent}
          onClose={() => setMenuFile(null)}
          onDelete={() => { onDelete(menuFile.id); setMenuFile(null); }}
        />
      )}
    </div>
  );
}

function EmptyState({ query, accent, onUpload }) {
  return (
    <div style={{
      padding: '60px 24px', textAlign: 'center',
      background: '#fff', border: '1px solid #E5E7EB',
      borderRadius: 12,
    }}>
      {query ? (
        <>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
            Keine Ergebnisse
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            Keine Dateien für „{query}" gefunden.
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
            Dieser Ordner ist leer
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Lade die erste Datei hoch.
          </div>
          {onUpload && (
            <button
              onClick={onUpload}
              style={{
                height: 36, padding: '0 20px', border: 'none', borderRadius: 8,
                background: accent, color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Datei hochladen
            </button>
          )}
        </>
      )}
    </div>
  );
}

function FileContextMenu({ file, x, y, accent, onClose, onDelete }) {
  const kind = detectKind(file.original_name);

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 1100,
        background: '#fff', color: '#111827',
        borderRadius: 8, padding: 4, minWidth: 200,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.08)',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
        animation: 'lmSlideUp .12s ease-out',
      }}>
        <div style={{
          padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid #E5E7EB', marginBottom: 4,
        }}>
          <FileBadge kind={kind} name={file.original_name} size={20} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 11.5, fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{file.original_name}</div>
          </div>
        </div>

        <MenuItem
          icon="↓"
          label="Herunterladen"
          onClick={() => { window.location.href = downloadFile(file.id); onClose(); }}
        />
        <div style={{ height: 1, background: '#E5E7EB', margin: '4px 2px' }} />
        <MenuItem
          icon="🗑"
          label="Löschen"
          danger
          onClick={onDelete}
        />
      </div>
    </>
  );
}

function MenuItem({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', border: 'none', width: '100%', textAlign: 'left',
        padding: '7px 10px', borderRadius: 5, background: 'transparent',
        cursor: 'pointer', font: 'inherit', fontSize: 12,
        color: danger ? '#DC2626' : '#111827',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.08)' : '#F3F4F6'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ width: 14, textAlign: 'center', opacity: 0.7, fontSize: 11 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
