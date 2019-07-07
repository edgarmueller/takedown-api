import { gql } from 'apollo-server-express';

import userSchema from './user';
import linkSchema from './link';
import tagSchema from './tag';

const linkedSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkedSchema, userSchema, linkSchema, tagSchema];
