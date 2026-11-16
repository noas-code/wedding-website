import { useEffect, useRef, useState } from 'react';
import { Globe, Instagram } from 'lucide-react';
import { wedding, events, trips, travelNotes, coupleRecommendations } from './content';
import RSVP from './RSVP';
import RecoverRSVP from './RecoverRSVP';
import HuppahInfo from './HuppahInfo';
import Countdown from './Countdown.jsx';
import PageNavigation from './PageNavigation';

const demoMode = import.meta.env.VITE_RSVP_DEMO === 'true';
const pages = ['home', 'edit', 'itinerary', 'israel', 'picks', 'intl'];
const tokenKey = 'noa-tom-rsvp-token';
const previewKey = 'noa-tom-local-preview';

export default function App() {
  const [page, setPage] = useState(() => location.hash.slice(1) || 'home');
  const [rsvp, setRsvp] = useState(null);
  const [preview, setPreview] = useState(() => import.meta.env.DEV && sessionStorage.getItem(previewKey) === '1');
  const [token, setToken] = useState('');
  const recoveryToken = useRef(new URLSearchParams(location.hash.slice(1)).get('recover'));
  const [restoring, setRestoring] = useState(!demoMode && Boolean(recoveryToken.current || localStorage.getItem(tokenKey)));
  const [error, setError] = useState('');
  const [trip, setTrip] = useState('week');
  const heading = useRef(null);

  useEffect(() => {
    const navigate = () => {
      const next = location.hash.slice(1) || 'home';
      if (pages.includes(next)) setPage(next);
    };
    addEventListener('hashchange', navigate);
    return () => removeEventListener('hashchange', navigate);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    const savedToken = localStorage.getItem(tokenKey);
    const recoveryLink = recoveryToken.current;
    if (!savedToken && !recoveryLink) return;
    if (recoveryLink) history.replaceState(null, '', `${location.pathname}${location.search}`);
    const controller = new AbortController();
    async function restore() {
      try {
        let accessToken = savedToken;
        if (recoveryLink) {
          const exchange = await fetch('/api/rsvps/recovery/consume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: recoveryLink }), signal: controller.signal });
          const data = await exchange.json();
          if (!exchange.ok) throw new Error(data.error || 'We could not open this recovery link. Please request a new one.');
          accessToken = data.token;
          localStorage.setItem(tokenKey, accessToken);
        }
        const result = await fetch('/api/rsvps/me', { headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal });
        if (result.status === 401) {
          localStorage.removeItem(tokenKey);
          throw new Error('This RSVP edit link has expired. Please contact Noa & Tom if you already replied.');
        }
        if (!result.ok) throw new Error('We could not load your saved RSVP. Please refresh to try again.');
        const data = await result.json();
        setRsvp(data.rsvp);
        setToken(accessToken);
        if (recoveryLink) location.hash = 'edit';
      } catch (error) {
        if (error.name !== 'AbortError') setError(error.message);
      } finally {
        if (!controller.signal.aborted) setRestoring(false);
      }
    }
    restore();
    return () => controller.abort();
  }, []);

  const hasGuestAccess = Boolean(rsvp) || preview;
  const currentPage = !pages.includes(page) || (!hasGuestAccess && page !== 'home') ? 'home' : page;
  useEffect(() => {
    heading.current?.focus();
    scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage, hasGuestAccess, Boolean(rsvp)]);

  function startPreview() {
    sessionStorage.setItem(previewKey, '1');
    setPreview(true);
    location.hash = 'home';
  }

  function endPreview() {
    sessionStorage.removeItem(previewKey);
    setPreview(false);
    location.hash = 'home';
  }

  function saved(response, editToken) {
    if (!demoMode) localStorage.setItem(tokenKey, editToken);
    setToken(editToken);
    setRsvp(response);
    endPreview();
  }

  function forget() {
    localStorage.removeItem(tokenKey);
    setRsvp(null);
    setToken('');
    setError('');
    endPreview();
  }

  return <div className={hasGuestAccess ? 'site-shell guest-access' : 'site-shell'}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <a className="wordmark" href="#home" aria-label="Noa and Tom home">n<span>&</span>t<span className="wordmark-dot">.</span></a>
      <div className="header-countdown-center"><Countdown /></div>
      {hasGuestAccess ? <nav aria-label="Guest navigation">
        {[['home', 'Your invitation'], ['edit', rsvp ? 'Edit RSVP' : 'RSVP'], ['itinerary', 'Wedding day'], ['israel', 'Explore Israel'], ['picks', 'His & Hers'], ['intl', 'Intl? Must knows']].map(([id, label]) =>
          <a key={id} href={`#${id}`} aria-current={currentPage === id ? 'page' : undefined}>{label}</a>)}
      </nav> : null}
      <div className="header-celebration"><span className="header-date">{wedding.displayDate}</span></div>
    </header>
    <main id="main">
      {preview && !rsvp && <div className="preview-banner"><p>Local preview / no RSVP saved</p><button type="button" onClick={endPreview}>Back to landing page</button></div>}
      {error && <div className="restore-error" role="alert">{error} <button type="button" onClick={() => location.reload()}>Try again</button></div>}
      {restoring ? <div className="loading" role="status">Opening your invitation...</div> :
        currentPage === 'home' && !hasGuestAccess ? <section className="invitation-layout">
          <RecoverRSVP />
          <div className="invitation-copy" style={{ '--couple-photo': `url("${import.meta.env.BASE_URL}noa-and-tom.png")` }}>
            <p className="eyebrow"><span className="little-line" /> WE'RE GETTING MARRIED</p>
            <h1 ref={heading} tabIndex={-1}>Noa <span className="ampersand">&</span><br />Tom</h1>
            <p className="invitation-message">One evening. Our favorite people.<br />And a whole lot of love to go around.</p>
            <div className="wedding-details"><p>{wedding.displayDate}</p><p>{wedding.venue.name} ({wedding.venue.translation})</p><p>{wedding.destination}</p></div>
            <a className="photo-rsvp" href="#rsvp">Your RSVP <span aria-hidden="true">&darr;</span></a>
            <p className="photo-caption">THE NEXT CHAPTER STARTS WITH YOU.</p>
          </div>
          <div className="invitation-form"><RSVP onSaved={saved} /><p className="form-footnote">A little reply. The beginning of a very good trip.</p>{import.meta.env.DEV && <div className="preview-entry"><button className="text-link" type="button" onClick={startPreview}>Skip RSVP for now <span aria-hidden="true">&rarr;</span></button><p>Local preview only. No response will be saved.</p></div>}</div>
        </section> :
        currentPage === 'edit' ? <section className="edit-layout" key="edit">
          <div><p className="eyebrow">{rsvp ? 'PLANS CHANGE. WE GET IT.' : 'WHEN YOU ARE READY'}</p><h1 className="page-title" ref={heading} tabIndex={-1}>{rsvp ? <>A little<br /><em>update.</em></> : <>Save us<br /><em>a dance.</em></>}</h1><p className="intro">{rsvp ? <>New number? A dietary note?<br />Keep your details as fresh as your dance moves.</> : 'Just exploring? Take your time. Submit this form only when you want to save a real RSVP.'}</p><a className="text-link" href="#home">Back to your invitation <span aria-hidden="true">&larr;</span></a></div>
          <RSVP initial={rsvp} token={token} onSaved={saved} />
        </section> :
        currentPage === 'itinerary' ? <section className="inner-page wedding-day" key="itinerary">
          <div className="wedding-hero">
            <img className="wedding-hero-photo" src={`${import.meta.env.BASE_URL}noa-tom-wedding-day.png`} alt="Noa and Tom together overlooking a river and terraced hills" width={1152} height={768} />
            <div className="wedding-hero-copy"><p className="eyebrow date-label">Thursday / {wedding.displayDate}</p><h1 className="page-title" ref={heading} tabIndex={-1}>The day.<br /><em>The night. The&nbsp;yes.</em></h1><p className="intro">{wedding.venue.name}, {wedding.destination}.<br />Come for the vows. Stay for seconds and questionable dance moves.</p></div>
          </div>
          <section className="venue-card" aria-labelledby="venue-heading"><div><p className="eyebrow">MEET YOU BY THE RIVER</p><h2 id="venue-heading">{wedding.venue.name}</h2><p className="venue-translation">{wedding.venue.translation} / {wedding.destination}</p></div><div><p>A little glimpse of where we will say yes. Curious about the setting? Take a look around the venue before we meet there.</p><div className="venue-links"><a className="text-link" href={wedding.venue.website} target="_blank" rel="noreferrer"><Globe size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" /><span>Visit the venue website</span></a><a className="text-link" href={wedding.venue.instagram} target="_blank" rel="noreferrer"><Instagram size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" /><span>Explore their Instagram</span></a></div></div></section>
          <p className="schedule-timezone">All times are local to Israel.</p>
          <div className="timeline">{events.map(event => <article key={event.when}><p className="timeline-time"><span>{event.when.split(' / ')[0]}</span><span>{event.when.split(' / ')[1]}</span></p><div><div className="event-heading"><h2>{event.title}</h2>{event.info && <HuppahInfo explanation={event.info} />}</div><p>{event.description}</p></div></article>)}</div>
          <div className="closing-note"><h2>Ready to <em>celebrate.</em></h2><p>We'll share the practical details here when they're confirmed. Your update preferences are in <a href="#edit">Edit RSVP</a>.</p></div>
        </section> :
        currentPage === 'israel' ? <section className="inner-page israel-page" key="israel">
          <div className="page-heading israel-hero"><div><p className="eyebrow">ONE WEDDING. A WHOLE COUNTRY TO EXPLORE.</p><h1 className="page-title" ref={heading} tabIndex={-1}>A little Israel.<br /><em>A lot to fall for.</em></h1></div><p className="intro">Salty hair. Long lunches. Ancient streets.<br />Our recipe for a trip beyond the dance floor.</p></div>
          <div className="trip-selector" role="group" aria-label="Choose your trip length">{trips.map(option => <button key={option.id} aria-pressed={trip === option.id} onClick={() => setTrip(option.id)}>{option.label}<span>{option.duration}</span></button>)}</div>
          {trips.filter(option => option.id === trip).map(option => <div key={option.id} className="trip-content"><div className="trip-intro"><p className="eyebrow">{option.subtitle}</p><h2>{option.title}</h2><p>{option.description}</p></div><div className="trip-stops">{option.stops.map((stop, index) => <article key={stop.title}><span className="stop-number">0{index + 1}</span><div><p className="eyebrow">{stop.area}</p><h3>{stop.title}</h3><p>{stop.description}</p><p className="local-tip">{stop.tip}</p></div></article>)}</div></div>)}
          <a className="text-link picks-link" href="#picks">His & Hers: our personal picks <span aria-hidden="true">&#8599;</span></a>
          <a className="text-link trip-practical-link" href="#intl">Travelling from abroad? The must-knows <span aria-hidden="true">&#8599;</span></a>
        </section> :
        currentPage === 'picks' ? <section className="inner-page picks-page" key="picks" aria-labelledby="couple-recs-heading">
            <div className="page-heading"><div><p className="eyebrow">HIS, HERS & YOUR NEXT FAVORITE</p><h1 className="page-title" id="couple-recs-heading" ref={heading} tabIndex={-1}>Two locals.<br /><em>Very strong opinions.</em></h1></div><p className="intro">Our little black book of good things.<br />We're still comparing notes. Our personal picks are coming soon.</p></div>
            <div className="recs-grid">{coupleRecommendations.map(recommendation => <article className="rec-card" key={recommendation.category}>
              <div className="rec-category"><span className="rec-emoji" aria-hidden="true">{recommendation.emoji}</span><div><h3>{recommendation.category}</h3><p>{recommendation.tagline}</p></div></div>
              <div className="rec-picks">{[['noa', 'Noa'], ['tom', 'Tom']].map(([key, name]) => <div className={`rec-pick rec-pick-${key}`} key={key}><p className="rec-person">{name}'s pick</p><p className={recommendation[key] ? 'rec-place' : 'rec-pending'}>{recommendation[key] || 'Coming soon'}</p></div>)}</div>
            </article>)}</div>
        </section> :
        currentPage === 'intl' ? <section className="inner-page" key="intl">
          <div className="page-heading"><div><p className="eyebrow">THE GOOD-TO-KNOW PART</p><h1 className="page-title" ref={heading} tabIndex={-1}>Less logistics.<br /><em>More living.</em></h1></div><p className="intro">Coming from abroad? Start here.<br />The practical bits, so you can focus on the good bits.</p></div>
          <div className="travel-note-grid">{travelNotes.map(note => <article key={note.title}><h2>{note.title}</h2><p>{note.description}</p>{note.url && <a className="text-link" href={note.url} target="_blank" rel="noreferrer">{note.linkLabel} <span aria-hidden="true">&#8599;</span></a>}</article>)}</div>
        </section> :
        hasGuestAccess && <section className="inner-page guest-hub" key="home">
          <p className="eyebrow">{!rsvp || demoMode ? 'PREVIEW ONLY / NO RSVP SAVED' : 'YOUR REPLY IS SAVED / THANK YOU FOR LETTING US KNOW'}</p>
          <h1 className="page-title" ref={heading} tabIndex={-1}>{!rsvp ? <>The party<br /><em>starts here.</em></> : rsvp.attendance === 'yes' ? <>See you there,<br /><em>{rsvp.name.split(' ')[0]}.</em></> : rsvp.attendance === 'undecided' ? <>Take your time,<br /><em>{rsvp.name.split(' ')[0]}.</em></> : <>We'll miss you,<br /><em>{rsvp.name.split(' ')[0]}.</em></>}</h1>
          <p className="hub-message">{!rsvp ? 'Explore the wedding day and plan a little adventure. Your RSVP can wait until you are ready.' : rsvp.attendance === 'yes' ? 'You bring yourself. We bring a night to remember.' : rsvp.attendance === 'undecided' ? 'Your RSVP is saved as undecided. Explore the plans, and update your reply when you know.' : 'Thank you for letting us know. There is still a little adventure here for you.'}</p>
          <div className="hub-date"><span>{wedding.displayDate}</span><span>{wedding.venue.name} / {wedding.destination}</span></div>
          <div className="hub-cards">{[
            ['edit', '01', 'The little details', rsvp ? 'Edit RSVP' : 'RSVP when ready', rsvp ? 'Change your plans, guest details, or how we keep in touch.' : 'No response saved yet. Send your reply whenever you are ready.'],
            ['itinerary', '02', 'From hello to last dance', 'Wedding day itinerary', 'A first look at the evening, with final details to follow.'],
            ['israel', '03', 'Stay a little longer', 'Your perfect Israel trip', 'A few days or a whole week. Make the journey part of the story.'],
            ['picks', '04', 'His, hers & your next favorite', 'His & Hers', 'Our personal picks for coffee, food, beaches, and a little adventure.'],
            ['intl', '05', 'The good-to-know part', 'Intl? Must knows', 'Entry requirements, getting here, and the practical bits for guests coming from abroad.'],
          ].map(([id, number, label, title, description]) => <a className="hub-card" href={`#${id}`} key={id}><div><span>{number}</span><span aria-hidden="true">&#8599;</span></div><p className="eyebrow">{label}</p><h2>{title}</h2><p>{description}</p></a>)}</div>
          {rsvp && <><p className="saved-preferences">{rsvp.whatsappUpdates || rsvp.emailUpdates ? `You opted into wedding updates via ${[rsvp.whatsappUpdates && 'WhatsApp', rsvp.emailUpdates && 'email'].filter(Boolean).join(' and ')}. We'll share details when they're ready.` : 'You opted out of wedding updates. You can always check the details here.'} No messages are sent automatically by this website.</p>
          <button className="text-link forget-button" onClick={forget}>Not you? Clear this browser's RSVP access</button></>}
        </section>}
      {hasGuestAccess && !restoring && <PageNavigation currentPage={currentPage} hasRsvp={Boolean(rsvp)} />}
    </main>
    <footer><span>Noa & Tom</span><p>{wedding.destination} <span className="footer-separator">/</span> {wedding.displayDate}</p><span>WITH YOU, IT'S BETTER.</span></footer>
  </div>;
}
