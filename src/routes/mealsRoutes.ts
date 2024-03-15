import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  // criação de uma refeição
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const insertFeedBodySchema = z.object({
        meal: z.string(),
        description: z.string(),
        dateMeal: z.coerce.date(),
        onDiet: z.coerce.boolean(),
      })

      const { meal, description, dateMeal, onDiet } =
        insertFeedBodySchema.parse(req.body)

      await knex('meals').insert({
        id: randomUUID(),
        meal,
        description,
        meal_date: dateMeal.getTime(),
        on_diet: onDiet,
      })

      return res.status(201).send()
    },
  )
}
