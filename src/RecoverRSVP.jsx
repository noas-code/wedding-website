import { useState } from 'react';

const demoMode = import.meta.env.VITE_RSVP_DEMO === 'true';

export default function RecoverRSVP() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function submit(event) {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });
    try {
      const result = await fetch('/api/rsvps/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      if (!result.headers.get('content-type')?.includes('application/json')) throw new Error('The server returned an unexpected response. Please try again.');
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'We could not request a link. Please try again.');
      setStatus({ state: 'sent', message: data.message });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof TypeError ? 'We could not reach the server. Please try again.' : error.message });
    }
  }

  return <div className="recovery-entry">
    <div className="recovery-heading">
      <div><h2>Already replied?</h2><p>No need to RSVP again. Update your existing reply here.</p></div>
      <button type="button" aria-expanded={open} aria-controls="recovery-form" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Edit your RSVP'} <span aria-hidden="true">{open ? '\u00d7' : '\u2192'}</span></button>
    </div>
    <div id="recovery-form" className="recovery-box" hidden={!open}>
      {demoMode ? <p>This preview does not save RSVPs or send recovery emails. Submit a preview reply to try the edit screen.</p> :
        <form onSubmit={submit}>
          <p>Enter the email or phone number used for your RSVP. We will send an edit link to the email address on your RSVP.</p>
          <label>Email or phone number <input required maxLength={254} name="identifier" autoComplete="email" placeholder="Email or phone with country code" value={identifier} onChange={event => setIdentifier(event.target.value)} /></label>
          <button className="submit-button" disabled={status.state === 'saving'} type="submit">{status.state === 'saving' ? 'Sending...' : 'Email me an edit link'} <span aria-hidden="true">&rarr;</span></button>
          {status.message && <p className={status.state === 'error' ? 'form-error' : 'recovery-message'} role={status.state === 'error' ? 'alert' : 'status'}>{status.message}</p>}
        </form>}
    </div>
  </div>;
}
