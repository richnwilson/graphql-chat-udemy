import express from 'express';
import cors from 'cors';
import { authMiddleware, handleLogin, decodeWebSocketsToken } from './auth.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { resolvers } from './resolvers.js';
import { readFile } from 'node:fs/promises';
import { getUser } from './db/users.js';
import { createServer  as createHttpServer }  from 'node:http';
import { useServer as useWebSocketServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { access } from 'node:fs';
const app = express();

// Allow Cross-Origin requests, return content in JSON type and use authentication middleware on every call
app.use(cors(),express.json(), authMiddleware);

app.post('/login',handleLogin);

const typeDefs = await readFile('./schema.graphql', 'utf8');
// We store the graph QL typeDefs and resolvers into a schema object so we can use
// in ApolloServer below, and then in WebSocketServer
const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer({schema});
await apolloServer.start();

// Http requests
const getHttpContext = async ({req}) => {
    if (req.auth) {
        const user = await getUser(req.auth.sub);
        return { user }
    } 
    return { }
}
app.use('/graphql',apolloMiddleware(apolloServer, { context: getHttpContext}));

// This stops the Cannot find module 'ico' error, which happens when a new instance of a browser is initiated. 
// - this just declares the route so it's doesn't - no code functionality needed
app.get('/favico.ico' , function(req , res){/*code*/});

const httpServer = createHttpServer(app)

// WebSockets request
// Since we need to associate a http server with the websockets server (it uses this initially to create the websocket connection)
// we need to create a server instance of app using createServer and associate to websockets
// and then in server.js
const getWebSocketsContext = ({ connectionParams : { accessToken = null} }) => {
    if (accessToken) {
        const payload = decodeWebSocketsToken(accessToken);
        return { user: payload.sub}
    }
    return {};
}
const webSocketServer = new WebSocketServer({server: httpServer, path: '/graphql'})
useWebSocketServer({ schema, context: getWebSocketsContext }, webSocketServer)

app.use((req, res) => {
    res.status(404).render(`Path- /${req.url} - not found`)
}
)
// httpServer is handling the app now so we need to pass this back to server.js
export default httpServer;