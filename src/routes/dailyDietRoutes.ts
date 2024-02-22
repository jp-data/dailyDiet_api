import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function dailyDietRoutes(app: FastifyInstance) {
  // cadastro de usuário
  app.post('/', async (req, res) => {
    const createFeedBodySchema = z.object({
      email: z.string(),
      name: z.string(),
    })

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true,
      })
    }

    const { email, name } = createFeedBodySchema.parse(req.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })
    return res.status(201).send()
  })

  // listagem de usuários
  app.get('/', async () => {
    const feeds = await knex('users').select('*')

    return feeds
  })

  //
}
