import { useState, useEffect, useCallback } from 'react';
import { getFiles, uploadFile, deleteFile } from '../lib/api';

export function useFiles(folderId) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!folderId) { setFiles([]); return; }
    try {
      setLoading(true);
      const data = await getFiles(folderId);
      setFiles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => { load(); }, [load]);

  const upload = useCallback(async (file, onProgress) => {
    const newFile = await uploadFile(folderId, file, onProgress);
    setFiles((prev) => [newFile, ...prev]);
    return newFile;
  }, [folderId]);

  const remove = useCallback(async (id) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { files, loading, error, reload: load, upload, remove };
}
