import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import { BadRequest } from './_errors/bad-request'

export async function mealsRoutes(app: FastifyInstance) {
  // register of meals
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'Register of meals',
        tags: ['Meals'],
        body: z.object({
          meal: z.string(),
          description: z.string(),
          dateMeal: z.coerce.date().optional(),
          onDiet: z.boolean(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const mealRegisterBodySchema = z.object({
        meal: z.string(),
        description: z.string(),
        dateMeal: z.coerce.date().optional(),
        onDiet: z.boolean(),
      })
      const { meal, description, dateMeal, onDiet } =
        mealRegisterBodySchema.parse(req.body)

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
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'View an specific meal',
        tags: ['Meals'],
        params: z.object({
          mealId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            meal: z.string(),
            description: z.string(),
            dateMeal: z.coerce.date().optional(),
            onDiet: z.boolean(),
          }),
        },
      },
    },

    async (req, res) => {
      const paramsUserValidator = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsUserValidator.parse(req.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        throw new BadRequest('Meal not found!')
      }

      return res.send({ meal })
    },
  )

  // viewing all meals of an specific user
  app.get(
    '/view/:userId',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'Viewing all meals of an specific user',
        tags: ['Meals'],
        params: z.object({
          userId: z.string().uuid(),
        }),
      },
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
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'Update previously recorded meals',
        tags: ['Meals'],
        params: z.object({
          mealId: z.string().uuid(),
        }),
        body: z.object({
          meal: z.string().optional(),
          description: z.string().optional(),
          dateMeal: z.coerce.date().optional(),
          onDiet: z.boolean().optional(),
        }),
      },
    },
    async (req, res) => {
      const mealsIdParamsSchema = z.object({ mealId: z.string().uuid() })
      const { mealId } = mealsIdParamsSchema.parse(req.params)

      const mealUpdatingBodySchema = z.object({
        meal: z.string().optional(),
        description: z.string().optional(),
        dateMeal: z.coerce.date().optional(),
        onDiet: z.boolean().optional(),
      })

      const { meal, description, dateMeal, onDiet } =
        mealUpdatingBodySchema.parse(req.body)

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
        throw new BadRequest('Meal not found!')
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
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'Delete one register of meal',
        tags: ['Meals'],
        params: z.object({
          mealId: z.string().uuid(),
        }),
      },
    },
    async (req, res) => {
      const mealsIdParamsSchema = z.object({ mealId: z.string().uuid() })
      const { mealId } = mealsIdParamsSchema.parse(req.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        throw new BadRequest('Meal not found!')
      }

      await knex('meals').where({ id: mealId }).delete()

      return res.status(204).send()
    },
  )

  // metrics
  app.get(
    '/:userId/metrics',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        summary: 'Metrics about a specific users meals',
        tags: ['User'],
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            totalMeals: z.number(),
            mealsOnDiet: z.number(),
            mealsNotInDiet: z.number(),
            bestSequence: z.number(),
          }),
        },
      },
    },
    async (req, res) => {
      const paramsUserIdSchema = z.object({ userId: z.string().uuid() })
      const { userId } = paramsUserIdSchema.parse(req.params)

      const totalMeals = await knex('meals')
        .where({ user_id: userId })
        .groupBy('meal')
        .orderBy('meal_date', 'asc')

      const mealsOnDiet = await knex('meals')
        .where({ user_id: userId })
        .andWhere('on_diet', '1')

      const mealsNotInDiet = await knex('meals')
        .where({ user_id: userId })
        .andWhere('on_diet', '0')

      let bestSequence = 0
      let currentSequence = 0

      totalMeals.forEach((meal) => {
        if (meal.on_diet) {
          currentSequence += 1
          if (currentSequence > bestSequence) {
            bestSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      })

      return res.send({
        totalMeals: totalMeals.length,
        mealsOnDiet: mealsOnDiet.length,
        mealsNotInDiet: mealsNotInDiet.length,
        bestSequence,
      })
    },
  )
}
