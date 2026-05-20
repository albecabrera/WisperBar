import { useState, useEffect, useCallback } from 'react';
import { getFolders, createFolder, deleteFolder } from '../lib/api';

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFolders();
      setFolders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (subject, group_name, name) => {
    const folder = await createFolder({ subject, group_name, name });
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const bySubjectGroup = useCallback(
    (subject, group_name) =>
      folders.filter((f) => f.subject === subject && f.group_name === group_name),
    [folders]
  );

  return { folders, loading, error, reload: load, add, remove, bySubjectGroup };
}
