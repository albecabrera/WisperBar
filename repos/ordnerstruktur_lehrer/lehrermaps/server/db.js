import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'lehrermaps',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS folders (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      subject     VARCHAR(50)  NOT NULL,
      group_name  VARCHAR(100) NOT NULL,
      name        VARCHAR(100) NOT NULL,
      created_at  DATETIME DEFAULT NOW()
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      folder_id     INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name   VARCHAR(255) NOT NULL,
      mime_type     VARCHAR(100),
      size_bytes    INT,
      uploaded_at   DATETIME DEFAULT NOW(),
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `);
}

export default pool;
