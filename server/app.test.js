import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createApp } from './app.js';

const valid = { name: 'Guest One', email: 'guest@example.com', attendance: 'yes', guests: ['Guest One'], dietary: 'Vegetarian', message: 'See you there!' };

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
  };
}

test('saves an RSVP and updates the same normalized email without duplicates', async t => {
  const { post, database } = await fixture(t);
  assert.equal((await post({ ...valid, email: ' Guest@Example.com ' })).status, 201);
  assert.equal((await post({ ...valid, attendance: 'no', guests: [] })).status, 201);
  const rows = database.prepare('SELECT * FROM rsvps').all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, 'guest@example.com');
  assert.equal(rows[0].attendance, 'no');
  assert.deepEqual(JSON.parse(rows[0].guests), []);
});

test('rejects invalid fields and inconsistent attendance without saving', async t => {
  const { post, database } = await fixture(t);
  for (const invalid of [
    [], {}, { ...valid, name: '' }, { ...valid, email: 'not-an-email' },
    { ...valid, attendance: 'maybe' }, { ...valid, guests: [] },
    { ...valid, guests: [''] }, { ...valid, guests: [42] },
    { ...valid, guests: Array(11).fill('Guest') },
    { ...valid, attendance: 'no' }, { ...valid, dietary: 42 },
    { ...valid, message: 'a'.repeat(2001) },
  ]) assert.equal((await post(invalid)).status, 400);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rsvps').get().count, 0);
});

test('handles malformed JSON and excessive payloads with explicit errors', async t => {
  const { base } = await fixture(t);
  for (const [body, status] of [['{bad', 400], [JSON.stringify({ message: 'a'.repeat(17000) }), 413]]) {
    const response = await fetch(`${base}/api/rsvps`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    assert.equal(response.status, status);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('persists responses after the database is reopened', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wedding-test-'));
  const path = join(directory, 'rsvps.sqlite');
  try {
    const first = createApp({ databasePath: path, serveStatic: false });
    first.database.prepare("INSERT INTO rsvps (email, name, attendance, guests, dietary, message) VALUES (?, ?, ?, ?, ?, ?)").run(valid.email, valid.name, 'yes', JSON.stringify(valid.guests), '', '');
    first.database.close();
    const second = createApp({ databasePath: path, serveStatic: false });
    assert.equal(second.database.prepare('SELECT name FROM rsvps').get().name, valid.name);
    second.database.close();
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
