import { useCallback, useState } from 'react';
import { countryCodes, internationalPhone, splitPhone } from './phone';
import Confetti from './Confetti';
import AttendanceReaction from './AttendanceReaction';
import RecoverRSVP from './RecoverRSVP';

const demoMode = import.meta.env.VITE_RSVP_DEMO === 'true';
const emptyResponse = { name: '', email: '', phone: '', attendance: '', guests: [], dietary: '', message: '', whatsappUpdates: false, emailUpdates: false };

export default function RSVP({ initial, token, onSaved }) {
  const [mode, setMode] = useState('new');
  const [response, setResponse] = useState(() => initial ? { ...initial, guests: initial.guests.slice(1) } : emptyResponse);
  const [guestCount, setGuestCount] = useState(initial?.guests.length || 1);
  const [phone, setPhone] = useState(() => splitPhone(initial?.phone));
  const [countryChoice, setCountryChoice] = useState(() => {
    const code = splitPhone(initial?.phone).countryCode;
    return countryCodes.some(([value]) => value === code) ? code : 'custom';
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [reaction, setReaction] = useState(null);
  const clearReaction = useCallback(() => setReaction(null), []);
  const update = (field, value) => setResponse(previous => ({ ...previous, [field]: value }));

  function reactToAttendance(attendance) {
    if (attendance === 'yes' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReaction(null);
    } else {
      setReaction(previous => ({ attendance, id: (previous?.id || 0) + 1 }));
    }
  }

  async function submit(event) {
    event.preventDefault();
    const body = {
      ...response,
      name: response.name.trim(),
      email: response.email.trim().toLowerCase(),
      phone: internationalPhone(phone.countryCode, phone.number),
      guests: response.attendance === 'yes' ? [response.name.trim(), ...response.guests.slice(0, guestCount - 1).map(name => name.trim())] : [],
      dietary: response.attendance === 'yes' ? response.dietary.trim() : '',
    };
    if (!/^\+?[0-9 ()\-.]+$/.test(body.phone) || !/^\d{7,15}$/.test(body.phone.replace(/\D/g, ''))) {
      setStatus({ state: 'error', message: 'Please enter a phone number with 7 to 15 digits in total, including the country code.' });
      return;
    }
    if (demoMode) {
      onSaved(body, '');
      return;
    }
    setStatus({ state: 'saving', message: '' });
    try {
      const result = await fetch(initial ? '/api/rsvps/me' : '/api/rsvps', {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!result.headers.get('content-type')?.includes('application/json')) throw new Error('The RSVP server returned an unexpected response. Your changes have not been confirmed.');
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'We could not save your RSVP. Please try again.');
      onSaved(body, data.token);
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof TypeError ? 'We could not reach the server. Please try again. Your changes have not been confirmed.' : error.message });
    }
  }

  return <div className="rsvp-card" id="rsvp">
    {!initial && <div className="rsvp-options" role="group" aria-label="RSVP options">
      {[['new', 'RSVP'], ['edit', 'Edit RSVP']].map(([value, label]) => <button type="button" key={value} aria-pressed={mode === value} disabled={status.state === 'saving'} onClick={() => { setMode(value); clearReaction(); }}>{label}</button>)}
    </div>}
    <div hidden={mode !== 'new'}>
    {reaction && (reaction.attendance === 'yes' ? <Confetti key={reaction.id} onComplete={clearReaction} /> : <AttendanceReaction key={reaction.id} attendance={reaction.attendance} onComplete={clearReaction} />)}
    <div className="form-heading"><p className="eyebrow">{initial ? 'YOUR RSVP / THE LATEST VERSION' : 'YOUR INVITATION STARTS HERE'}</p><h2>{initial ? 'Keep us posted.' : 'Save you a seat?'}</h2><p>{initial ? 'Update your reply below. We will save the new details.' : 'We would love to have you with us. Let us know.'}</p></div>
    {demoMode && <p className="demo-notice" role="note">Preview only. Use made-up details: nothing is sent or saved.</p>}
    <form onSubmit={submit}>
      <fieldset className="form-fields" disabled={status.state === 'saving'}>
        <fieldset className="choice-field"><legend>Will you be joining us? <span>*</span></legend><div className="choice-row attendance-choices">
          {[['yes', "Wouldn't miss it"], ['undecided', "I don't know yet"], ['no', "Can't make it"]].map(([value, label]) => <label className={response.attendance === value ? 'choice selected' : 'choice'} key={value}><input type="radio" name="attendance" required value={value} checked={response.attendance === value} onChange={() => update('attendance', value)} onClick={() => reactToAttendance(value)} /><span>{label}</span></label>)}
        </div></fieldset>
        {response.attendance === 'undecided' && <p className="attendance-note">No pressure. Save your reply for now, then update it when your plans are clearer.</p>}
        <label>Your full name <span>*</span><input name="name" required maxLength={120} autoComplete="name" placeholder="First and last name" value={response.name} onChange={event => update('name', event.target.value)} /></label>
        <div className="phone-fields">
          <label>Country code <span>*</span><select name="countryCode" autoComplete="tel-country-code" value={countryChoice} onChange={event => { const choice = event.target.value; setCountryChoice(choice); setPhone(previous => ({ ...previous, countryCode: choice === 'custom' ? '' : choice })); }}>{countryCodes.map(([code, country]) => <option key={code} value={code}>{code} {country}</option>)}<option value="custom">Custom code</option></select></label>
          <label>Phone number <span>*</span><input type="tel" name="phone" required maxLength={32} pattern={String.raw`(?:[ \(\)\.\-]*[0-9]){4,14}[ \(\)\.\-]*`} title="Enter your number without the country code, using digits, spaces, brackets, or dashes." autoComplete="tel-national" placeholder="50 123 4567" value={phone.number} onChange={event => setPhone(previous => ({ ...previous, number: event.target.value }))} /></label>
        </div>
        {countryChoice === 'custom' && <label>Your country calling code <span>*</span><input type="tel" name="customCountryCode" required maxLength={4} pattern={String.raw`\+[1-9][0-9]{0,2}`} title="Enter + followed by your 1 to 3 digit country calling code." autoComplete="tel-country-code" placeholder="e.g. +386" value={phone.countryCode} onChange={event => setPhone(previous => ({ ...previous, countryCode: event.target.value }))} /></label>}
        <label>Email address <span>*</span><input type="email" name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" value={response.email} onChange={event => update('email', event.target.value)} /></label>
        <fieldset className="choice-field"><legend>How do you want us to communicate with you?</legend><p className="communication-hint">Select all that apply. Leave both unchecked for no updates.</p><div className="choice-row">
          {[['whatsappUpdates', 'WhatsApp'], ['emailUpdates', 'Email']].map(([field, label]) => <label className={response[field] ? 'communication-choice selected' : 'communication-choice'} key={field}><input type="checkbox" name={field} checked={response[field]} onChange={event => update(field, event.target.checked)} />{label}</label>)}
        </div></fieldset>
        {response.attendance === 'yes' && <details className="extra-details" open={initial ? true : undefined}>
          <summary>Guests, dietary needs & a note for us <span aria-hidden="true">+</span></summary>
          <div className="extra-fields"><label>People in your party<select name="partySize" value={guestCount} onChange={event => setGuestCount(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => <option key={index} value={index + 1}>{index + 1}{index === 0 ? ' (just me)' : ' (including me)'}</option>)}</select><small>Please include only guests named on your invitation.</small></label>
            {Array.from({ length: guestCount - 1 }, (_, index) => <label key={index}>Guest {index + 2} full name <span>*</span><input required maxLength={120} value={response.guests[index] || ''} onChange={event => { const guests = [...response.guests]; guests[index] = event.target.value; update('guests', guests); }} /></label>)}
            <label>Dietary needs or allergies<input name="dietary" maxLength={1000} placeholder="Anything we should tell the chef?" value={response.dietary} onChange={event => update('dietary', event.target.value)} /></label>
            <label>A little note for Noa & Tom<textarea name="message" maxLength={2000} rows={2} placeholder="A song request, a little love..." value={response.message} onChange={event => update('message', event.target.value)} /></label>
          </div>
        </details>}
        {status.state === 'error' && <p className="form-error" role="alert">{status.message}</p>}
        <button className="submit-button" type="submit">{demoMode ? 'Preview your invitation' : status.state === 'saving' ? 'Saving your reply...' : initial ? 'Save my changes' : 'Send my RSVP'}<span aria-hidden="true">&rarr;</span></button>
        <p className="privacy-note">{demoMode ? 'This preview does not confirm your attendance.' : 'Your details are stored privately on this server. Only an edit-access key is saved in this browser. You can update your reply after submitting.'}</p>
      </fieldset>
    </form>
    </div>
    {!initial && <div hidden={mode !== 'edit'}><RecoverRSVP /></div>}
  </div>;
}
