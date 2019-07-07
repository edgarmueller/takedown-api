import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import DataLoader from 'dataloader';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import loaders from './loaders';

const app = express();
app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
}

const batchUsers = async (keys, models) => {
  const users = await models.User.findAll({
    where: {
      id: {
        $in: keys,
      },
    },
  });

  return keys.map(key => users.find(user => user.id === key));
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async({ req, res, connection }) => {

    if (connection) {
      return {
        req,
        res,
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        }
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        req,
        res,
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys => 
            loaders.user.batchUsers(keys, models)
          )
        }
      };
    }
  }
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const eraseDatabaseOnSync = false;
const isTest = !!process.env.TEST_DATABASE;
const isProduction = !!process.env.DATABASE_URL;

const port = process.env.PORT || 8000;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (isTest) {
    createUsersWithLinks(new Date());
  }
  httpServer.listen({ port }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
  });
});

const createUsersWithLinks = async date => {
  await models.User.create(
    {
      username: 'hwurst',
      email: 'hans@wurst.com',
      password: 'hwurst',
      links: [
        {
          url: 'www.heise.de',
          title: 'IT-News, Nachrichten und Hintergründe',
          createdAt: date.setSeconds(date.getSeconds() + 1),
          tags: [{ name: 'tech', userId:1 }]
        },
      ],
    },
    {
      include: [
        {
          association: models.User.associations.links,
          include: [models.Tag]
        },
      ]
    },
  );

  await models.User.create(
    {
      username: 'ggans',
      email: 'gustav@gans.com',
      password: 'ggans',
      role: 'ADMIN',
      links: [
        {
          url: 'www.reddit.com',
          title: 'The frontpage of the internet',
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          url: 'www.golem.de',
          title: 'IT News für Profis',
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
      ],
    },
    {
      include: [models.Link]
    },
  );
};
