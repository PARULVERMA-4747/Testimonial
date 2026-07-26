import test from 'node:test'
import assert from 'node:assert/strict'
import { initializeDatabase, createTestimonial, getTestimonials, updateTestimonialStatus } from '../server/db.js'

test('creates, lists, and updates testimonial status', async () => {
  await initializeDatabase()

  const created = await createTestimonial({
    name: 'Ada Lovelace',
    email: `ada-${Date.now()}@example.com`,
    company: 'Example Labs',
    message: 'A clear and polished experience from submission to approval.',
    rating: 5,
  })

  assert.equal(created.status, 'pending')

  const pending = await getTestimonials({ status: 'pending' })
  assert.ok(pending.some((item) => item.id === created.id))

  const updated = await updateTestimonialStatus(created.id, 'approved')
  assert.equal(updated.status, 'approved')

  const approved = await getTestimonials({ status: 'approved' })
  assert.ok(approved.some((item) => item.id === created.id))
})
