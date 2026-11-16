export const wedding = {
  names: ['Noa', 'Tom'],
  destination: 'Hadera, Israel',
  displayDate: 'Sep 2nd, 2027',
  ceremonyStartsAt: '2027-09-02T20:00:00+03:00',
  returnBusDeparture: '01:00 / 1 AM',
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
const jerusalem = { area: 'JERUSALEM / TWO DAYS OF STORIES', title: 'History, faith & a little wine.', description: 'Spend two days exploring Jerusalem: discover the Old City and its Jewish, Christian, and Muslim histories and traditions, then make time for Mahane Yehuda and the city beyond the walls. A local guide can bring the different perspectives to life. Consider a winery visit in the nearby Judean Hills if it fits your schedule.', tip: 'Dress respectfully at religious sites, check visitor access, and book winery visits ahead. Arrange a driver or tour for tastings rather than driving after drinking.' };
const deadSea = { area: 'THE DEAD SEA / ONE DAY TO FLOAT', title: 'A slower day, below sea level.', description: 'Set aside one day for the Dead Sea, with a relaxed float at a designated bathing beach and time to enjoy the desert scenery. It can work as a day trip from Jerusalem; allow for the journey rather than adding another packed sightseeing day.', tip: 'September can be very hot. Bring water and sun protection, use an open designated beach, and follow local bathing guidance. Check current access and transport before setting out.' };
const north = { area: 'THE NORTH / THE SLOW FINISH', title: 'Take the scenic way home.', description: 'If conditions allow, add Haifa and a coastal day around Acre, or trade another city for a slower countryside stay. Keep this part flexible rather than packing every day.', tip: 'Check current travel advice and site access before planning northern excursions.' };
const eilat = { area: 'EILAT / AN OPTIONAL REEF ADVENTURE', title: 'Take the plunge.', description: 'For the 10-day trip, consider flying to Ramon Airport near Eilat for a Red Sea extension. Dive around the coral reef with a licensed local operator, or choose snorkeling if that suits you better. Treat this as an alternative to a northern or overseas extension, not another stop to squeeze in.', tip: 'Check flight routes, airport transfers, reef access, and operator requirements before booking. Leave enough time for a proper stay, follow reef-protection rules, and ask your dive operator about the required no-fly interval after diving.' };

export const trips = [
  { id: 'short', label: 'The long weekend', duration: '3-4 days', subtitle: 'SHORT TRIP. GOOD PRIORITIES.', title: 'A little coast, a big celebration.', description: 'For the fly-in, hug-everyone, dance-all-night crowd. Keep the route simple and let the wedding be the centerpiece.', stops: [telAviv, hadera] },
  { id: 'week', label: 'The sweet spot', duration: '7 days', subtitle: 'OUR VOTE: STAY A LITTLE LONGER.', title: 'Coast, history & a salty pause.', description: `Build your week around ${wedding.displayDate}: Tel Aviv and the coast, two days in Jerusalem, and one day at the Dead Sea. Fit in a nearby winery if practical, without rushing the wedding or your travel days.`, stops: [telAviv, hadera, jerusalem, deadSea] },
  { id: 'long', label: 'The full adventure', duration: '10 days', subtitle: 'FOR THE JUST-ONE-MORE-DAY PEOPLE.', title: 'Room to wander. Room to breathe.', description: 'Keep the two Jerusalem days, nearby winery ideas, and one Dead Sea day from the week-long route. Use the extra time to slow down or choose an optional extension: the north if conditions allow, or a flight to Eilat for the coral reef. Choose what fits rather than trying to do everything.', stops: [telAviv, hadera, jerusalem, deadSea, north, eilat] },
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
  { title: 'Getting to Hadera', description: `Wedding pickup is at 17:30 / 5:30 PM from Tel Aviv Arlozorov Train Station, with arrival at Al Hanahal at 19:00 / 7 PM. The return bus to Tel Aviv will leave the venue around ${wedding.returnBusDeparture}, after midnight following the wedding. Travelling independently? Hadera West has rail connections, but you will need onward transport to the venue.` },
  { title: 'The weekend rhythm', description: "Israel's typical work week runs Sunday through Thursday, with Friday and Saturday as the weekend days off. The wedding is on Thursday, so you can ease straight into the weekend." },
  { title: 'Transportation', description: "Israel has railways and buses for getting between cities and around town. For trains, buy tickets or load a Rav-Kav travel card at train stations; for buses, use a loaded Rav-Kav or a supported payment app. Moovit and Pango offer public transport payment: set up the app and validate each journey as instructed. Don't rely on tapping Apple Pay or another digital wallet to board: acceptance varies, so have a transport app or Rav-Kav ready. Most regular services across the country stop from Friday afternoon until Saturday evening, with some local exceptions. Tel Aviv has weekend buses on Friday and Saturday, but these use special routes and modified schedules, not the normal weekday network. Check your exact journey before travelling, especially on weekends and holidays. Destination-specific transport details will be added to the recommended itineraries." },
  { title: 'Car sharing & driving', description: "Need a car for just a few hours? Tel Aviv has car-sharing services similar to Zipcar: look into AutoTel for short city trips and GoTo for hourly or daily rentals. Check each service's registration process, foreign-licence eligibility, age limits, insurance, and parking or return rules before relying on it. Bring your original valid driving licence, and check whether your licence and chosen provider require an International Driving Permit (IDP). If needed, arrange the IDP in your home country before travelling; it accompanies your original licence and does not replace it.", links: [{ url: 'https://www.autotel.co.il/', label: 'AutoTel car sharing' }, { url: 'https://gotoglobal.com/en/goto-car-sharing/', label: 'GoTo hourly & daily rentals' }] },
  { title: 'September essentials', description: "September is usually warm, so pack sunscreen, water, light layers, and comfortable shoes, and plan outdoor exploring early or late. Israeli weddings tend to be festive but not overly formal: think a summer dress, a jumpsuit, or a nice shirt with trousers. A full suit and tie usually aren't necessary unless you enjoy dressing up. Choose something comfortable enough to dance in all night." },
  { title: 'Where to stay', description: 'Stay near Hadera on the wedding night if you want a simpler journey home. Tel Aviv works as a city base for other days, but requires travel time. No hotel blocks or venue-specific accommodation are confirmed yet.' },
];
