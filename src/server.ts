import fastify from 'fastify'
import { env } from './env'
import { mealsRoutes } from './routes/mealsRoutes'
import { userRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(mealsRoutes, {
  prefix: 'feeds',
})

app.register(userRoutes, {
  prefix: 'users',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
