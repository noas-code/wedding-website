import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from './app.js';

const valid = { name: 'Guest One', email: 'guest@example.com', phone: '+972 50 123 4567', hasWhatsapp: true, keepUpdated: true, attendance: 'yes', guests: ['Guest One'], dietary: 'Vegetarian', message: 'See you there!' };

async function fixture(t) {
  const { app, database } = createApp({ databasePath: ':memory:', serveStatic: false });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    database.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    database, base,
    post: body => fetch(`${base}/api/rsvps`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    put: (body, token) => fetch(`${base}/api/rsvps/me`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    get: token => fetch(`${base}/api/rsvps/me`, { headers: { Authorization: `Bearer ${token}` } }),
  };
}

test('saves contact preferences and edits an RSVP with its private access key', async t => {
  const { post, put, get, database } = await fixture(t);
  const created = await post({ ...valid, email: ' Guest@Example.com ' });
  assert.equal(created.status, 201);
  const { token } = await created.json();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.deepEqual((await (await get(token)).json()).rsvp, valid);
  assert.equal((await put({ ...valid, attendance: 'no', guests: [], hasWhatsapp: false, keepUpdated: false }, token)).status, 200);
  const rows = database.prepare('SELECT * FROM rsvps').all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, 'guest@example.com');
  assert.equal(rows[0].attendance, 'no');
  assert.deepEqual(JSON.parse(rows[0].guests), []);
  assert.equal(rows[0].phone, valid.phone);
  assert.equal(rows[0].has_whatsapp, 0);
  assert.equal(rows[0].keep_updated, 0);
  assert.equal(rows[0].dietary, '');
});

test('saves an undecided reply and lets the guest change their decision later', async t => {
  const { post, put, get, database } = await fixture(t);
  const undecided = { ...valid, attendance: 'undecided', guests: [], dietary: '' };
  const created = await post(undecided);
  assert.equal(created.status, 201);
  const { token, message } = await created.json();
  assert.match(message, /undecided/);
  assert.deepEqual((await (await get(token)).json()).rsvp, undecided);
  for (const reply of [
    { ...valid, guests: [valid.name, 'Guest Two'] },
    { ...valid, attendance: 'no', guests: [], dietary: '' },
    undecided,
  ]) {
    assert.equal((await put(reply, token)).status, 200);
    assert.deepEqual((await (await get(token)).json()).rsvp, reply);
  }
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rsvps').get().count, 1);
});

test('rejects invalid fields and inconsistent attendance without saving', async t => {
  const { post, database } = await fixture(t);
  for (const invalid of [
    [], {}, { ...valid, name: '' }, { ...valid, email: 'not-an-email' },
    { ...valid, attendance: 'maybe' }, { ...valid, guests: [] },
    { ...valid, guests: [''] }, { ...valid, guests: [42] },
    { ...valid, guests: Array(11).fill('Guest') },
    { ...valid, attendance: 'no' }, { ...valid, attendance: 'undecided' }, { ...valid, dietary: 42 },
    { ...valid, message: 'a'.repeat(2001) },
    { ...valid, phone: '' }, { ...valid, phone: '123' },
    { ...valid, phone: '1234567890123456' }, { ...valid, phone: 'call me maybe' },
    { ...valid, phone: '+972<script>501234567' }, { ...valid, phone: null },
    { ...valid, hasWhatsapp: undefined }, { ...valid, hasWhatsapp: 'yes' },
    { ...valid, keepUpdated: null }, { ...valid, keepUpdated: 1 },
    { ...valid, guests: ['Someone Else'] },
  ]) assert.equal((await post(invalid)).status, 400);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rsvps').get().count, 0);
});

test('requires private access to retrieve or change a saved RSVP', async t => {
  const { post, put, get, database } = await fixture(t);
  await post(valid);
  assert.equal((await post({ ...valid, phone: '+972 50 999 9999' })).status, 409);
  for (const token of ['', 'invalid', 'a'.repeat(64)]) {
    assert.equal((await get(token)).status, 401);
    assert.equal((await put(valid, token)).status, 401);
  }
  assert.equal(database.prepare('SELECT phone FROM rsvps').get().phone, valid.phone);
});

test('allows email changes without duplicates and prevents taking another email', async t => {
  const { post, put, get, database } = await fixture(t);
  const { token } = await (await post(valid)).json();
  await post({ ...valid, email: 'another@example.com' });
  assert.equal((await put({ ...valid, email: 'another@example.com' }, token)).status, 409);
  const changed = { ...valid, email: 'new@example.com', hasWhatsapp: false, keepUpdated: true };
  assert.equal((await put(changed, token)).status, 200);
  assert.deepEqual((await (await get(token)).json()).rsvp, changed);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rsvps').get().count, 2);
});

test('handles malformed JSON and excessive payloads with explicit errors', async t => {
  const { base } = await fixture(t);
  for (const [body, status] of [['{bad', 400], [JSON.stringify({ message: 'a'.repeat(17000) }), 413]]) {
    const response = await fetch(`${base}/api/rsvps`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    assert.equal(response.status, status);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('preserves legacy RSVPs and migrates the database idempotently', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wedding-test-'));
  const path = join(directory, 'rsvps.sqlite');
  try {
    const legacy = new DatabaseSync(path);
    legacy.exec(`CREATE TABLE rsvps (
      id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      attendance TEXT NOT NULL, guests TEXT NOT NULL, dietary TEXT NOT NULL,
      message TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    legacy.prepare("INSERT INTO rsvps (email, name, attendance, guests, dietary, message) VALUES (?, ?, ?, ?, ?, ?)").run(valid.email, valid.name, 'yes', JSON.stringify(valid.guests), '', '');
    legacy.close();
    const first = createApp({ databasePath: path, serveStatic: false });
    const row = first.database.prepare('SELECT * FROM rsvps').get();
    assert.equal(row.name, valid.name);
    assert.equal(row.phone, '');
    assert.equal(row.has_whatsapp, 0);
    assert.equal(row.keep_updated, 0);
    first.database.prepare('UPDATE rsvps SET phone=?, has_whatsapp=1, keep_updated=1, edit_token=?').run(valid.phone, 'b'.repeat(64));
    first.database.close();
    const second = createApp({ databasePath: path, serveStatic: false });
    assert.equal(second.database.prepare('SELECT name FROM rsvps').get().name, valid.name);
    assert.equal(second.database.prepare('SELECT phone, edit_token FROM rsvps').get().phone, valid.phone);
    assert.equal(second.database.prepare('SELECT edit_token FROM rsvps').get().edit_token, 'b'.repeat(64));
    second.database.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('extends the old attendance constraint without losing responses or edit keys', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wedding-attendance-test-'));
  const path = join(directory, 'rsvps.sqlite');
  try {
    const legacy = new DatabaseSync(path);
    legacy.exec(`CREATE TABLE rsvps (
      id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK(attendance IN ('yes', 'no')),
      guests TEXT NOT NULL, dietary TEXT NOT NULL, message TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      phone TEXT NOT NULL DEFAULT '', has_whatsapp INTEGER NOT NULL DEFAULT 0,
      keep_updated INTEGER NOT NULL DEFAULT 0, edit_token TEXT NOT NULL DEFAULT ''
    );
    CREATE UNIQUE INDEX rsvps_edit_token ON rsvps(edit_token) WHERE edit_token != '';`);
    const insert = legacy.prepare('INSERT INTO rsvps (id, email, name, attendance, guests, dietary, message, updated_at, phone, has_whatsapp, keep_updated, edit_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run(11, valid.email, valid.name, 'yes', JSON.stringify(valid.guests), valid.dietary, valid.message, '2026-11-03 12:00:00', valid.phone, 1, 1, 'c'.repeat(64));
    insert.run(12, 'declined@example.com', 'Guest Two', 'no', '[]', '', 'Sending love!', '2026-11-03 13:00:00', '+44 7700 900123', 0, 1, 'd'.repeat(64));
    const original = legacy.prepare('SELECT * FROM rsvps ORDER BY id').all();
    legacy.close();
    const first = createApp({ databasePath: path, serveStatic: false });
    try {
      assert.deepEqual(first.database.prepare('SELECT * FROM rsvps ORDER BY id').all(), original);
      first.database.prepare("UPDATE rsvps SET attendance='undecided', guests='[]', dietary='' WHERE id=11").run();
      assert.throws(() => first.database.prepare("UPDATE rsvps SET attendance='maybe' WHERE id=11").run());
      assert.throws(() => first.database.prepare('UPDATE rsvps SET edit_token=? WHERE id=12').run('c'.repeat(64)));
    } finally {
      first.database.close();
    }
    const second = createApp({ databasePath: path, serveStatic: false });
    try {
      const restored = second.database.prepare('SELECT * FROM rsvps WHERE id=11').get();
      assert.equal(restored.attendance, 'undecided');
      assert.equal(restored.edit_token, original[0].edit_token);
      assert.deepEqual(second.database.prepare('SELECT * FROM rsvps WHERE id=12').get(), original[1]);
    } finally {
      second.database.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('does not expose guest details over the API', async t => {
  const { post, base } = await fixture(t);
  await post(valid);
  const response = await fetch(`${base}/api/rsvps`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'This API endpoint does not exist.' });
});
