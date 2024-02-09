import { gql } from '@apollo/client';

export const messagesQuery = gql`
  query MessagesQuery {
    messages {
      _id
      user
      text
    }
  }
`;

export const addMessageMutation = gql`
  mutation AddMessageMutation($text: String!) {
    message: addMessage(text: $text) {
      _id
      user
      text
    }
  }
`;

export const messageAddedSubscription = gql`
  subscription MessageAddedSubscription {
    message: messageAdded {
      user
      text
      _id
    }
  }
`