import { useEffect } from 'react';
import { Heart, Send } from 'lucide-react';

export default function AttendanceReaction({ attendance, onComplete }) {
  const undecided = attendance === 'undecided';

  useEffect(() => {
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div className={`attendance-reaction ${undecided ? 'reaction-patience' : 'reaction-love-note'}`} role="status">
    <div className="reaction-art" aria-hidden="true">
      {undecided ? <><span className="reaction-ring" /><span className="reaction-ring reaction-ring-delayed" /><Heart className="reaction-heart" size={25} strokeWidth={1.5} /></> :
        <><span className="reaction-trail" /><Send className="reaction-plane" size={30} strokeWidth={1.5} /><Heart className="reaction-postmark" size={13} strokeWidth={1.5} /></>}
    </div>
    <div><p className="reaction-title">{undecided ? 'Good things take a little time.' : 'Sending love, not a guilt trip.'}</p><p className="reaction-message">{undecided ? 'No rush. Figure out your plans, then keep us posted.' : "We'll miss your moves. Consider this a little hug by airmail."}</p></div>
  </div>;
}
