import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUpRight, ChevronDown, Coffee, Heart, MapPin, Menu, Sparkles, Sun, Wine, X } from 'lucide-react';
import { wedding, events, places, faqs } from './content';
import { LisbonArt, PlaceArt } from './Illustrations';
import HighlightsMap from './HighlightsMap';
import RSVP from './RSVP';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/playfair-display/600-italic.css';
import './styles.css';

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header">
    <a className="wordmark" href="#home" aria-label={`${wedding.names.join(' and ')} home`}>{wedding.names[0][0]}<span>&</span>{wedding.names[1][0]}<Heart size={12} fill="currentColor" /></a>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button>
    <nav id="navigation" className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
      {[['Our weekend', '#weekend'], ['Our favorites', '#favorites'], ['The map', '#map'], ['Good to know', '#faq']].map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      <a className="button small coral" href="#rsvp" onClick={() => setOpen(false)}>RSVP <ArrowUpRight size={15} /></a>
    </nav>
  </header>;
}

function Favorites({ selectedPlace, onSelect }) {
  const [filter, setFilter] = useState('all');
  return <section id="favorites" className="section favorites">
    <div className="section-heading">
      <div><p className="eyebrow"><Sparkles size={15} /> GOOD PLACES, GREAT COMPANY</p><h2>Our city. <em>Your adventure.</em></h2><p className="section-intro">A few of our favorite things, for your between-the-party plans.</p></div>
      <div className="filters" role="group" aria-label="Filter recommendations">
        {[['all', 'All favorites'], ['his', 'His picks'], ['hers', 'Her picks']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}{value === 'all' && <Heart size={12} />}</button>)}
      </div>
    </div>
    <div className="place-grid">
      {places.filter(place => filter === 'all' || place.owner === filter).map(place => <article key={place.id} className={`place-card ${place.color}`}>
        <div className="place-image"><PlaceArt type={place.art} /><span className="pick-badge">{place.owner === 'his' ? 'HIS PICK' : 'HER PICK'} <Heart size={10} fill="currentColor" /></span></div>
        <div className="place-body"><p className="eyebrow">{place.category}</p><h3>{place.name}</h3><p>{place.description}</p><div className="place-bottom"><span><MapPin size={13} /> {place.neighborhood}</span><button aria-label={`Show ${place.name} on the map`} aria-pressed={selectedPlace === place.id} onClick={() => { onSelect(place.id); document.getElementById('map').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}><ArrowUpRight size={19} /></button></div></div>
      </article>)}
    </div>
  </section>;
}

function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main">
      <section id="home" className="hero">
        <div className="hero-copy"><p className="eyebrow"><Sun size={17} /> A LITTLE LOVE, A LITTLE LISBON</p><h1>{wedding.names[0]} <span>&</span><br />{wedding.names[1]}<span className="hero-dot">.</span></h1><p className="hero-message">We’re getting married.<br />You’re coming on an adventure.</p><div className="hero-details"><span>{wedding.displayDate}</span><span className="detail-dot">✦</span><span>{wedding.destination}</span></div><a className="button coral" href="#rsvp">Count me in <ArrowUpRight size={18} /></a><a className="weekend-link" href="#weekend">THE WEEKEND AWAITS <ArrowDown size={14} /></a></div>
        <div className="hero-visual"><div className="postcard-top"><span>A POSTCARD FROM OUR NEXT CHAPTER</span><Sparkles size={19} /></div><LisbonArt /><div className="postcard-bottom"><span>with love, from Lisbon</span><div className="postage-stamp"><Heart size={19} /><span>EST. 2027</span></div></div><span className="visual-note">pack your bags<br />& your dancing shoes!</span></div>
      </section>
      <div className="ticker" aria-label="Love, sunshine, and a very good time">{Array.from({ length: 3 }, (_, index) => <span key={index} aria-hidden={index > 0}>LOVE & A LITTLE ADVENTURE <span>✦</span> LISBON, HERE WE COME <span>✦</span> YOU + US + A VERY GOOD TIME <span>✦</span></span>)}</div>
      <section className="story-strip" aria-label="Our story"><span className="story-doodle" aria-hidden="true">♡</span><p>{wedding.story}</p><span className="story-signature">{wedding.names[0]} & {wedding.names[1]}</span></section>
      <section id="weekend" className="section weekend"><div className="section-heading"><div><p className="eyebrow">THREE DAYS. SO MANY MEMORIES.</p><h2>A weekend <em>to remember.</em></h2></div><p className="heading-note">A little celebrating,<br />a lot of being together.</p></div><div className="event-grid">{events.map(event => {
        const Icon = event.icon === 'wine' ? Wine : event.icon === 'heart' ? Heart : Coffee;
        return <article className="event-card" key={event.day}><div className="event-top"><div className="date-block"><span>{event.day}</span><strong>{event.date}</strong><span>{event.month}</span></div><span className={`event-icon ${event.icon}`}><Icon size={25} strokeWidth={1.5} /></span></div><h3>{event.title}</h3><p className="event-time">{event.time}</p><p className="event-location"><MapPin size={14} />{event.location}</p><p>{event.description}</p><div className="dress-code">{event.dress}</div></article>;
      })}</div></section>
      <Favorites selectedPlace={selectedPlace} onSelect={setSelectedPlace} />
      <HighlightsMap selectedPlace={selectedPlace} onSelect={setSelectedPlace} />
      <div className="travel-note"><Sun size={30} strokeWidth={1.3} /><p>A wedding is a day.<br /><strong>An adventure is a memory forever.</strong></p><span>Let’s make a few together.</span></div>
      <RSVP />
      <section id="faq" className="section faq-section"><div><p className="eyebrow">THE LITTLE DETAILS</p><h2>Good <em>to know.</em></h2><p>Less wondering.<br />More looking forward to it.</p></div><div className="faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<ChevronDown size={19} /></summary><p>{faq.answer}</p></details>)}</div></section>
    </main>
    <footer><a className="wordmark" href="#home">{wedding.names[0][0]}<span>&</span>{wedding.names[1][0]}</a><p>Made with love. Best enjoyed together.</p><span>{wedding.displayDate} <Heart size={12} fill="currentColor" /></span></footer>
    {wedding.sample && <div className="sample-note">SAMPLE WEDDING · Names, dates & plans are placeholders. Edit <code>src/content.js</code> to make it yours.</div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
