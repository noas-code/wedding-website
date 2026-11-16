import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildTripPrompt } from './tripPrompt.js';

export default function TripPrompt({ tripId }) {
  const prompt = buildTripPrompt(tripId);
  const [status, setStatus] = useState('idle');

  async function copy() {
    setStatus('copying');
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return <section className="trip-prompt" aria-label="Plan your trip with AI">
    <div className="trip-prompt-heading">
      <div><p className="eyebrow">YOUR TRIP / A HEAD START</p><h2>Planning your trip with your favorite AI assistant?</h2><p>Take our route and recommendations with you. Paste the prompt into your assistant to make it your own.</p></div>
      <button type="button" onClick={copy} disabled={status === 'copying'}>{status === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} {status === 'copying' ? 'Copying...' : 'Copy the prompt with our recs'}</button>
    </div>
    {status === 'copied' && <p className="trip-prompt-status" role="status">Copied! Paste it into your favorite AI assistant.</p>}
    {status === 'error' && <p className="form-error" role="alert">We could not copy automatically. Select the prompt below and copy it manually.</p>}
    <details open={status === 'error' ? true : undefined}>
      <summary>Read the prompt</summary>
      <label className="sr-only" htmlFor="trip-planning-prompt">Trip planning prompt</label>
      <textarea id="trip-planning-prompt" readOnly value={prompt} rows={12} onFocus={event => event.target.select()} />
    </details>
  </section>;
}
