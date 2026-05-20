import { useState, useRef, useLayoutEffect } from 'react';
import Sidebar from '../components/Sidebar';
import FileTable from '../components/FileTable';
import FilePreview from '../components/FilePreview';
import UploadModal from '../components/UploadModal';
import NewFolderModal from '../components/NewFolderModal';
import Breadcrumb from '../components/Breadcrumb';
import { SUBJECTS } from '../constants/structure';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../hooks/useFiles';

export default function App({ onLogout }) {
  const [subjectId, setSubjectId] = useState('spanisch');
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [hoverSubject, setHoverSubject] = useState(null);

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const { folders, loading: foldersLoading, add: addFolder, reload: reloadFolders } = useFolders();
  const { files, upload, remove: removeFile } = useFiles(activeFolder?.id);

  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[subjectId];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [subjectId]);

  const onSubjectChange = (id) => {
    setSubjectId(id);
    setActiveFolder(null);
    setActiveFile(null);
    setQuery('');
  };

  const onFolderSelect = (folder) => {
    setActiveFolder(folder);
    setActiveFile(null);
    setQuery('');
  };

  const handleUpload = async (file, onProgress) => {
    const newFile = await upload(file, onProgress);
    reloadFolders();
    return newFile;
  };

  const handleNewFolder = async ({ subject: subjectKey, group_name, name }) => {
    await addFolder(subjectKey, group_name, name);
  };

  const handleDeleteFile = async (id) => {
    await removeFile(id);
  };

  const accent = subject.color;
  const subjectFolders = folders.filter((f) => f.subject === subjectId);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: '#F8F9FB', color: '#111827',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      fontFeatureSettings: '"ss01", "cv11"',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', padding: '8px 16px 0',
        background: '#EEF0F4', borderBottom: '1px solid #E5E7EB',
        position: 'relative', flexShrink: 0, gap: 2,
        minHeight: 56,
      }}>
        {SUBJECTS.map((s) => {
          const on = s.id === subjectId;
          const hovered = hoverSubject === s.id;
          return (
            <button
              key={s.id}
              ref={(el) => (tabRefs.current[s.id] = el)}
              onClick={() => onSubjectChange(s.id)}
              onMouseEnter={() => setHoverSubject(s.id)}
              onMouseLeave={() => setHoverSubject(null)}
              style={{
                appearance: 'none', border: 'none', font: 'inherit',
                padding: '10px 18px 12px', cursor: 'pointer',
                background: on ? '#fff' : hovered ? 'rgba(0,0,0,0.025)' : 'transparent',
                borderRadius: '10px 10px 0 0',
                marginBottom: on ? -1 : 0,
                display: 'flex', alignItems: 'center', gap: 9,
                borderLeft: on ? '1px solid #E5E7EB' : '1px solid transparent',
                borderRight: on ? '1px solid #E5E7EB' : '1px solid transparent',
                position: 'relative', transition: 'background .12s',
              }}
            >
              <span style={{
                width: 9, height: 9, borderRadius: 3, background: s.color,
                opacity: on || hovered ? 1 : 0.55,
                boxShadow: on ? `0 0 0 2px ${s.color}26` : 'none',
                transition: 'all .15s',
              }} />
              <span style={{
                fontSize: 13, fontWeight: on ? 600 : 500,
                color: on ? '#111827' : '#6B7280', letterSpacing: -0.1,
              }}>{s.name}</span>
            </button>
          );
        })}

        {/* Sliding tab indicator */}
        <div style={{
          position: 'absolute', bottom: -1, height: 2,
          left: indicator.left, width: indicator.width,
          background: accent,
          transition: 'left .25s cubic-bezier(.4,.7,.3,1), width .25s cubic-bezier(.4,.7,.3,1)',
          borderRadius: '2px 2px 0 0',
        }} />

        <div style={{ flex: 1 }} />

        {/* Search + upload */}
        <div style={{ paddingBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <SearchField value={query} onChange={setQuery} accent={accent}
            placeholder={`In ${subject.name} suchen…`} />
          <button
            onClick={() => setUploadOpen(true)}
            disabled={!activeFolder}
            style={{
              height: 30, padding: '0 14px', border: 'none', borderRadius: 7,
              background: activeFolder ? accent : '#E5E7EB',
              color: activeFolder ? '#fff' : '#9CA3AF',
              fontSize: 12, fontWeight: 600, cursor: activeFolder ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: activeFolder ? `0 2px 6px ${accent}40` : 'none',
              transition: 'background .15s, transform .1s',
              fontFamily: 'inherit',
            }}
            onMouseDown={(e) => { if (activeFolder) e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => e.currentTarget.style.transform = ''}
            onMouseLeave={(e) => e.currentTarget.style.transform = ''}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Hochladen
          </button>
          <button
            onClick={onLogout}
            title="Abmelden"
            style={{
              width: 30, height: 30, border: 'none', borderRadius: 7,
              background: 'transparent', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 7h7M9 4l3 3-3 3M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar
          subject={subject}
          groups={subject.groups}
          folders={subjectFolders}
          activeFolderId={activeFolder?.id}
          onFolderSelect={onFolderSelect}
          onNewFolder={() => setNewFolderOpen(true)}
        />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          {activeFolder ? (
            <div style={{ padding: '20px 28px' }}>
              <Breadcrumb
                items={[
                  subject.name,
                  activeFolder.group_name,
                  activeFolder.name,
                ]}
                accent={accent}
              />
              <div style={{
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: 8, marginBottom: 18, gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <h1 style={{
                    fontSize: 24, fontWeight: 600, margin: 0,
                    letterSpacing: -0.5, color: '#111827',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{activeFolder.name}</h1>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                    {query
                      ? `${files.filter((f) => f.original_name.toLowerCase().includes(query.toLowerCase())).length} von ${files.length} Dateien · Filter: „${query}"`
                      : `${files.length} Datei${files.length !== 1 ? 'en' : ''}`}
                  </div>
                </div>
              </div>

              <FileTable
                files={files}
                activeFileId={activeFile?.id}
                onFileSelect={setActiveFile}
                accent={accent}
                query={query}
                onDelete={handleDeleteFile}
                onUpload={() => setUploadOpen(true)}
              />
            </div>
          ) : (
            <WelcomeView
              subject={subject}
              folders={subjectFolders}
              foldersLoading={foldersLoading}
              onFolderSelect={onFolderSelect}
              onNewFolder={() => setNewFolderOpen(true)}
            />
          )}
        </div>
        {/* Preview panel — visible whenever a folder is open */}
        {activeFolder && (
          <div style={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
            <FilePreview file={activeFile} accent={accent} />
          </div>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        accent={accent}
        targetFolder={activeFolder
          ? `${subject.name} › ${activeFolder.group_name} › ${activeFolder.name}`
          : undefined}
        onUpload={handleUpload}
      />

      <NewFolderModal
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onSave={handleNewFolder}
        subject={subject}
      />
    </div>
  );
}

function WelcomeView({ subject, folders, foldersLoading, onFolderSelect, onNewFolder }) {
  const accent = subject.color;
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
              {subject.short}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>
            {subject.name}
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          {folders.length} Ordner — Wähle einen aus oder erstelle einen neuen.
        </p>
      </div>

      {foldersLoading ? (
        <div style={{ color: '#9CA3AF', fontSize: 13 }}>Lade Ordner…</div>
      ) : folders.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Noch keine Ordner</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Erstelle den ersten Ordner für {subject.name}.
          </div>
          <button
            onClick={onNewFolder}
            style={{
              height: 36, padding: '0 20px', border: 'none', borderRadius: 8,
              background: accent, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Ordner erstellen</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}>
          {folders.map((f) => (
            <FolderCard key={f.id} folder={f} accent={accent} onClick={() => onFolderSelect(f)} />
          ))}
          <button
            onClick={onNewFolder}
            style={{
              height: 88, border: '1.5px dashed #E5E7EB', borderRadius: 10,
              background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 6, color: '#9CA3AF', fontSize: 12,
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Neuer Ordner
          </button>
        </div>
      )}
    </div>
  );
}

function FolderCard({ folder, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', border: '1px solid #E5E7EB', borderRadius: 10,
        background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'box-shadow .15s, transform .1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 28, borderRadius: 4, background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="14" viewBox="0 0 24 20" fill="none">
            <path d="M0 4a2 2 0 0 1 2-2h7l2 2h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Z"
              fill={accent} opacity="0.92"/>
            <path d="M0 6h24v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6Z" fill={accent}/>
          </svg>
        </div>
      </div>
      <div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#111827',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{folder.name}</div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, fontFamily: '"DM Mono", monospace' }}>
          {folder.group_name} · {folder.file_count ?? 0} Dateien
        </div>
      </div>
    </button>
  );
}

function SearchField({ value, onChange, accent, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 30, padding: '0 10px', borderRadius: 7,
      background: '#F3F4F6', border: '0.5px solid #E5E7EB',
      fontSize: 12, color: '#6B7280',
      minWidth: 180, flex: '1 1 220px', maxWidth: 320,
    }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          font: 'inherit', fontSize: 12, color: '#111827', flex: 1, minWidth: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#9CA3AF', fontSize: 14, lineHeight: 1, padding: 0,
          }}
        >×</button>
      )}
    </div>
  );
}
