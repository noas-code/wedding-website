import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

function configuredRecovery() {
  const { PUBLIC_URL, RESEND_API_KEY, RESEND_FROM } = process.env;
  if (!PUBLIC_URL || !RESEND_API_KEY || !RESEND_FROM) return null;
  const siteUrl = new URL(PUBLIC_URL);
  if (siteUrl.protocol !== 'https:' && !(siteUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(siteUrl.hostname))) {
    throw new Error('PUBLIC_URL must use HTTPS, except for local development.');
  }
  if (siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) throw new Error('PUBLIC_URL must not include credentials, a query, or a fragment.');
  return {
    siteUrl: siteUrl.href,
    async sendEmail({ to, link }) {
      const result = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: RESEND_FROM, to: [to], subject: 'Your Noa & Tom RSVP edit link', text: `Use this link to edit your RSVP. It expires in 15 minutes and can be used once:\n\n${link}\n\nIf you did not request this link, you can ignore this email.` }),
      });
      if (!result.ok) throw new Error(`Email provider returned HTTP ${result.status}`);
    },
  };
}

export function createApp({ databasePath = resolve('data/rsvps.sqlite'), serveStatic = true, recovery = configuredRecovery() } = {}) {
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
    if (!columns.has('whatsapp_updates')) {
      database.exec('ALTER TABLE rsvps ADD COLUMN whatsapp_updates INTEGER NOT NULL DEFAULT 0');
      database.exec('UPDATE rsvps SET whatsapp_updates = CASE WHEN keep_updated = 1 AND has_whatsapp = 1 THEN 1 ELSE 0 END');
    }
    if (!columns.has('email_updates')) {
      database.exec('ALTER TABLE rsvps ADD COLUMN email_updates INTEGER NOT NULL DEFAULT 0');
      database.exec('UPDATE rsvps SET email_updates = CASE WHEN keep_updated = 1 AND has_whatsapp = 0 THEN 1 ELSE 0 END');
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
          edit_token TEXT NOT NULL DEFAULT '',
          whatsapp_updates INTEGER NOT NULL DEFAULT 0,
          email_updates INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO rsvps_next (id, email, name, attendance, guests, dietary, message, updated_at, phone, has_whatsapp, keep_updated, edit_token, whatsapp_updates, email_updates)
          SELECT id, email, name, attendance, guests, dietary, message, updated_at, phone, has_whatsapp, keep_updated, edit_token, whatsapp_updates, email_updates FROM rsvps;
        DROP TABLE rsvps;
        ALTER TABLE rsvps_next RENAME TO rsvps;
      `);
    }
    database.exec(`CREATE TABLE IF NOT EXISTS rsvp_recovery (
      token_hash TEXT PRIMARY KEY,
      rsvp_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`);
    database.exec(`CREATE TABLE IF NOT EXISTS recovery_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`);
    database.exec("CREATE UNIQUE INDEX IF NOT EXISTS rsvps_edit_token ON rsvps(edit_token) WHERE edit_token != ''");
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    database.close();
    throw error;
  }
  const save = database.prepare(`
    INSERT INTO rsvps (email, name, attendance, guests, dietary, message, phone, whatsapp_updates, email_updates, edit_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const update = database.prepare(`
    UPDATE rsvps SET email=?, name=?, attendance=?, guests=?, dietary=?, message=?,
      phone=?, whatsapp_updates=?, email_updates=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `);
  const findEmail = database.prepare('SELECT id FROM rsvps WHERE email=?');
  const findToken = database.prepare("SELECT * FROM rsvps WHERE edit_token=? AND edit_token != ''");
  const findEmailRow = database.prepare('SELECT * FROM rsvps WHERE email=?');
  const findPhoneRows = database.prepare(`SELECT * FROM rsvps WHERE
    replace(replace(replace(replace(replace(replace(phone, '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') = ?`);
  const hash = value => createHash('sha256').update(value).digest('hex');
  const limit = database.prepare(`INSERT INTO recovery_limits (key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires_at <= ? THEN 1 ELSE count + 1 END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING count`);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/api/rsvps/recovery', async (req, res, next) => {
    if (!recovery) return res.status(503).json({ error: 'RSVP recovery is not configured. Please contact Noa & Tom.' });
    const identifier = req.body?.identifier;
    if (typeof identifier !== 'string' || identifier.length > 254) return res.status(400).json({ error: 'Please enter your email address or phone number including the country code.' });
    const input = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const digits = input.replace(/\D/g, '');
    const isPhone = /^\+?[0-9 ()\-.]+$/.test(input) && /^\d{7,15}$/.test(digits);
    if (!isEmail && !isPhone) return res.status(400).json({ error: 'Please enter your email address or phone number including the country code.' });
    const normalized = isEmail ? input.toLowerCase() : digits;
    const now = Date.now();
    const expires = now + 15 * 60 * 1000;
    try {
      database.prepare('DELETE FROM recovery_limits WHERE expires_at <= ?').run(now);
      database.prepare('DELETE FROM rsvp_recovery WHERE expires_at <= ?').run(now);
      const ipCount = limit.get(`ip:${hash(req.socket.remoteAddress || '')}`, expires, now, now).count;
      const contactCount = limit.get(`contact:${hash(normalized)}`, expires, now, now).count;
      if (ipCount > 30 || contactCount > 3) return res.status(429).json({ error: 'Too many recovery requests. Please try again later.' });
      const rows = isEmail ? [findEmailRow.get(normalized)].filter(Boolean) : findPhoneRows.all(normalized);
      for (const row of rows) {
        const token = randomBytes(32).toString('hex');
        const tokenHash = hash(token);
        database.prepare('DELETE FROM rsvp_recovery WHERE rsvp_id=?').run(row.id);
        database.prepare('INSERT INTO rsvp_recovery (token_hash, rsvp_id, expires_at) VALUES (?, ?, ?)').run(tokenHash, row.id, expires);
        const link = new URL(recovery.siteUrl);
        link.hash = `recover=${token}`;
        try {
          await recovery.sendEmail({ to: row.email, link: link.href });
        } catch (error) {
          database.prepare('DELETE FROM rsvp_recovery WHERE token_hash=?').run(tokenHash);
          console.error('RSVP recovery email could not be sent:', error.message);
        }
      }
      res.set('Cache-Control', 'no-store').json({ message: 'If we find a matching RSVP, we will email a link. If it does not arrive, please contact Noa & Tom.' });
    } catch (error) {
      next(error);
    }
  });
  app.post('/api/rsvps/recovery/consume', (req, res, next) => {
    const token = req.body?.token;
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({ error: 'This recovery link is invalid or expired. Please request a new one.' });
    try {
      const recoveryRow = database.prepare('DELETE FROM rsvp_recovery WHERE token_hash=? AND expires_at>? RETURNING rsvp_id').get(hash(token), Date.now());
      const row = recoveryRow && database.prepare('SELECT * FROM rsvps WHERE id=?').get(recoveryRow.rsvp_id);
      if (!row) return res.status(400).json({ error: 'This recovery link is invalid or expired. Please request a new one.' });
      const editToken = row.edit_token || randomBytes(32).toString('hex');
      if (!row.edit_token) database.prepare('UPDATE rsvps SET edit_token=? WHERE id=?').run(editToken, row.id);
      res.set('Cache-Control', 'no-store').json({ token: editToken });
    } catch (error) {
      next(error);
    }
  });
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
        whatsappUpdates: Boolean(row.whatsapp_updates), emailUpdates: Boolean(row.email_updates),
      },
    });
  });
  function submit(req, res, next) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Please send a valid RSVP.' });
    }
    const { name, email, phone, whatsappUpdates, emailUpdates, attendance, guests, dietary = '', message = '' } = body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      return res.status(400).json({ error: 'Please enter your name (up to 120 characters).' });
    }
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof phone !== 'string' || phone.length > 40 || !/^\+?[0-9 ()\-.]+$/.test(phone.trim()) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid phone number with 7 to 15 digits, including your country code.' });
    }
    if (typeof whatsappUpdates !== 'boolean' || typeof emailUpdates !== 'boolean') {
      return res.status(400).json({ error: 'Please choose your wedding update preferences.' });
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
        attendance === 'yes' ? dietary.trim() : '', message.trim(), phone.trim(), Number(whatsappUpdates), Number(emailUpdates),
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
