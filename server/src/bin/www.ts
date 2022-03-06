#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from 'http';
import { dbLoop } from '../spotify/looper';
import app from '../app';
import { logger } from '../tools/logger';
import { connect } from '../database';
import { getWithDefault } from '../tools/env';
import { fixRunningImportsAtStart } from '../database/queries/importer';
import { repairDatabase } from '../tools/repair';

/**
 * Get port from environment and store in Express.
 */

const port = getWithDefault('PORT', 8080);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  logger.debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

connect().then(async () => {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
  await repairDatabase().catch(logger.error);
  dbLoop().catch(logger.error);
  fixRunningImportsAtStart().catch(logger.error);
});
