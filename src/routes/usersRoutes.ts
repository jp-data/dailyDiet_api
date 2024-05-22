import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  // register of users
  app.post('/', async (req: FastifyRequest, res: FastifyReply) => {
    const createFeedBodySchema = z.object({
      email: z.string().email(),
      name: z.string(),
    })

    const { email, name } = createFeedBodySchema.parse(req.body)

    const userByEmail = await knex('users').where({ email }).first()

    if (userByEmail) {
      return res.status(400).send({ message: 'User already exists' })
    }

    const sessionId = randomUUID()

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    res.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res.status(201).send()
  })

  // list of users
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return users
  })
}
