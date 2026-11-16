import { useEffect } from 'react';

const colors = ['var(--accent)', 'var(--coral)', 'var(--yellow)'];
const pieces = Array.from({ length: 32 }, (_, index) => ({
  left: `${(index * 37 + 13) % 100}%`,
  drift: `${(index % 2 === 0 ? 1 : -1) * (24 + (index * 17) % 110)}px`,
  spin: `${(index % 2 === 0 ? 1 : -1) * (360 + (index * 43) % 720)}deg`,
  delay: `${(index % 8) * 35}ms`,
  duration: `${1400 + (index % 5) * 90}ms`,
  color: colors[index % colors.length],
}));

export default function Confetti({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div className="confetti-layer" aria-hidden="true">
    {pieces.map((piece, index) => <span key={index} className="confetti-piece" style={{
      left: piece.left,
      backgroundColor: piece.color,
      '--drift': piece.drift,
      '--spin': piece.spin,
      '--delay': piece.delay,
      '--duration': piece.duration,
    }} />)}
  </div>;
}
