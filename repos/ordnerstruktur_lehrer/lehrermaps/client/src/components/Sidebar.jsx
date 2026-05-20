import { useState } from 'react';
import FolderIcon from './FolderIcon';

export default function Sidebar({
  subject, groups, folders,
  activeFolderId, onFolderSelect,
  onNewFolder,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const accent = subject.color;
  const border = '#E5E7EB';

  return (
    <div style={{
      width: collapsed ? 56 : 240,
      background: '#fff', borderRight: `1px solid ${border}`,
      flexShrink: 0, display: 'flex', flexDirection: 'column',
      transition: 'width .22s cubic-bezier(.4,.7,.3,1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0' : '0 12px 0 16px',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: `1px solid ${border}`, flexShrink: 0,
      }}>
        {!collapsed && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.7,
            textTransform: 'uppercase', color: '#9CA3AF',
          }}>{subject.name}</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
          style={{
            width: 26, height: 26, border: 'none', borderRadius: 6,
            background: 'transparent', color: '#6B7280', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d={collapsed ? 'M4 3l4 4-4 4' : 'M10 3L6 7l4 4'}
              stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Folder list */}
      <div style={{ flex: 1, overflow: 'auto', padding: collapsed ? '8px 6px' : '10px 0' }}>
        {groups.map((g) => {
          const groupFolders = folders.filter((f) => f.group_name === g.name);
          return (
            <div key={g.id} style={{ marginBottom: collapsed ? 8 : 16 }}>
              {!collapsed && (
                <div style={{
                  padding: '0 16px 6px', fontSize: 10, fontWeight: 600,
                  letterSpacing: 0.6, textTransform: 'uppercase', color: '#9CA3AF',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: accent, opacity: 0.6,
                  }} />
                  {g.name}
                </div>
              )}
              {groupFolders.map((f) => {
                const on = f.id === activeFolderId;
                return (
                  <button
                    key={f.id}
                    onClick={() => onFolderSelect(f)}
                    title={collapsed ? `${g.name} · ${f.name}` : undefined}
                    style={{
                      appearance: 'none', border: 'none', font: 'inherit',
                      width: collapsed ? 44 : '100%',
                      padding: collapsed ? '8px 0' : '7px 14px 7px 16px',
                      margin: collapsed ? '2px auto' : 0,
                      display: 'flex', alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: 10, cursor: 'pointer', textAlign: 'left',
                      background: on ? `${accent}14` : 'transparent',
                      borderLeft: !collapsed && on ? `3px solid ${accent}` : '3px solid transparent',
                      borderRadius: collapsed ? 8 : 0,
                      color: on ? '#111827' : '#6B7280',
                      fontSize: 13, fontWeight: on ? 600 : 400,
                      transition: 'background .1s, color .1s',
                    }}
                    onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(0,0,0,0.025)'; }}
                    onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <FolderIcon color={on ? accent : '#C7CACF'} size={16} />
                    {!collapsed && (
                      <>
                        <span style={{
                          flex: 1, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{f.name}</span>
                        <span style={{
                          fontSize: 10, color: '#9CA3AF',
                          fontFamily: '"DM Mono", monospace',
                        }}>{f.file_count ?? 0}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* New folder button */}
      {!collapsed && onNewFolder && (
        <div style={{ padding: 10, borderTop: `1px solid ${border}` }}>
          <button
            onClick={onNewFolder}
            style={{
              width: '100%', height: 32, border: `1px dashed ${border}`,
              borderRadius: 7, background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: '#9CA3AF', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background .1s, color .1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Neuer Ordner
          </button>
        </div>
      )}
    </div>
  );
}
