import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
// import { App } from 'uWebSockets.js'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING ?? 'postgres://postgres:postgrespassword@localhost:7432/postgres',
  min: 10,
  max: 50,
})

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Post {
      id: Int!
      created: String!
      thread_id: Int!
    }
    type Query {
      postsByThreadId(id: Int!, limit: Int): [Post!]!
      postsByThreadIds(ids: [Int!]!, limit: Int): [[Post!]!]!
    }
  `,
  resolvers: {
    Query: {
      postsByThreadId: async (_, { id, limit }) => {
        const { rows } = await pool.query('SELECT * FROM posts WHERE thread_id = $1 ORDER BY created DESC LIMIT $2', [
          id,
          limit ?? 10,
        ])

        return rows
      },
      postsByThreadIds: async (_, { ids, limit }) => {
        const query = `WITH numbered_posts AS (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY thread_id ORDER BY created DESC) AS rn
          FROM posts
          WHERE thread_id = ANY($1)
        )
        SELECT *
        FROM numbered_posts
        WHERE rn <= $2
        ORDER BY created DESC;`
        // console.log(`QUERY: ${query}`, ids, limit)
        const { rows } = await pool.query(query, [ids, limit])
        return ids.map((id) => rows.filter((row) => row.thread_id === id))
      },
    },
  },
})

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema })

const port = process.env.PORT || 4002
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
