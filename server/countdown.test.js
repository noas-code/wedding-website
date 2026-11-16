import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weddingCountdown } from '../src/weddingCountdown.js';
import { wedding } from '../src/content.js';

const ceremonyTime = Date.parse(wedding.ceremonyStartsAt);

test('counts down to 20:00 in Israel on the wedding day', () => {
  const israelTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(ceremonyTime);
  const parts = Object.fromEntries(israelTime.map(part => [part.type, part.value]));
  assert.equal(parts.year, '2027');
  assert.equal(parts.month, '09');
  assert.equal(parts.day, '02');
  assert.equal(parts.hour, '20');
  assert.equal(parts.minute, '00');
  assert.deepEqual(weddingCountdown(ceremonyTime - 90061000), {
    days: 1, hours: 1, minutes: 1, seconds: 1, started: false,
  });
});

test('handles second boundaries and stops at zero after the ceremony starts', () => {
  assert.equal(weddingCountdown(ceremonyTime - 1).seconds, 1);
  assert.deepEqual(weddingCountdown(ceremonyTime - 86400000), {
    days: 1, hours: 0, minutes: 0, seconds: 0, started: false,
  });
  for (const now of [ceremonyTime, ceremonyTime + 86400000]) {
    assert.deepEqual(weddingCountdown(now), {
      days: 0, hours: 0, minutes: 0, seconds: 0, started: true,
    });
  }
});
