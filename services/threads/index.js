import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
// import { App } from 'uWebSockets.js'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING ?? 'postgres://postgres:postgrespassword@localhost:8432/postgres',
  min: 10,
  max: 50,
})

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Thread {
      id: Int!
      created: String!
    }
    type Query {
      threads(limit: Int): [Thread!]!
    }
  `,
  resolvers: {
    Query: {
      threads: async (_, { limit }) => {
        const { rows } = await pool.query('SELECT * FROM threads ORDER BY created DESC LIMIT $1', [limit ?? 10])

        return rows
      },
    },
  },
})

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema })

const port = process.env.PORT || 4001
const server = createServer(yoga)

// Start the server and you're done!
server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`)
})

// App()
//   .any('/*', yoga)
//   .listen(port, () => {
//     console.info(`Server is running on http://localhost:${port}/graphql`)
//   })
