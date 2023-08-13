import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import * as path from 'path';
import cors from 'cors';

import indexRouter from './routes/index';
import oauthRouter from './routes/oauth';
import spotifyRouter from './routes/spotify';
import globalRouter from './routes/global';
import artistRouter from './routes/artist';
import albumRouter from './routes/album';
import importRouter from './routes/importer';
import trackRouter from './routes/track';
import searchRouter from './routes/search';
import { get } from './tools/env';

const app = express();

let corsValue = get('CORS')?.split(',');
if (corsValue?.[0] === 'all') {
  corsValue = undefined;
}

app.use(
  cors({
    origin: corsValue ?? true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/oauth', oauthRouter);
app.use('/spotify', spotifyRouter);
app.use('/global', globalRouter);
app.use('/artist', artistRouter);
app.use('/album', albumRouter);
app.use('/track', trackRouter);
app.use('/search', searchRouter);
app.use('/', importRouter);

export default app;
