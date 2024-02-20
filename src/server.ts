import fastify from 'fastify'
import { env } from './env'
import { dailyDietRoutes } from './routes/dailyDietRoutes'
import cookie from '@fastify/cookie'

const app = fastify()
app.register(dailyDietRoutes, {
  prefix: 'feeds',
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
