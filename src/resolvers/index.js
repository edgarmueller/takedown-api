import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import linkResolvers from './link';
import tagResolvers from './tag';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [customScalarResolver, userResolvers, linkResolvers, tagResolvers];
