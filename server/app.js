import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

export function createApp({ databasePath = resolve('data/rsvps.sqlite'), serveStatic = true } = {}) {
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK(attendance IN ('yes', 'no', 'undecided')),
      guests TEXT NOT NULL,
      dietary TEXT NOT NULL,
      message TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  database.exec('BEGIN IMMEDIATE');
  try {
    const columns = new Set(database.prepare('PRAGMA table_info(rsvps)').all().map(column => column.name));
    for (const [name, type] of [
      ['phone', "TEXT NOT NULL DEFAULT ''"],
      ['has_whatsapp', 'INTEGER NOT NULL DEFAULT 0'],
      ['keep_updated', 'INTEGER NOT NULL DEFAULT 0'],
      ['edit_token', "TEXT NOT NULL DEFAULT ''"],
    ]) {
      if (!columns.has(name)) database.exec(`ALTER TABLE rsvps ADD COLUMN ${name} ${type}`);
    }
    const schema = database.prepare("SELECT sql FROM sqlite_schema WHERE type='table' AND name='rsvps'").get().sql;
    if (!schema.includes("'undecided'")) {
      // SQLite requires rebuilding the table to extend its attendance CHECK constraint.
      database.exec(`
        CREATE TABLE rsvps_next (
          id INTEGER PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          attendance TEXT NOT NULL CHECK(attendance IN ('yes', 'no', 'undecided')),
          guests TEXT NOT NULL,
          dietary TEXT NOT NULL,
          message TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          phone TEXT NOT NULL DEFAULT '',
          has_whatsapp INTEGER NOT NULL DEFAULT 0,
          keep_updated INTEGER NOT NULL DEFAULT 0,
          edit_token TEXT NOT NULL DEFAULT ''
        );
        INSERT INTO rsvps_next (id, email, name, attendance, guests, dietary, message, updated_at, phone, has_whatsapp, keep_updated, edit_token)
          SELECT id, email, name, attendance, guests, dietary, message, updated_at, phone, has_whatsapp, keep_updated, edit_token FROM rsvps;
        DROP TABLE rsvps;
        ALTER TABLE rsvps_next RENAME TO rsvps;
      `);
    }
    database.exec("CREATE UNIQUE INDEX IF NOT EXISTS rsvps_edit_token ON rsvps(edit_token) WHERE edit_token != ''");
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    database.close();
    throw error;
  }
  const save = database.prepare(`
    INSERT INTO rsvps (email, name, attendance, guests, dietary, message, phone, has_whatsapp, keep_updated, edit_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const update = database.prepare(`
    UPDATE rsvps SET email=?, name=?, attendance=?, guests=?, dietary=?, message=?,
      phone=?, has_whatsapp=?, keep_updated=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `);
  const findEmail = database.prepare('SELECT id FROM rsvps WHERE email=?');
  const findToken = database.prepare("SELECT * FROM rsvps WHERE edit_token=? AND edit_token != ''");
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  function authorize(req, res, next) {
    const token = req.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const row = token ? findToken.get(token) : undefined;
    if (!row) return res.status(401).json({ error: 'Your RSVP edit access is not valid. Please use the browser where you replied, or contact Noa & Tom.' });
    res.locals.rsvp = row;
    next();
  }
  app.get('/api/rsvps/me', authorize, (_req, res) => {
    const row = res.locals.rsvp;
    res.set('Cache-Control', 'no-store').json({
      rsvp: {
        name: row.name, email: row.email, phone: row.phone, attendance: row.attendance,
        guests: JSON.parse(row.guests), dietary: row.dietary, message: row.message,
        hasWhatsapp: Boolean(row.has_whatsapp), keepUpdated: Boolean(row.keep_updated),
      },
    });
  });
  function submit(req, res, next) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Please send a valid RSVP.' });
    }
    const { name, email, phone, hasWhatsapp, keepUpdated, attendance, guests, dietary = '', message = '' } = body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      return res.status(400).json({ error: 'Please enter your name (up to 120 characters).' });
    }
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof phone !== 'string' || phone.length > 40 || !/^\+?[0-9 ()\-.]+$/.test(phone.trim()) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid phone number with 7 to 15 digits, including your country code.' });
    }
    if (typeof hasWhatsapp !== 'boolean' || typeof keepUpdated !== 'boolean') {
      return res.status(400).json({ error: 'Please choose whether you have WhatsApp and whether you want wedding updates.' });
    }
    if (!['yes', 'no', 'undecided'].includes(attendance)) {
      return res.status(400).json({ error: 'Please choose whether you can attend, cannot attend, or do not know yet.' });
    }
    if (!Array.isArray(guests) || guests.length > 10 || guests.some(guest => typeof guest !== 'string' || !guest.trim() || guest.trim().length > 120)) {
      return res.status(400).json({ error: 'Please enter a name for each guest (up to 10 guests).' });
    }
    if ((attendance === 'yes' && guests.length < 1) || (attendance !== 'yes' && guests.length !== 0)) {
      return res.status(400).json({ error: 'The guest list must match your attendance choice.' });
    }
    if (attendance === 'yes' && guests[0].trim() !== name.trim()) {
      return res.status(400).json({ error: 'The first guest must be the person submitting the RSVP.' });
    }
    if (typeof dietary !== 'string' || dietary.length > 1000 || typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: 'Dietary notes must be under 1,000 characters and your message under 2,000.' });
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = findEmail.get(normalizedEmail);
      const current = res.locals.rsvp;
      if (existing && existing.id !== current?.id) {
        return res.status(409).json({ error: 'This email already has an RSVP. Use the browser where you replied to edit it, or contact Noa & Tom.' });
      }
      const values = [
        normalizedEmail, name.trim(), attendance, JSON.stringify(guests.map(guest => guest.trim())),
        attendance === 'yes' ? dietary.trim() : '', message.trim(), phone.trim(), Number(hasWhatsapp), Number(keepUpdated),
      ];
      const token = current?.edit_token || randomBytes(32).toString('hex');
      if (current) update.run(...values, current.id);
      else save.run(...values, token);
      res.set('Cache-Control', 'no-store').status(current ? 200 : 201).json({
        token,
        message: attendance === 'yes' ? 'You’re on the list! We can’t wait to celebrate with you.' : attendance === 'undecided' ? 'Your RSVP is saved as undecided. Update your reply when your plans are clearer.' : 'We’ll miss you! Thank you for letting us know.',
      });
    } catch (error) {
      next(error);
    }
  }
  app.post('/api/rsvps', submit);
  app.put('/api/rsvps/me', authorize, submit);
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
