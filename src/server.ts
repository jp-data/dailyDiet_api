import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
} from 'fastify-type-provider-zod'

import { env } from './env'
import { mealsRoutes } from './routes/mealsRoutes'
import { userRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'
import { errorHandler } from './error-handler'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'daily-diet',
      description:
        'Especificações da API para o backend da aplicação Daily Diet',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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
