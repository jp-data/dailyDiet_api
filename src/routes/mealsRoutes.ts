import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

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
        dateMeal: z.date(),
        onDiet: z.boolean(),
      })

      const { meal, description, dateMeal, onDiet } =
        insertFeedBodySchema.parse(req.body)

      await knex('meals').insert({
        meal,
        description,
        date_meal: dateMeal,
        on_diet: onDiet,
      })

      return res.status(201).send()
    },
  )
}
