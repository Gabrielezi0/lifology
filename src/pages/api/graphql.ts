import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/middleware/auth';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default startServerAndCreateNextHandler<NextApiRequest, NextApiResponse>(server, {
  context: async ({ req }) => {
    const user = await getUserFromToken(req);
    return { user };
  }
});
