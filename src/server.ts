import fastify from 'fastify'
import { env } from './env'
import { mealsRoutes } from './routes/mealsRoutes'
import { userRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(mealsRoutes, {
  prefix: 'feeds',
})

app.register(userRoutes, {
  prefix: 'users',
})

app.register(cookie, {
  secret: 'polls-app-nlw',
  hook: 'onRequest',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
