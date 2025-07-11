import express from 'express';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

// middleware to parse json body
app.use(express.json());

// mount the main router
app.use('/', routes);

// Separate listen logic for testing environment to import app without starting the server directly.
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;