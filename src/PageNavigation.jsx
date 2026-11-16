import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PageNavigation({ currentPage, hasRsvp }) {
  const journey = [
    { id: 'home', label: 'Your invitation' },
    { id: 'itinerary', label: 'Wedding day' },
    { id: 'israel', label: 'Explore Israel' },
    { id: 'picks', label: 'His & Hers' },
    { id: 'intl', label: 'Intl? Must knows' },
    { id: 'edit', label: hasRsvp ? 'Edit RSVP' : 'RSVP when ready' },
  ];
  const index = journey.findIndex(page => page.id === currentPage);
  const previous = journey[index - 1];
  const next = journey[(index + 1) % journey.length];

  return <div className="page-navigation">
    {currentPage === 'edit' && <p className="page-navigation-note">Moving on does not save your reply. Use the form's submit button to save your RSVP first.</p>}
    <nav className="page-navigation-links" aria-label="Continue exploring">
      {previous && <a className="page-step page-step-previous" href={`#${previous.id}`} aria-label={`Back to ${previous.label}`}><ArrowLeft size={20} aria-hidden="true" /><span className="page-step-label" aria-hidden="true">Back to {previous.label}</span></a>}
      <a className="page-step page-step-next" href={`#${next.id}`} aria-label={`${next.id === 'home' ? 'Back to' : 'Next:'} ${next.label}`}><ArrowRight size={20} aria-hidden="true" /><span className="page-step-label" aria-hidden="true">{next.id === 'home' ? 'Back to' : 'Next:'} {next.label}</span></a>
    </nav>
  </div>;
}
