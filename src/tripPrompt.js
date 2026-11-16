import { coupleRecommendations, events, trips, wedding } from './content.js';

const routes = {
  short: 'My trip length is 3-4 days; ask which duration fits my flights. Keep the wedding as the centerpiece and limit the route to Tel Aviv-Jaffa and Hadera/the coast. In Tel Aviv, consider the promenade, old Jaffa, Carmel Market, coffee, and relaxed lunches. Near Hadera, consider Caesarea or a coastal stop if time allows. Favor a simple route over extra cities.',
  week: 'My trip length is 7 days. Use Tel Aviv-Jaffa, Hadera/the coast, Jerusalem, and the Dead Sea as the route. Arrange the order around the wedding rather than assuming it falls halfway through my dates. Consider the promenade, old Jaffa, Carmel Market, and relaxed coastal time; Caesarea if practical; two days in Jerusalem exploring history and Jewish, Christian, and Muslim traditions, the Old City, and Mahane Yehuda; and one day at the Dead Sea. Include respectful clothing guidance, check religious-site access, and consider a local guide. Suggest a nearby Judean Hills winery visit if it fits without cutting the two Jerusalem days; arrange a driver or tour for tastings. Keep the whole trip within 7 days, including arrival, departure, and the wedding, and explain any tradeoffs rather than overpacking the route.',
  long: `My trip length is 10 days. Start with Tel Aviv-Jaffa, Hadera/the coast, Jerusalem, and the Dead Sea: consider the promenade, old Jaffa, Carmel Market, relaxed coastal time, and Caesarea if practical. Include two days in Jerusalem exploring history and Jewish, Christian, and Muslim traditions, the Old City, and Mahane Yehuda, plus one day at the Dead Sea. Include respectful clothing guidance, check religious-site access, and consider a local guide. Suggest a nearby Judean Hills winery visit with a driver or tour for tastings if it fits. Allow downtime and arrange the route around the wedding.

Ask whether I would prefer all 10 days in Israel or a shorter Israel stay combined with Jordan or Greece. Keep the whole trip within 10 days, including travel days, and do not compromise the wedding-day schedule.

For an Israel-only trip, consider Haifa, Acre, or a countryside stay only if current travel advice and access allow. Alternatively, consider flying to Ramon Airport near Eilat for coral-reef diving with a licensed operator or snorkeling. Verify flight routes, transfers, reef access, and operator requirements, and leave the required no-fly interval after diving as advised by the dive operator. Treat Eilat, the north, Jordan, and Greece as alternative extensions, not stops to combine into one rushed itinerary.

For Jordan, explore a practical short extension such as Petra and/or Wadi Rum. For Greece, suggest one suitable city or island base rather than several stops. Compare these options with staying in Israel, including travel time, approximate costs, and how much sightseeing time remains. Verify current flight availability, border access where relevant, visa and re-entry requirements for my nationality, and official travel advice. Do not assume direct flights, an open land crossing, or visa-free entry. If an extension is unsuitable or too rushed, say so and recommend the Israel-only itinerary.`,
};

export function buildTripPrompt(tripId, recommendations = coupleRecommendations) {
  if (!trips.some(trip => trip.id === tripId)) throw new Error('Unknown trip length.');
  const picks = recommendations.flatMap(recommendation =>
    [['noa', 'Noa'], ['tom', 'Tom']].filter(([key]) => recommendation[key]).map(([key, name]) => `${recommendation.category}: ${name} recommends ${recommendation[key]}.`)
  );
  const recommendationText = picks.length
    ? `Their published personal His & Hers recommendations:\n${picks.join('\n')}\nOther personal picks are not yet published.`
    : 'Their personal His & Hers recommendations for coffee, shawarma, wine, cocktails, hikes, beaches, breakfast, and sweets are coming soon.';

  return `Help me plan an Israel trip around ${wedding.names.join(' & ')}'s wedding on ${wedding.displayDate} at ${wedding.venue.name} (${wedding.venue.translation}), ${wedding.destination}.

Wedding-day constraints: pickup from Tel Aviv Arlozorov Train Station at ${events[0].when}, reception at the venue at ${events[1].when}, ceremony at ${events[2].when}, and celebrations through midnight. All times are local to Israel. Leave generous time to get ready and reach pickup. The return bus to Tel Aviv will leave the venue around ${wedding.returnBusDeparture}, after midnight following the wedding. Do not assume a specific Tel Aviv drop-off point. No hotel blocks are confirmed.

Use the hosts' route below as inspiration, not fixed bookings. ${recommendationText} Do not invent recommendations or attribute your own suggestions to them.

Before planning, ask me for my arrival/departure dates, budget, interests, travel companions, dietary or accessibility needs, and transport preferences. For entry guidance, ask my nationality, but do not request passport numbers or other sensitive identifiers.

Then propose a realistic day-by-day itinerary with suggested overnight bases, approximate travel times, downtime, and alternatives. Keep September heat in mind. Israel's typical work week is Sunday through Thursday, with Friday and Saturday as the weekend days off. Account for public transport limitations from Friday afternoon through Saturday evening and on holidays. Verify current travel advice, site access, entry requirements, and schedules using official sources; distinguish confirmed information from estimates, especially for 2027. Do not book anything.

${routes[tripId]}`;
}
