import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SUBJECTS } from '../constants/structure';

export default function NewFolderModal({ open, onClose, onSave, subject }) {
  const [name, setName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [saving, setSaving] = useState(false);

  const subjectData = SUBJECTS.find((s) => s.id === subject?.id);
  const groups = subjectData?.groups ?? [];
  const accent = subject?.color ?? '#6B7280';

  const handleSave = async () => {
    if (!name.trim() || !groupName) return;
    setSaving(true);
    try {
      await onSave({ subject: subject.id, group_name: groupName, name: name.trim() });
      setName('');
      setGroupName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
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
          width: '100%', maxWidth: 380,
          background: '#fff', borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          animation: 'lmSlideUp .2s cubic-bezier(.4,.7,.3,1)',
        }}
      >
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Neuer Ordner</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            in <strong style={{ color: accent }}>{subjectData?.name ?? subject?.id}</strong>
          </div>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
              textTransform: 'uppercase', color: '#9CA3AF',
            }}>Gruppe</span>
            <select
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={inputStyle}
            >
              <option value="">Gruppe wählen…</option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
              textTransform: 'uppercase', color: '#9CA3AF',
            }}>Ordnername</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="z. B. Klausuren Q2"
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{
          padding: '12px 22px', borderTop: '1px solid #E5E7EB',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          background: '#FAFBFC',
        }}>
          <button onClick={onClose} style={btnSecStyle}>Abbrechen</button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !groupName || saving}
            style={{
              ...btnPriStyle,
              background: accent,
              opacity: !name.trim() || !groupName || saving ? 0.5 : 1,
              cursor: !name.trim() || !groupName || saving ? 'not-allowed' : 'pointer',
            }}
          >{saving ? 'Erstelle…' : 'Erstellen'}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const inputStyle = {
  appearance: 'none', border: '1px solid #E5E7EB', borderRadius: 7,
  background: '#fff', color: '#111827', padding: '8px 10px', fontSize: 12.5,
  fontFamily: '"DM Sans", -apple-system, sans-serif', outline: 'none',
  width: '100%',
};

const btnSecStyle = {
  height: 32, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 7,
  background: 'transparent', color: '#6B7280', fontSize: 12, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
};

const btnPriStyle = {
  height: 32, padding: '0 16px', border: 'none', borderRadius: 7,
  color: '#fff', fontSize: 12, fontWeight: 600,
  fontFamily: 'inherit',
};
