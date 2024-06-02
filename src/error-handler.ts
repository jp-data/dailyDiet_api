import { FastifyInstance } from 'fastify'
import { BadRequest } from './routes/_errors/bad-request'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, req, res) => {
  if (error instanceof BadRequest) {
    return res.status(400).send({ message: error.message })
  }

  return res.status(500).send({ message: 'Internal server error!' })
}
