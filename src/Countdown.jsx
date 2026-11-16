import { useEffect, useState } from 'react';
import { weddingCountdown } from './weddingCountdown.js';

export default function Countdown() {
  const [remaining, setRemaining] = useState(() => weddingCountdown());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(weddingCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (remaining.started) return <span className="header-countdown">Time to celebrate!</span>;

  return <span className="header-countdown" aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds until the Huppah`}>
    <span className="countdown-label">Until we say yes</span>
    <span className="countdown-digits">{remaining.days}d {String(remaining.hours).padStart(2, '0')}h {String(remaining.minutes).padStart(2, '0')}m {String(remaining.seconds).padStart(2, '0')}s</span>
  </span>;
}
