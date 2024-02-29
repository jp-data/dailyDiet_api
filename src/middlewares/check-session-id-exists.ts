import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.session_id

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const user = await knex('users')
    .where({
      sessionId,
    })
    .first()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  request.user = user
}
