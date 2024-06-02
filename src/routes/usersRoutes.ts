import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { BadRequest } from './_errors/bad-request'

export async function userRoutes(app: FastifyInstance) {
  // register of users
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      name: z.string(),
    })

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    const { email, name } = createUserBodySchema.parse(req.body)

    const userByEmail = await knex('users').where({ email }).first()

    if (userByEmail) {
      throw new BadRequest('Email already exists!')
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return res.status(201).send()
  })

  // list of users
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return users
  })
}
