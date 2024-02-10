import { ApolloClient, ApolloLink, concat, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { getAccessToken } from '../auth';
// Needed for Web Sockets
import { GraphQLWsLink as GraphQLWebSocketsLink } from '@apollo/client/link/subscriptions';
import { createClient as createWebSocketsClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';


// Add authentication to all http links
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

// Types of protocol requests
// - http (triggered everytime API requested in client)
//  - Bearer token included in each http request
const httpLink = concat( authLink, createHttpLink({ 
  uri: `http://localhost:${process.env.REACT_APP_PORT}/graphql`
}));

// - WebSockets (one connection triggered on page load and sustained the whole session - single load)
//  - Without authentication, someone could trigger the subscription on Apollo Server UI (/graphql) and then keep listening for all chat messages ( perhaps in a group that was private )
//  - connectionParams is triggered once authenticated and then token sent via parameters to server
const webSocketsLink = new GraphQLWebSocketsLink(createWebSocketsClient({
  url: `ws://localhost:${process.env.REACT_APP_PORT}/graphql`,
  connectionParams: () => ({ accessToken: getAccessToken() })
}));

// Used to determine call type - webSockets v http
const isSubscription = (operation) => {
  const { kind, operation : op } = getMainDefinition(operation.query);
  return kind === Kind.OPERATION_DEFINITION && op === OperationTypeNode.SUBSCRIPTION;
}

export const apolloClient = new ApolloClient({
  link: split(isSubscription, webSocketsLink, httpLink), // Use Split to determine action required. If subscriptions, then we use webSockets otherwise http
  cache: new InMemoryCache(),
});
