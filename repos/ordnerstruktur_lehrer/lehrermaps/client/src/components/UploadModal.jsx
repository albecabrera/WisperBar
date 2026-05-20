import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fileKindColor } from '../constants/structure';
import { SUPPORTED_TYPES } from '../constants/structure';

export default function UploadModal({ open, onClose, accent, targetFolder, onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  if (!open) return null;

  const handleFiles = async (fileList) => {
    const file = fileList[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      await onUpload(file, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      onClose();
    } catch {
      /* error handled above */
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return createPortal(
    <div
      onClick={!uploading ? onClose : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,15,18,0.55)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'lmFadeIn .15s ease-out',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 600, maxHeight: '90vh',
          background: '#fff', color: '#111827',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          animation: 'lmSlideUp .2s cubic-bezier(.4,.7,.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
              Datei hochladen
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
              Ziel: <strong style={{ color: '#111827' }}>{targetFolder || 'Aktiver Ordner'}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, border: 'none', borderRadius: 7,
              background: 'transparent', color: '#6B7280', cursor: 'pointer',
              fontSize: 18, lineHeight: 1, fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragOver ? accent : '#E5E7EB'}`,
              background: dragOver ? `${accent}11` : '#FAFBFC',
              borderRadius: 10, padding: '28px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              textAlign: 'center', transition: 'all .15s', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: `${accent}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 14V4M6 9l5-5 5 5M3 16v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"
                  stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {dragOver ? 'Loslassen zum Hochladen' : 'Dateien hier ablegen'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              oder <span style={{ color: accent, fontWeight: 600 }}>Dateien auswählen</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Progress */}
          {progress !== null && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: accent, borderRadius: 2, transition: 'width .2s',
                }} />
              </div>
              <div style={{
                fontSize: 11, color: '#6B7280', marginTop: 6,
                fontFamily: '"DM Mono", monospace',
              }}>{progress}% hochgeladen…</div>
            </div>
          )}

          {/* Supported types */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.7,
              textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10,
            }}>Unterstützte Formate</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {SUPPORTED_TYPES.map((grp) => (
                <div key={grp.group} style={{
                  border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '10px 12px', background: '#fff',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{
                    width: 26, height: 30, flexShrink: 0,
                    background: fileKindColor(grp.kind), color: '#fff',
                    borderRadius: 3, display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'center', fontFamily: '"DM Mono", monospace',
                    fontSize: 8, fontWeight: 700, paddingBottom: 3, marginTop: 1,
                  }}>{grp.exts[0].toUpperCase().slice(0, 4)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{grp.group}</div>
                    <div style={{
                      fontSize: 10, color: '#9CA3AF',
                      fontFamily: '"DM Mono", monospace', lineHeight: 1.5,
                    }}>.{grp.exts.join(' .')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 22px', borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', gap: 10, background: '#FAFBFC',
        }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', flex: 1 }}>
            Max. 50 MB pro Datei · alle Daten bleiben lokal
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              height: 32, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 7,
              background: 'transparent', color: '#6B7280', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', opacity: uploading ? 0.5 : 1,
            }}
          >Abbrechen</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
