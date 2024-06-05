import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

import { env } from './env'
import { mealsRoutes } from './routes/mealsRoutes'
import { userRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'
import { errorHandler } from './error-handler'

export const app = fastify()

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['aplication/json'],
    info: {
      title: 'daily-diet',
      description:
        'Especificações da API para o backend da aplicação Daily Diet',
      version: '1.0.0',
    },
  },
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(cookie)

app.register(mealsRoutes, {
  prefix: 'feeds',
})

app.register(userRoutes, {
  prefix: 'users',
})

app.setErrorHandler(errorHandler)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
