import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { copyFile, unlink, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');

const CONVERTIBLE_EXTS = new Set(['doc', 'docx', 'odt', 'rtf', 'ppt', 'pptx', 'odp', 'xls', 'xlsx', 'ods']);
const converting = new Set();

async function convertToPdf(storedName, ext) {
  const tmpName = `${storedName}.${ext}`;
  const tmpPath = path.join(PREVIEWS_DIR, tmpName);
  const pdfPath = path.join(PREVIEWS_DIR, `${storedName}.pdf`);

  await mkdir(PREVIEWS_DIR, { recursive: true });
  await copyFile(path.join(UPLOADS_DIR, storedName), tmpPath);

  await new Promise((resolve, reject) => {
    exec(
      `soffice --headless --convert-to pdf --outdir "${PREVIEWS_DIR}" "${tmpPath}"`,
      { timeout: 45000 },
      (err) => { unlink(tmpPath).catch(() => {}); err ? reject(err) : resolve(); }
    );
  });

  return pdfPath;
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_, __, cb) => cb(null, `${randomUUID()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.startsWith('application/')
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Dateityp ${file.mimetype} nicht erlaubt`));
    }
  },
});

const router = Router();
router.use(auth);

// ── View / Preview / Download must come BEFORE /:folder_id ──

router.get('/preview/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Nicht gefunden' });
    const file = rows[0];

    const ext = file.original_name.split('.').pop().toLowerCase();
    if (!CONVERTIBLE_EXTS.has(ext)) return res.status(415).json({ error: 'Nicht konvertierbar' });

    const pdfPath = path.join(PREVIEWS_DIR, `${file.stored_name}.pdf`);

    if (!existsSync(pdfPath)) {
      if (converting.has(file.stored_name)) {
        await new Promise((r) => { const t = setInterval(() => { if (!converting.has(file.stored_name)) { clearInterval(t); r(); } }, 300); });
      } else {
        converting.add(file.stored_name);
        try { await convertToPdf(file.stored_name, ext); }
        finally { converting.delete(file.stored_name); }
      }
    }

    if (!existsSync(pdfPath)) return res.status(500).json({ error: 'Konvertierung fehlgeschlagen' });

    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.original_name.replace(/\.[^.]+$/, '.pdf'))}`);
    res.setHeader('Content-Type', 'application/pdf');
    createReadStream(pdfPath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── View + Download must come BEFORE /:folder_id to avoid param capture ──

router.get('/view/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Datei nicht gefunden' });
    const file = rows[0];
    const filePath = path.join(UPLOADS_DIR, file.stored_name);
    if (!existsSync(filePath)) return res.status(404).json({ error: 'Datei nicht auf Disk' });
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.original_name)}`);
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Datei nicht gefunden' });

    const file = rows[0];
    const filePath = path.join(UPLOADS_DIR, file.stored_name);
    if (!existsSync(filePath)) return res.status(404).json({ error: 'Datei nicht auf Disk' });

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`);
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:folder_id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM files WHERE folder_id = ? ORDER BY uploaded_at DESC',
      [req.params.folder_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Keine Datei übermittelt' });
  const { folder_id } = req.body;
  if (!folder_id) return res.status(400).json({ error: 'folder_id fehlt' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO files (folder_id, original_name, stored_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)',
      [folder_id, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]
    );
    const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT stored_name FROM files WHERE id = ?', [req.params.id]);
    if (rows.length) {
      const filePath = path.join(UPLOADS_DIR, rows[0].stored_name);
      if (existsSync(filePath)) {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      }
    }
    await pool.execute('DELETE FROM files WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Multer error handler ──
router.use((err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Datei zu groß — max. 50 MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  _next();
});

export default router;
