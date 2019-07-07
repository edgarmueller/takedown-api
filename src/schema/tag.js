import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    tags: TagConnection
  }

  type TagConnection {
    edges: [Tag]!
  }

  extend type Mutation {
    createTag(tagName: String!): Tag!
    deleteTag(id: ID!): Boolean!
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    createdAt: Date!
    user: User!
    links: [Link]!
  }

  extend type Subscription {
    tagCreated: TagCreated!
  }

  type TagCreated {
    tag: Tag!
  }
`;