import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wedding, events, trips, travelNotes, coupleRecommendations } from '../src/content.js';
import { buildTripPrompt } from '../src/tripPrompt.js';

test('uses the unambiguous wedding date throughout trip content', () => {
  assert.equal(wedding.displayDate, 'Sep 2nd, 2027');
  for (const trip of trips) {
    assert.ok(trip.stops.find(stop => stop.area.startsWith('HADERA')).description.includes(wedding.displayDate));
  }
  const copy = JSON.stringify({ wedding, events, trips, travelNotes });
  assert.doesNotMatch(copy, /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b|September 2\b/);
});

test('includes the confirmed venue and its clean external links', () => {
  assert.equal(wedding.venue.name, 'Al Hanahal');
  assert.equal(wedding.venue.translation, 'By the River');
  assert.equal(wedding.venue.website, 'https://eco.ocm.co.il/');
  assert.equal(wedding.venue.instagram, 'https://www.instagram.com/alhanahalevent/');
  assert.ok(events[0].description.includes(wedding.venue.name));
  assert.doesNotMatch(JSON.stringify({ events, travelNotes }), /venue (?:is |details are |will be )?(?:to come|once confirmed|is set)/i);
});

test('includes the six wedding events in both time formats and explains the Huppah', () => {
  assert.deepEqual(events.map(event => event.when), [
    '17:30 / 5:30 PM', '19:00 / 7 PM', '20:00 / 8 PM', '21:00 / 9 PM',
    '22:00 / 10 PM', '00:00 / 12 AM',
  ]);
  assert.match(events[0].description, /Tel Aviv Arlozorov Train Station/);
  assert.match(events[1].description, /reception/i);
  assert.equal(events[2].info, 'A chuppah (also spelled huppah) is the canopy under which a Jewish couple stands during their wedding, symbolizing the new home they will build together.');
  assert.deepEqual(events.slice(3).map(event => event.title), ['Full plates. Fuller hearts.', 'Meet us on the dance floor.', 'Still dancing? Good.']);
  const travelCopy = JSON.stringify({ trips, travelNotes });
  assert.match(travelCopy, /17:30 \/ 5:30 PM/);
  assert.doesNotMatch(travelCopy, /18:00 \/ 6 PM/);
  assert.equal(events.at(-1).description, 'Midnight, and even more dance. Some late-night refuel for one more song \u{1F354}. And then probably more \u{1F483}');
  for (const event of events) assert.match(event.description, /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(travelCopy, /transport is not yet confirmed|shuttle is available yet/);
});

test('provides his-and-hers recommendation categories without inventing personal favorites', () => {
  assert.deepEqual(coupleRecommendations.map(item => item.category), [
    'Coffee', 'Shawarma', 'Wine', 'Cocktails', 'Hike', 'Beach', 'Breakfast', 'Something sweet',
  ]);
  for (const item of coupleRecommendations) {
    assert.ok(item.emoji);
    assert.ok(item.tagline);
    assert.equal(item.noa, null);
    assert.equal(item.tom, null);
  }
});

test('builds length-specific planning prompts with wedding logistics and no invented picks', () => {
  for (const trip of trips) {
    const prompt = buildTripPrompt(trip.id);
    assert.ok(prompt.includes(wedding.displayDate));
    assert.ok(prompt.includes(wedding.venue.name));
    assert.ok(prompt.includes(events[0].when));
    assert.ok(prompt.includes(`return bus to Tel Aviv will leave the venue around ${wedding.returnBusDeparture}`));
    assert.match(prompt, /after midnight following the wedding/);
    assert.match(prompt, /recommendations.*are coming soon/);
    assert.match(prompt, /Do not book anything/);
    assert.doesNotMatch(prompt, /\bnull\b|\bundefined\b/);
  }
  assert.match(buildTripPrompt('short'), /3-4 days; ask which duration fits my flights/);
  assert.doesNotMatch(buildTripPrompt('short'), /Jerusalem|Jordan|Greece/);
  assert.match(buildTripPrompt('week'), /7 days.*Jerusalem/);
  assert.doesNotMatch(buildTripPrompt('week'), /Jordan|Greece/);
  const long = buildTripPrompt('long');
  assert.match(long, /10 days/);
  assert.match(long, /Jordan or Greece/);
  assert.match(long, /including travel days/);
  assert.match(long, /Do not assume direct flights, an open land crossing, or visa-free entry/);
});

test('includes only published personal recommendations in copied prompts', () => {
  const prompt = buildTripPrompt('week', [
    { category: 'Coffee', noa: 'Example Cafe', tom: null },
    { category: 'Beach', noa: null, tom: 'Example Beach' },
  ]);
  assert.match(prompt, /Coffee: Noa recommends Example Cafe/);
  assert.match(prompt, /Beach: Tom recommends Example Beach/);
  assert.doesNotMatch(prompt, /Tom recommends null|Noa recommends null/);
});

test('longer routes and prompts include Jerusalem, Dead Sea, wineries, and optional Eilat', () => {
  for (const id of ['week', 'long']) {
    const trip = trips.find(option => option.id === id);
    const jerusalem = trip.stops.find(stop => stop.area.startsWith('JERUSALEM'));
    assert.match(jerusalem.description, /two days/);
    assert.match(jerusalem.description, /Jewish, Christian, and Muslim/);
    assert.match(jerusalem.description, /winery.*Judean Hills/);
    assert.ok(trip.stops.some(stop => stop.area.startsWith('THE DEAD SEA')));
    const prompt = buildTripPrompt(id);
    assert.match(prompt, /two days in Jerusalem/);
    assert.match(prompt, /one day at the Dead Sea/);
    assert.match(prompt, /Judean Hills winery/);
  }
  assert.ok(trips.find(trip => trip.id === 'long').stops.some(stop => stop.area.startsWith('EILAT')));
  assert.ok(!trips.find(trip => trip.id === 'week').stops.some(stop => stop.area.startsWith('EILAT')));
  assert.match(buildTripPrompt('long'), /Ramon Airport near Eilat.*coral-reef diving/);
  assert.match(buildTripPrompt('long'), /required no-fly interval/);
  assert.doesNotMatch(buildTripPrompt('week'), /Eilat/);
});

test('separates transport guidance from the work-week explanation', () => {
  const weekend = travelNotes.find(note => note.title === 'The weekend rhythm');
  const transport = travelNotes.find(note => note.title === 'Transportation');
  assert.match(weekend.description, /Sunday through Thursday/);
  assert.match(weekend.description, /Friday and Saturday/);
  assert.doesNotMatch(weekend.description, /transport|buses|railways/i);
  for (const detail of [/railways and buses/, /train stations/, /Moovit and Pango/, /Apple Pay/, /Tel Aviv/, /modified schedules/, /local exceptions/, /recommended itineraries/]) {
    assert.match(transport.description, detail);
  }
});

test('provides car-sharing links and conditional international permit guidance', () => {
  const driving = travelNotes.find(note => note.title === 'Car sharing & driving');
  assert.match(driving.description, /few hours/);
  assert.match(driving.description, /foreign-licence eligibility/);
  assert.match(driving.description, /International Driving Permit/);
  assert.match(driving.description, /does not replace it/);
  assert.deepEqual(driving.links.map(link => new URL(link.url).hostname), ['www.autotel.co.il', 'gotoglobal.com']);
});
