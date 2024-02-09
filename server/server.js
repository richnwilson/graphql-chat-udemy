import dotenv from 'dotenv';
import { connectDB } from "./config/database.js";
import httpServer from './app.js';

dotenv.config({
    path: './.env'
});

// Initialize Database.
connectDB().then(() => {

});

// Start the server
const port = process.env.PORT;
httpServer.listen(port, () => {
  console.log(`App running on [ PORT ] : ${port}`);
  console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
});