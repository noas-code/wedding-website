# A little love, a little Lisbon

A colorful, responsive wedding website with an itinerary, his-and-hers recommendations, a Leaflet/OpenStreetMap highlights map, FAQs, and a real RSVP form backed by SQLite.

## Start locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The API runs on port 3001. Both bind only to your local machine by default.

## Make it yours

Edit `src/content.js` for names, dates, itinerary, recommendations, map coordinates, and FAQs. The initial Lisbon wedding is **sample content**, not a booked wedding. Replace placeholders and set `wedding.sample` to `false` when ready. Update the title and description in `index.html`, and Lisbon-specific copy in `src/main.jsx`, `src/RSVP.jsx`, and `src/HighlightsMap.jsx` if changing destinations. Original illustrations live in `src/Illustrations.jsx`; colors and layout live in `src/styles.css`.

Fonts and illustrations are bundled locally. Map tiles require internet access; the recommendations list and interactive pins still work when tiles cannot load, with an explicit warning. No paid map API key is needed. Check OpenStreetMap's [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before using its public tile service on a busy production site.

## RSVPs

Responses are stored in `data/rsvps.sqlite` on the server, **not** in browser storage. Submitting the same email updates its existing response. Party size includes the respondent and is capped at 10; guests are asked to include only people named on their invitation. This is not yet enforced by an invitation database.

There is deliberately no public endpoint listing guest details. To inspect responses locally, from the project directory:

```sh
node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('data/rsvps.sqlite', { readOnly: true }); console.table(db.prepare('SELECT name, email, attendance, guests, dietary, message, updated_at FROM rsvps').all()); db.close();"
```

Keep the database private and back it up. Names, email addresses, and dietary notes can contain personal information; delete data when no longer needed. No emails are sent and no external RSVP service receives responses.

## Build and run

```sh
npm test
npm run build
npm start
```

The production server serves the built site and API at **http://127.0.0.1:3001**. `PORT`, `HOST`, and `DATABASE_PATH` can be supplied as environment variables. Keep the database outside the public `dist` folder.

## A domain later

### GitHub Pages prototype

The public prototype is deployed by `.github/workflows/pages.yml` whenever `main` changes. Enable GitHub Pages with **GitHub Actions** as its source in repository Settings > Pages.

The Pages build sets `VITE_RSVP_DEMO=true`: the form is explicitly a preview, sends no requests, and saves no responses (including in browser storage). Use made-up details. The regular local build keeps the working RSVP API.

To preview the same static build locally:

```sh
VITE_BASE_PATH=/wedding-website/ VITE_RSVP_DEMO=true npm run build
VITE_BASE_PATH=/wedding-website/ npx vite preview --host 127.0.0.1
```

Open `http://127.0.0.1:4173/wedding-website/`. To return to the local backend build, run `npm run build` without those environment variables.

### Real RSVP deployment

Use a Node-compatible host with a persistent disk for SQLite (or migrate to managed PostgreSQL). Build the site, set `HOST=0.0.0.0` where required by your host, and configure the domain and HTTPS through the hosting provider. Static-only hosting cannot run this RSVP API.

**Before public launch:** replace and verify sample details, add invitation codes or email verification (the local prototype currently allows updates by anyone who knows a guest's email), add request rate limiting and abuse protection, and provide a suitable guest privacy notice. Plan authenticated RSVP management, backups, and email confirmations if needed. This local prototype is not yet a public invitation-management system.
