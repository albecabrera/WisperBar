import { Router } from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT f.*, COUNT(fi.id) AS file_count
      FROM folders f
      LEFT JOIN files fi ON fi.folder_id = f.id
      GROUP BY f.id
      ORDER BY f.subject, f.group_name, f.name
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const { subject, group_name, name } = req.body;
  if (!subject || !group_name || !name) {
    return res.status(400).json({ error: 'subject, group_name und name erforderlich' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO folders (subject, group_name, name) VALUES (?, ?, ?)',
      [subject, group_name, name]
    );
    const [rows] = await pool.execute(
      'SELECT *, 0 AS file_count FROM folders WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM folders WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
