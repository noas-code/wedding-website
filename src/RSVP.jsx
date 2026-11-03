import { useState } from 'react';
import { ArrowRight, Check, Heart, Minus, Plus, Send } from 'lucide-react';
import { wedding } from './content';

const demoMode = import.meta.env.VITE_RSVP_DEMO === 'true';

export default function RSVP() {
  const [attendance, setAttendance] = useState('yes');
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [response, setResponse] = useState({ name: '', email: '', guests: [], dietary: '', message: '' });
  const update = (field, value) => setResponse(previous => ({ ...previous, [field]: value }));
  async function submit(event) {
    event.preventDefault();
    if (demoMode) {
      setStatus({ state: 'preview', message: 'This is only a preview. Nothing was sent or saved, and your attendance is not confirmed.' });
      return;
    }
    setStatus({ state: 'saving', message: '' });
    const body = {
      ...response, attendance,
      guests: attendance === 'yes' ? [response.name, ...response.guests.slice(0, guestCount - 1)] : [],
      dietary: attendance === 'yes' ? response.dietary : '',
    };
    try {
      const result = await fetch('/api/rsvps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!result.headers.get('content-type')?.includes('application/json')) {
        throw new Error('The RSVP server returned an unexpected response. Your RSVP hasn’t been confirmed; please try again.');
      }
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'We couldn’t save your RSVP. Please try again.');
      setStatus({ state: 'success', message: data.message });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof TypeError ? 'We couldn’t reach the server. Check your connection and try again — your RSVP hasn’t been confirmed.' : error.message });
    }
  }
  return <section id="rsvp" className="rsvp-section">
    <div className="rsvp-copy"><span className="doodle-heart" aria-hidden="true">♡</span><p className="eyebrow">OUR FAVORITE PEOPLE. ONE HAPPY PLACE.</p><h2>Save us<br />a <em>dance?</em></h2><p>It wouldn’t be the same without you.<br />Let us know if you can make it!</p><div className="deadline"><span>PLEASE RSVP BY</span><strong>{wedding.deadline}</strong></div><p className="privacy-note">{demoMode ? 'Prototype only: try the RSVP with made-up details. Nothing is sent or saved. This is not a real wedding invitation.' : 'Your RSVP is saved privately on this local server, not shared on the website. Use the same email to update your response.'}</p></div>
    <div className="rsvp-form-card">
      {status.state === 'preview' ? <div className="rsvp-success" role="status"><p className="eyebrow">RSVP DEMO · NOT SUBMITTED</p><h3>A little sneak peek.</h3><p>{status.message}</p><button className="button dark" onClick={() => setStatus({ state: 'idle', message: '' })}>Back to the demo <ArrowRight size={16} /></button></div> :
      status.state === 'success' ? <div className="rsvp-success" role="status"><span className="success-icon"><Check size={32} /></span><p className="eyebrow">SIGNED, SEALED, SAVED</p><h3>{attendance === 'yes' ? `See you in Lisbon, ${response.name.trim().split(' ')[0]}!` : 'Sending you love!'}</h3><p>{status.message}</p><button className="button dark" onClick={() => setStatus({ state: 'idle', message: '' })}>Edit my response <ArrowRight size={16} /></button></div> :
      <form onSubmit={submit}><fieldset className="form-fields" disabled={status.state === 'saving'}><h3>A little reply, a lot of love.</h3><p className="form-subtitle">Fields marked * are required.</p><div className="form-row"><label>Your full name *<input name="name" required maxLength={120} autoComplete="name" placeholder="First & last name" value={response.name} onChange={event => update('name', event.target.value)} /></label><label>Email address *<input type="email" name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" value={response.email} onChange={event => update('email', event.target.value)} /></label></div>
        <fieldset className="attendance"><legend>Will you be joining us? *</legend><label className={attendance === 'yes' ? 'chosen' : ''}><input type="radio" name="attendance" value="yes" checked={attendance === 'yes'} onChange={() => setAttendance('yes')} /><Heart size={16} /> Happily accepts</label><label className={attendance === 'no' ? 'chosen' : ''}><input type="radio" name="attendance" value="no" checked={attendance === 'no'} onChange={() => setAttendance('no')} />Regretfully declines</label></fieldset>
        {attendance === 'yes' && <><div className="guest-count"><div><strong>Guests in your party</strong><small>Including you · invited guests only</small></div><div className="stepper"><button type="button" aria-label="Remove a guest" disabled={guestCount === 1} onClick={() => setGuestCount(guestCount - 1)}><Minus size={15} /></button><output aria-live="polite" aria-label="Guest count">{guestCount}</output><button type="button" aria-label="Add a guest" disabled={guestCount === 10} onClick={() => setGuestCount(guestCount + 1)}><Plus size={15} /></button></div></div>
          {Array.from({ length: guestCount - 1 }, (_, index) => <label key={index}>Guest {index + 2} full name *<input name={`guest-${index}`} required maxLength={120} placeholder="First & last name" value={response.guests[index] || ''} onChange={event => { const guests = [...response.guests]; guests[index] = event.target.value; update('guests', guests); }} /></label>)}
          <label>Dietary needs or allergies<input name="dietary" maxLength={1000} placeholder="Anything we should tell the chef?" value={response.dietary} onChange={event => update('dietary', event.target.value)} /></label></>}
        <label>A note for the two of us<textarea name="message" maxLength={2000} rows={2} placeholder="A song request, a little love, anything!" value={response.message} onChange={event => update('message', event.target.value)} /></label>
        {status.state === 'error' && <p className="form-error" role="alert">{status.message}</p>}
        <button className="button coral submit" type="submit">{demoMode ? 'Preview RSVP · nothing sent' : status.state === 'saving' ? 'Saving your RSVP…' : 'Send with love'}<Send size={16} /></button>
      </fieldset></form>}
    </div>
  </section>;
}
