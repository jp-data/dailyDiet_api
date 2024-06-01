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

      return res.status(201).send()
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
      const meals = await knex('meals').where({ user_id: userId })

      return res.send({ meals })
    },
  )

  // updating one meal
  app.put(
    '/update/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })
      const { mealId } = paramsSchema.parse(req.params)

      const updateBodySchema = z.object({
        meal: z.string().optional(),
        description: z.string().optional(),
        dateMeal: z.coerce.date().optional(),
        onDiet: z.boolean().optional(),
      })

      const { meal, description, dateMeal, onDiet } = updateBodySchema.parse(
        req.body,
      )

      // handling meal date format
      let mealDate

      if (dateMeal) {
        const dateMealFormat = dayjs(dateMeal).format()
        mealDate = dateMealFormat
      } else {
        const now = dayjs()
        mealDate = now.format()
      }

      const mealUpdate = await knex('meals').where({ id: mealId }).first()

      if (!mealUpdate) {
        return res.status(404).send({ error: 'Meal not exist!' })
      }

      await knex('meals').where({ id: mealId }).update({
        meal,
        description,
        meal_date: mealDate,
        on_diet: onDiet,
      })

      return res.status(204).send()
    },
  )

  // delete one meal
  app.delete(
    '/delete/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramsIdSchema = z.object({ mealId: z.string().uuid() })
      const { mealId } = paramsIdSchema.parse(req.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return res.status(401).send({ error: 'Meal not found!' })
      }

      await knex('meals').where({ id: mealId }).delete()

      return res.status(204).send()
    },
  )

  // metrics
  app.get(
    '/:userId/metrics',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramsUserIdSchema = z.object({ userId: z.string().uuid() })
      const { userId } = paramsUserIdSchema.parse(req.params)

      const totalMeals = await knex('meals')
        .where({ user_id: userId })
        .groupBy('meal')

      const mealsOnDiet = await knex('meals')
        .where({ user_id: userId })
        .andWhere('on_diet', '1')

      return res.send({
        totalMeals: totalMeals.length,
        mealsOnDiet: mealsOnDiet.length,
      })
    },
  )
}
