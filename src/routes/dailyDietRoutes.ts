import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function dailyDietRoutes(app: FastifyInstance) {
  app.get('/hello', async () => {
    const user = await knex('users').select('*')
    return user
  })
}
