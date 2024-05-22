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
        onDiet: z.boolean(),
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

      return res.status(201).send(meal)
    },
  )

  // viewing a single meal
  app.get(
    '/meals/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const paramsUserValidator = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsUserValidator.parse(req.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return res.status(404).send({ error: 'Meal not found' })
      }

      return res.send({ meal })
    },
  )

  // viewing all meals of an specific user
  app.get(
    '/:userId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const userIdValidator = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = userIdValidator.parse(req.params)
      const meals = await knex('meals').where({ user_id: userId }).first()

      return res.send({ meals })
    },
  )
}
