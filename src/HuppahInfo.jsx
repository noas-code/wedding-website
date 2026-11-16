import { useId, useState } from 'react';
import { Info } from 'lucide-react';

export default function HuppahInfo({ explanation }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return <span className="huppah-info"
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={event => {
      if (!event.currentTarget.contains(document.activeElement)) setOpen(false);
    }}
    onKeyDown={event => {
      if (event.key === 'Escape') setOpen(false);
    }}>
    <button type="button" className="huppah-info-button" aria-label="What is a Huppah?"
      aria-describedby={open ? id : undefined}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)}>
      <Info size={17} strokeWidth={1.5} aria-hidden="true" focusable="false" />
    </button>
    {open && <span id={id} role="tooltip" className="huppah-tooltip">{explanation}</span>}
  </span>;
}
