import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    token: String
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
  }

  type Query {
    getPosts: [Post!]!
    getPost(id: ID!): Post
    searchPosts(keyword: String!): [Post!]!
  }

  type Mutation {
    signup(email: String!, password: String!): User
    login(email: String!, password: String!): User
    createPost(title: String!, content: String!): Post
    updatePost(id: ID!, title: String!, content: String!): Post
    deletePost(id: ID!): String
  }
`;
