import sqlite3 from 'sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data.sqlite')

const db = new sqlite3.Database(dbPath)

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID, changes: this.changes })
      }
    })
  })
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export async function initializeDatabase() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      rating INTEGER NOT NULL,
      photo_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export async function createTestimonial({ name, email, company, message, rating, photoPath }) {
  const now = new Date().toISOString()
  const result = await runAsync(
    `
      INSERT INTO testimonials (name, email, company, message, rating, photo_path, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `,
    [name, email, company, message, Number(rating), photoPath ?? null, now, now],
  )

  return getAsync('SELECT * FROM testimonials WHERE id = ?', [result.id])
}

export async function getTestimonials({ status = 'all', limit = 20, offset = 0 } = {}) {
  let sql = 'SELECT * FROM testimonials'
  const params = []

  if (status !== 'all') {
    sql += ' WHERE status = ?'
    params.push(status)
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  return allAsync(sql, params)
}

export async function updateTestimonialStatus(id, status) {
  const now = new Date().toISOString()
  await runAsync('UPDATE testimonials SET status = ?, updated_at = ? WHERE id = ?', [status, now, id])
  return getAsync('SELECT * FROM testimonials WHERE id = ?', [id])
}
