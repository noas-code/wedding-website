import { test } from 'node:test';
import assert from 'node:assert/strict';
import { internationalPhone, splitPhone } from '../src/phone.js';

test('defaults new RSVPs to Israel without filling in a number', () => {
  assert.deepEqual(splitPhone(), { countryCode: '+972', number: '' });
});

test('restores saved country codes and separate numbers', () => {
  for (const [countryCode, number] of [
    ['+972', '50 123 4567'], ['+1', '(212) 555-0123'], ['+44', '7700 900123'],
    ['+386', '40 123 456'], ['+998', '90 123 4567'],
  ]) assert.deepEqual(splitPhone(internationalPhone(countryCode, number)), { countryCode, number });
});

test('recognizes existing compact international numbers and trims values', () => {
  assert.deepEqual(splitPhone('+972501234567'), { countryCode: '+972', number: '501234567' });
  assert.deepEqual(splitPhone('+447700900123'), { countryCode: '+44', number: '7700900123' });
  assert.equal(internationalPhone(' +44 ', ' 7700 900123 '), '+44 7700 900123');
});
