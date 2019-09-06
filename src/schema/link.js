import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    links(cursor: String, limit: Int): LinkConnection
    link(id: ID!): Link!
  }

  type LinkConnection {
    edges: [Link!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  extend type Mutation {
    createLink(url: String!, tags: [String]): Link!
    addTag(id: ID!, tag: String): Link!
    setTags(id: ID!, tags: [String]!): Link!
    deleteLink(id: ID!, deleted: Boolean): Boolean!
    complete(id: ID!, done: Boolean): Link!
  }

  type Link {
    id: ID!
    url: String!
    title: String!
    description: String
    createdAt: Date!
    updatedAt: Date!
    user: User!
    done: Boolean
    tags: [String]
    thumbnailId: String
    deleted: Boolean
  }

  extend type Subscription {
    linkCreated: LinkCreated!
  }

  type LinkCreated {
    link: Link!
  }
`;
