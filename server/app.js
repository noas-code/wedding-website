import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function createApp({ databasePath = resolve('data/rsvps.sqlite'), serveStatic = true } = {}) {
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK(attendance IN ('yes', 'no')),
      guests TEXT NOT NULL,
      dietary TEXT NOT NULL,
      message TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const save = database.prepare(`
    INSERT INTO rsvps (email, name, attendance, guests, dietary, message)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name=excluded.name, attendance=excluded.attendance, guests=excluded.guests,
      dietary=excluded.dietary, message=excluded.message, updated_at=CURRENT_TIMESTAMP
  `);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/api/rsvps', (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Please send a valid RSVP.' });
    }
    const { name, email, attendance, guests, dietary = '', message = '' } = body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      return res.status(400).json({ error: 'Please enter your name (up to 120 characters).' });
    }
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!['yes', 'no'].includes(attendance)) {
      return res.status(400).json({ error: 'Please let us know whether you can attend.' });
    }
    if (!Array.isArray(guests) || guests.length > 10 || guests.some(guest => typeof guest !== 'string' || !guest.trim() || guest.trim().length > 120)) {
      return res.status(400).json({ error: 'Please enter a name for each guest (up to 10 guests).' });
    }
    if ((attendance === 'yes' && guests.length < 1) || (attendance === 'no' && guests.length !== 0)) {
      return res.status(400).json({ error: 'The guest list must match your attendance choice.' });
    }
    if (typeof dietary !== 'string' || dietary.length > 1000 || typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: 'Dietary notes must be under 1,000 characters and your message under 2,000.' });
    }
    try {
      save.run(email.trim().toLowerCase(), name.trim(), attendance, JSON.stringify(guests.map(guest => guest.trim())), dietary.trim(), message.trim());
      res.status(201).json({ message: attendance === 'yes' ? 'You’re on the list! We can’t wait to celebrate with you.' : 'We’ll miss you! Thank you for letting us know.' });
    } catch (error) {
      next(error);
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'This API endpoint does not exist.' }));
  if (serveStatic) {
    app.use(express.static(resolve('dist')));
    app.get('/{*path}', (_req, res) => res.sendFile(resolve('dist/index.html')));
  }
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Please send a valid JSON RSVP.' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Your RSVP is too large. Please shorten your notes.' });
    }
    console.error('Wedding server error:', error);
    res.status(500).json({ error: 'We couldn’t save your RSVP. Please try again.' });
  });
  return { app, database };
}
