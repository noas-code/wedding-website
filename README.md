# Noa & Tom

An RSVP-first wedding website for **Sep 2nd, 2027 at Al Hanahal (By the River), Hadera, Israel**. The landing page uses the couple's own photograph, locally bundled fonts, and a Mediterranean after-party palette: pale sky blue, electric cobalt, butter-yellow selections with navy text, and subtle coral-pink accents. All guest-facing dates use the same written format to avoid international date ambiguity.

Guests provide their name, country calling code and phone number, email, attendance, and preferred channels for wedding updates: WhatsApp, email, both, or neither. Israel (+972) is the default; a country selector and custom-code option support international guests. Optional fields cover invited guests and dietary needs.

The invitation's RSVP card offers **RSVP / Edit RSVP** options, with edit-link recovery inside the same card. Switching options preserves an unfinished reply. Communication preferences use visible checkboxes so guests can clearly select multiple channels.

On mobile, **Your RSVP** scrolls smoothly to the form, with an instant jump when reduced motion is preferred.

Attendance choices are **Wouldn't miss it**, **Can't make it**, and **I don't know yet**; none is selected by default. Accepting triggers confetti unless reduced motion is enabled. Undecided replies are saved separately from acceptances and declines, unlock the guest pages, and can be edited later. They do not count as confirmed guests; party and dietary details are collected when accepting.

After replying, guests can visit separate views for **Edit RSVP**, **Wedding Day Itinerary**, and **Your Perfect Israel Trip**. The itinerary includes the venue links and six scheduled events, starting with pickup from Tel Aviv Arlozorov Train Station at 17:30 / 5:30 PM. Times appear in both 24-hour and AM/PM formats, local to Israel, with dancing and late-night food at midnight. The return bus to Tel Aviv leaves around 01:00 / 1 AM after the wedding. A few emojis add playful accents to the descriptions. The Huppah info icon explains the canopy on hover, focus, or tap. The travel guide offers 3-4, 7, and 10-day routes and practical planning advice. September essentials explains festive, not overly formal wedding attire.

## Start locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The API runs on port 3001. Both bind only to your local machine by default.

While running `npm run dev`, use **Skip RSVP for now** below the landing-page form to browse the guest hub, itinerary, and travel guide without submitting a response. This local preview persists across refreshes in the same tab using a session-only flag, not guest details or an RSVP edit key. Use **Back to landing page** to exit. The RSVP page remains available if you want to submit a real reply. The shortcut is not included in production builds.

## Content and visuals

- `src/content.js`: wedding details, evening schedule, trip routes, and travel notes.
- `coupleRecommendations` in `src/content.js`: side-by-side Noa and Tom picks for coffee, shawarma, wine, cocktails, hikes, beaches, breakfast, and sweets in the separate **His & Hers** tab (`#picks`). Picks are explicitly coming soon; replace the `noa` and `tom` null values with the couple's actual recommendations.
- `src/HuppahInfo.jsx`: accessible ceremony explanation tooltip.
- `src/Countdown.jsx` and `src/weddingCountdown.js`: live header countdown to the Huppah at 20:00 in Israel on Sep 2nd, 2027. It stays centered between the logo and date, above the navigation tabs on every page.
- `src/App.jsx`: RSVP landing page and post-RSVP navigation, including separate **His & Hers** (`#picks`) and **Intl? Must knows** (`#intl`) pages. **Explore Israel** focuses on trip routes and links to both. Mobile navigation uses a two-row grid with touch-sized tabs and a highlighted active page.
- `src/TripPrompt.jsx` and `src/tripPrompt.js`: **Explore Israel** offers a copyable AI planning prompt for the selected trip length, including wedding logistics and published His & Hers picks. Both longer routes include two Jerusalem days, one Dead Sea day, and nearby winery ideas. The 10-day prompt offers alternative Eilat, northern Israel, Jordan, or Greece extensions within the total duration, subject to current travel and entry checks. Guests can read the prompt first; failed clipboard access reveals a manual-copy option. No guest RSVP details are included or sent to an AI service.
- `src/PageNavigation.jsx`: previous/next arrows guide guests through the invitation, wedding day, Israel ideas, international essentials, and RSVP. Desktop arrows sit at the left and right edges and show their destination on hover or focus. Mobile arrows sit in a fixed bottom bar with visible destinations, touch-sized controls, and space reserved below the content. Navigation never submits a reply. Guest pages fade in gently unless reduced motion is enabled.
- `src/RSVP.jsx`: form and conditional update preferences.
- `src/Confetti.jsx`: a short palette-colored celebration on acceptance clicks, respecting reduced-motion preferences.
- `src/AttendanceReaction.jsx`: a gently pulsing heart for undecided guests and a flying love note for declines. Reactions restart on re-click, dismiss automatically, and become static supportive messages with reduced motion.
- `src/styles.css`: responsive invitation styling.
- `public/noa-and-tom.png`: the supplied background photograph.
- `public/noa-tom-wedding-day.png`: the couple's photo behind the Wedding Day title, with a responsive readability overlay.

The photo and fonts are served locally; no remote map, image, or font request is needed. Travel links open official external resources. Recheck entry requirements, travel advice, and transport schedules before booking for 2027.

## Private, persistent RSVPs

Responses are saved in `data/rsvps.sqlite`, not in browser storage. Phone numbers and update preferences are stored alongside attendance and guest details. Existing update preferences migrate to WhatsApp or email according to the previously selected channel; opt-outs remain opt-outs.

The server issues a random private edit-access key on submission. Only that key is stored in this browser, allowing guests to restore and edit their own RSVP after refreshing. The authorized edit endpoint permits changing email addresses without creating duplicate responses. Knowing someone's email alone does not grant access to their RSVP.

There is no public endpoint listing guest details. On a shared computer, use **Clear this browser's RSVP access** in the guest hub when finished. Treat the key as a secret. When email recovery is configured, a guest can enter their email or phone number on the landing page to request a single-use link sent to the email address on their RSVP. Links expire after 15 minutes. A shared phone number sends a separate link to each matching RSVP's email address; it does not expose those addresses to the requester. Legacy responses can also regain access this way.

To enable recovery on a Node host, configure `PUBLIC_URL` as the site's full HTTPS URL, `RESEND_API_KEY` as a Resend API key, and `RESEND_FROM` as a sender on a verified Resend domain. The server sends recovery links through Resend; it reports recovery as unavailable when these settings are missing. For local development only, `PUBLIC_URL` may use HTTP on `localhost` or `127.0.0.1`. Never commit the API key. Configure a persistent database and an HTTPS deployment before inviting guests. Recovery has basic per-contact and per-connection-IP throttling; configure additional rate limiting at the hosting edge, especially behind a proxy or across multiple server instances.

No wedding updates are sent automatically. Update selections record guests' preferences for the hosts to use later; they are not a messaging integration. Recovery links are emailed when recovery is configured and requested.

To inspect responses locally:

```sh
node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('data/rsvps.sqlite', { readOnly: true }); console.table(db.prepare('SELECT name, email, phone, whatsapp_updates, email_updates, attendance, guests, dietary, message, updated_at FROM rsvps').all()); db.close();"
```

Keep the database private, back it up, and delete guest data when no longer needed. Never place it inside the public build folder. Party size includes the respondent and is capped at 10; invitation-specific limits are not yet enforced.

## Validate and build

```sh
npm test
npm run build
npm start
```

The production server serves the built site and API at **http://127.0.0.1:3001**. `PORT`, `HOST`, and `DATABASE_PATH` can be set as environment variables.

## Hosting later

The GitHub Pages workflow builds a **preview only** with `VITE_RSVP_DEMO=true`. Use made-up details. It demonstrates the form and guest pages, but sends no requests or recovery emails, saves no responses or edit keys, and does not confirm attendance. Refreshing clears the preview reply.

For a real RSVP deployment, use a Node-compatible host with persistent storage for SQLite. Static-only hosting cannot run this API.

Before public launch, configure HTTPS, guest privacy information, invitation verification, request rate limits, secure host administration, backups, and a verified edit-access recovery process. Reconfirm all travel information.
