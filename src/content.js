export const wedding = {
  names: ['Noa', 'Tom'],
  destination: 'Hadera, Israel',
  displayDate: 'Sep 2nd, 2027',
  ceremonyStartsAt: '2027-09-02T20:00:00+03:00',
  venue: {
    name: 'Al Hanahal',
    translation: 'By the River',
    website: 'https://eco.ocm.co.il/',
    instagram: 'https://www.instagram.com/alhanahalevent/',
  },
};

export const events = [
  { when: '17:30 / 5:30 PM', title: 'Next stop: the wedding.', description: 'Pickup from Tel Aviv Arlozorov Train Station for the journey to Al Hanahal. \u{1F68C}' },
  { when: '19:00 / 7 PM', title: 'Hello, favorite people.', description: 'Arrival and reception at Al Hanahal (By the River). Find your people, settle in, and let the evening begin. \u{1F942}' },
  { when: '20:00 / 8 PM', title: 'A very big little word: yes.', description: 'The ceremony - Huppah. Our yes, under one canopy. A moment for the two of us, shared with all of you. \u{1F48D}', info: 'A chuppah (also spelled huppah) is the canopy under which a Jewish couple stands during their wedding, symbolizing the new home they will build together.' },
  { when: '21:00 / 9 PM', title: 'Full plates. Fuller hearts.', description: 'Dinner, conversation, and a toast to being together. \u{1F37D}\uFE0F Add your dietary needs to your RSVP so we can plan ahead.' },
  { when: '22:00 / 10 PM', title: 'Meet us on the dance floor.', description: 'The dance floor is calling. This is your cue. \u{1FAA9}' },
  { when: '00:00 / 12 AM', title: 'Still dancing? Good.', description: 'Midnight, and even more dance. Some late-night refuel for one more song \u{1F354}. And then probably more \u{1F483}' },
];

const telAviv = { area: 'TEL AVIV-JAFFA / ARRIVE & EXHALE', title: 'Start with a sea breeze.', description: 'Ease into the trip with a walk along the promenade, a wander through old Jaffa, and a long lunch. Leave room for the Carmel Market and an unhurried coffee.', tip: 'Our recipe: explore in the morning, hide from the midday heat, return for sunset.' };
const hadera = { area: 'HADERA & THE COAST / THE MAIN EVENT', title: 'A wedding, with a side of sea.', description: `Be near Hadera for ${wedding.displayDate}, when we celebrate at ${wedding.venue.name}. If you have a spare morning, consider Caesarea for ancient ruins beside the water, or a relaxed coastal stop nearby.`, tip: 'Leave plenty of time to get ready. Wedding pickup is at 17:30 / 5:30 PM from Tel Aviv Arlozorov Train Station.' };
const jerusalem = { area: 'JERUSALEM / A CHANGE OF PACE', title: 'Streets with stories.', description: 'Allow a full day or two for Jerusalem. Explore the Old City respectfully, then make time for the food stalls around Mahane Yehuda. A local guide can add a lot to the experience.', tip: 'Bring comfortable shoes and clothing that covers shoulders and knees for religious sites.' };
const north = { area: 'THE NORTH / THE SLOW FINISH', title: 'Take the scenic way home.', description: 'If conditions allow, add Haifa and a coastal day around Acre, or trade another city for a slower countryside stay. Keep this part flexible rather than packing every day.', tip: 'Check current travel advice and site access before planning northern excursions.' };

export const trips = [
  { id: 'short', label: 'The long weekend', duration: '3-4 days', subtitle: 'SHORT TRIP. GOOD PRIORITIES.', title: 'A little coast, a big celebration.', description: 'For the fly-in, hug-everyone, dance-all-night crowd. Keep the route simple and let the wedding be the centerpiece.', stops: [telAviv, hadera] },
  { id: 'week', label: 'The sweet spot', duration: '7 days', subtitle: 'OUR VOTE: STAY A LITTLE LONGER.', title: 'One week. Three different rhythms.', description: `A few days by the sea, our wedding in the middle, and time for Jerusalem. Arrange the order around ${wedding.displayDate} rather than racing through a checklist.`, stops: [telAviv, hadera, jerusalem] },
  { id: 'long', label: 'The full adventure', duration: '10 days', subtitle: 'FOR THE JUST-ONE-MORE-DAY PEOPLE.', title: 'Room to wander. Room to breathe.', description: 'Take the one-week route and give it space. Add the north if travel advice allows, stay an extra night somewhere you love, and never skip lunch for an itinerary.', stops: [telAviv, hadera, jerusalem, north] },
];

export const coupleRecommendations = [
  { category: 'Coffee', emoji: '\u2615', tagline: 'First coffee. Then everything else.', noa: null, tom: null },
  { category: 'Shawarma', emoji: '\u{1F959}', tagline: 'A very important research project.', noa: null, tom: null },
  { category: 'Wine', emoji: '\u{1F377}', tagline: 'One glass. A very long lunch.', noa: null, tom: null },
  { category: 'Cocktails', emoji: '\u{1F378}', tagline: 'For the pre-party party.', noa: null, tom: null },
  { category: 'Hike', emoji: '\u{1F97E}', tagline: 'Take the scenic route.', noa: null, tom: null },
  { category: 'Beach', emoji: '\u{1F3D6}\uFE0F', tagline: 'Saltwater fixes most things.', noa: null, tom: null },
  { category: 'Breakfast', emoji: '\u{1F373}', tagline: 'Worth getting out of bed for.', noa: null, tom: null },
  { category: 'Something sweet', emoji: '\u{1F366}', tagline: 'There is always room.', noa: null, tom: null },
];

export const travelNotes = [
  { title: 'Before you book', description: 'Check whether you need a visitor visa for Israel based on your nationality before booking your trip. The Israeli embassy guide explains the application process and required documents. Requirements can change, so confirm the latest rules with the Israeli embassy or consulate responsible for your country before travelling.', url: 'https://embassies.gov.il/usa/en/services/foreign-citizens/entry-visa-visiting-or-touring-israel', linkLabel: 'Read the official visitor visa guide (USA)' },
  { title: 'Getting to Hadera', description: 'Wedding pickup is at 17:30 / 5:30 PM from Tel Aviv Arlozorov Train Station, with arrival at Al Hanahal at 19:00 / 7 PM. Travelling independently? Hadera West has rail connections, but you will need onward transport to the venue. Return transport details are still to come.' },
  { title: 'The weekend rhythm', description: 'The wedding is on Thursday. Many public transport services stop from Friday afternoon into Saturday evening and on holidays. Check actual schedules before booking onward travel; taxis or a rental car may be needed.' },
  { title: 'September essentials', description: 'Expect warm weather: pack sunscreen, water, light layers, and comfortable shoes. Plan outdoor exploring early or late. Keep wedding attire flexible until we announce the dress code.' },
  { title: 'Where to stay', description: 'Stay near Hadera on the wedding night if you want a simpler journey home. Tel Aviv works as a city base for other days, but requires travel time. No hotel blocks or venue-specific accommodation are confirmed yet.' },
];
