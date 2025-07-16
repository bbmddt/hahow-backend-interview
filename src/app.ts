import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import routes from './routes';
import errorHandler from './middlewares/errorHandler.middleware';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/', routes);

// The error handler must be registered AFTER all other middleware and routes
app.use(errorHandler);

// Separate listen logic for testing environment to import app without starting the server directly.
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
  });
}

export default app;
