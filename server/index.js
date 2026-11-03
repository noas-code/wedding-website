import { createApp } from './app.js';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const { app, database } = createApp({
  ...(process.env.DATABASE_PATH ? { databasePath: process.env.DATABASE_PATH } : {}),
});
const server = app.listen(port, host, () => {
  console.log(`Wedding website API / production server: http://${host}:${port}`);
});
function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
