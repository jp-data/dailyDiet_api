import { table } from 'console'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.string('session_id').unique()
    table.string('email').notNullable().unique()
    table.string('name').notNullable()
    table.timestamp(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
