import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectionRouter from './ROUTES/connection';
import usersRouter from './ROUTES/users';
import watchedMoviesRouter from './ROUTES/watchedMovies';
import watchListMoviesRouter from './ROUTES/watchListMovies';
import favoriteMoviesRouter from './ROUTES/favoriteMovies';
import  listsRouter from './ROUTES/lists';

import router from './ROUTES/routes';
import {decryptMiddleware } from './ENCRYPTION/encryptionMiddleware'; // Import your encryption/decryption functions

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use(decryptMiddleware);


const routers = [
  connectionRouter,
  usersRouter,
  watchedMoviesRouter,
  watchListMoviesRouter,
  favoriteMoviesRouter,
  listsRouter,
  router
];

routers.forEach(route => app.use(route));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
