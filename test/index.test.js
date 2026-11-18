import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import mongoSanitize from '../src/index.js'

const buildApp = (options, { queryParser } = {}) => {
  const app = express()
  if (queryParser) app.set('query parser', queryParser)
  app.use(express.json())
  app.use(mongoSanitize(options))
  app.all('/echo/:id', (req, res) => {
    res.json({ body: req.body, query: req.query, params: req.params })
  })
  return app
}

describe('mongoSanitize', () => {
  it('strips $-prefixed keys from body', async () => {
    const res = await request(buildApp())
      .post('/echo/1')
      .send({ user: { $gt: '' }, name: 'ok' })
    expect(res.status).toBe(200)
    expect(res.body.body).toEqual({ user: {}, name: 'ok' })
  })

  it('strips $-prefixed keys from query without throwing on Express 5', async () => {
    const res = await request(buildApp()).get('/echo/1?$where=x&name=ok')
    expect(res.status).toBe(200)
    expect(res.body.query).toEqual({ name: 'ok' })
  })

  it('strips nested operators with the extended query parser', async () => {
    const app = buildApp({}, { queryParser: 'extended' })
    const res = await request(app).get('/echo/1?user[$ne]=x&name=ok')
    expect(res.status).toBe(200)
    expect(res.body.query).toEqual({ user: {}, name: 'ok' })
  })

  it('strips dotted keys by default', async () => {
    const res = await request(buildApp()).post('/echo/1').send({ 'a.b': 1, c: 2 })
    expect(res.body.body).toEqual({ c: 2 })
  })

  it('applies replaceWith to body and query', async () => {
    const app = buildApp({ replaceWith: '_' })
    const res = await request(app).post('/echo/1?$where=1').send({ $where: 1 })
    expect(res.body.body).toEqual({ _where: 1 })
    expect(res.body.query).toEqual({ _where: '1' })
  })

  it('passes clean requests through unchanged', async () => {
    const res = await request(buildApp()).post('/echo/42?page=2').send({ name: 'x' })
    expect(res.body).toEqual({ body: { name: 'x' }, query: { page: '2' }, params: { id: '42' } })
  })
})
