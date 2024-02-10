import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import { PubSub } from 'graphql-subscriptions';

// ^^^ IMPORTANT PubSub might not be production ready as only works with a single server instance

/* When using WebSockets, we nee do declare the Subscription method
   but this won't return an object like Query or Mutation but instead
   will return a function based on actions with the associated trigger word - 'MESSAGE_ADDED' in this case
   Need to install graphql-subscriptions library to act as async iterator on Subscriptions
   We add this to the Mutation that we want to associate to the trigger in Subscription 
   and then send the new data to the listener (based on the schema returned data structure)

   A nice way to see this in action is to use the Apollo server UI and create a subscription operation i.e. in our case:

   subscription Subscription {
      messageAdded {
        user
        text
        id
      }
   }

   and then run this subscription - this will show the listener websockets running in the bottom right and waiting for input
   If we then add a chat message in Client UI, you will see the response update in realtime
   Once done testing, just click the X next to Subscriptions in the bottom right pane.
*/
const TRIGGER = 'MESSAGE_ADDED';

// Publish and Subscribe class for Subscription
const pubSub = new PubSub()

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      try {
        if (!user) throw unauthorizedError();
        const message =  await createMessage(user, text);
        // Trigger to publish to cache when this new message mutation is triggered
        // TRIGGER name must match the subscription event
        pubSub.publish(TRIGGER, { messageAdded: { ...message }});
        return message;
      } catch (e) {
        unauthorizedError();
      }
    },
  },
  Subscription: {  
    messageAdded: {
      subscribe: (_root, _args, { user }) => {
        if (!user) throw unauthorizedError();
        return pubSub.asyncIterator(TRIGGER);
      }
    }
  }
}

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' }
  });
}
