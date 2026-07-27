import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  initializeDatabase,
  createTestimonial,
  getTestimonials,
  updateTestimonialStatus,
} from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') })

app.use(express.static(path.join(__dirname, '..', 'dist')))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/testimonials', upload.single('photo'), async (req, res) => {
  try {
    const testimonial = await createTestimonial({
      name: req.body.name,
      email: req.body.email,
      company: req.body.company,
      message: req.body.message,
      rating: req.body.rating,
      photoPath: req.file?.filename ?? null,
    })
    res.status(201).json(testimonial)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'failed to create testimonial' })
  }
})

app.get('/api/testimonials', async (req, res) => {
  try {
    const status = req.query.status || 'all'
    const limit = Number(req.query.limit || 20)
    const offset = Number(req.query.offset || 0)
    const testimonials = await getTestimonials({ status, limit, offset })
    res.json(testimonials)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'failed to load testimonials' })
  }
})

app.patch('/api/testimonials/:id/status', async (req, res) => {
  try {
    const updated = await updateTestimonialStatus(req.params.id, req.body.status)
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'failed to update testimonial' })
  }
})

app.get('/widget', (_req, res) => {
  const accent = _req.query.accent || '#2563eb'
  const layout = _req.query.layout || 'grid'
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Widget</title></head>
  <body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#f8fafc;">
    <div style="padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:#111827;">Loved by customers</h3>
        <span style="color:${accent};font-weight:600;">${layout === 'grid' ? 'Grid view' : 'List view'}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
        ${['A polished experience from start to finish.', 'The process felt professional and effortless.', 'We saw results quickly.'].map((message) => `
          <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(15,23,42,0.04);">
            <div style="color:${accent};font-size:18px;">★★★★★</div>
            <p style="margin:10px 0;color:#334155;">“${message}”</p>
            <strong style="color:#0f172a;">Happy Client</strong>
          </div>`).join('')}
      </div>
    </div>
  </body>
</html>`
  res.send(html)
})

app.get(/^(?!\/api\/|\/health).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

await initializeDatabase()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
