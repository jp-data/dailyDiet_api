import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'

export async function mealsRoutes(app: FastifyInstance) {
  // register of meals
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const insertFeedBodySchema = z.object({
        meal: z.string(),
        description: z.string(),
        dateMeal: z.coerce.date().optional(),
        onDiet: z.coerce.boolean(),
      })

      const { meal, description, dateMeal, onDiet } =
        insertFeedBodySchema.parse(req.body)

      // handling meal date format
      let mealDate

      if (dateMeal) {
        const dateMealFormat = dayjs(dateMeal).format()
        mealDate = dateMealFormat
      } else {
        const now = dayjs()
        mealDate = now.format()
      }

      await knex('meals').insert({
        id: randomUUID(),
        meal,
        description,
        meal_date: mealDate,
        on_diet: onDiet,
        user_id: req.user?.id,
      })

      return res.status(201).send()
    },
  )

  app.get('/', async () => {
    const feeds = await knex('meals').select('*')

    return feeds
  })

  //  users meals list
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const paramsUserValidator = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsUserValidator.parse(req.params)

      const meals = await knex('meals').select('*').where('user_id', id)

      return { meals }
    },
  )

  // viewing a single meal
  
}
