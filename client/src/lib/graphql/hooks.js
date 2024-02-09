import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { addMessageMutation, messageAddedSubscription, messagesQuery } from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  // Remember, default is to 'cache-first' so won't update unless refreshed
  // - code below takes the new message and 'updates' (cache.updateQuery) to existing ROOT_QUERY caches messages array of data
  // - problem is that multiple users are accessing chat tool and will have a different version of chat history in cache 
  // - SO THIS OPTION NOT IDEAL IN THIS SITUATION
  const addMessage = async (text) => {
    const { data: { message } } = await mutate({
      variables: { text } // We don't need to worry about adding the new message to the cache, since WebSockets is tracking this below in UseMessages
    });
    return message;
  };

  return { addMessage };
}

export function useMessages() {
  // Grab all messages - both from DB and cache (using webSockets - subscriptions)
  // - DB
  const { data } = useQuery(messagesQuery);
  // - From WebSockets updates, regardless of user browser
  useSubscription(messageAddedSubscription, {
    onData: ({ client: { cache }, data: { data: { message }}}) => {
      cache.updateQuery({query: messagesQuery}, ({messages}) => {
        return {
         messages: [ ...messages, message]
        } 
       })
    }
  })
  return {
    messages: data?.messages ?? [],
  };
}
