export function LisbonArt() {
  return <svg viewBox="0 0 560 460" className="lisbon-art" role="img" aria-label="An illustrated Lisbon scene with colorful buildings, a yellow tram, and sunshine">
    <defs>
      <pattern id="tiles" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#427ba5" /><path d="M9 2 16 9 9 16 2 9Z" fill="none" stroke="#b9d7e2" /></pattern>
      <pattern id="windows" width="37" height="43" patternUnits="userSpaceOnUse"><rect x="10" y="9" width="15" height="25" rx="7" fill="#293f42" /><path d="M17.5 9V34M10 21H25" stroke="#f7d48c" strokeWidth="2" /></pattern>
    </defs>
    <circle cx="294" cy="206" r="195" fill="#f8baaa" /><circle cx="405" cy="89" r="41" fill="#f7d45b" />
    <g stroke="#f7d45b" strokeWidth="3" strokeLinecap="round"><path d="M405 30V17M405 148V161M346 89H333M464 89H477M363 47 353 37M447 131 457 141M447 47 457 37M363 131 353 141" /></g>
    <path d="M40 366Q280 318 536 366V413H40Z" fill="#88a88a" />
    <path d="M93 177 157 127 215 177Z" fill="#db694e" /><rect x="103" y="176" width="102" height="194" fill="#edb346" /><rect x="108" y="181" width="92" height="180" fill="url(#windows)" />
    <path d="M210 111 275 73 339 111Z" fill="#d9583e" /><rect x="220" y="111" width="109" height="261" fill="#fbe8c3" /><rect x="232" y="130" width="85" height="197" fill="url(#windows)" /><rect x="252" y="330" width="42" height="42" rx="20" fill="#293f42" />
    <rect x="337" y="168" width="107" height="204" fill="url(#tiles)" /><path d="M330 168 391 130 452 168Z" fill="#bf5b43" />
    <g fill="#f9e6bd" stroke="#243e43" strokeWidth="3"><rect x="350" y="188" width="28" height="41" rx="13" /><rect x="401" y="188" width="28" height="41" rx="13" /><rect x="350" y="252" width="28" height="41" rx="13" /><rect x="401" y="252" width="28" height="41" rx="13" /></g>
    <path d="M365 188V229M416 188V229M365 252V293M416 252V293" stroke="#243e43" strokeWidth="3" />
    <path d="M27 398Q278 360 543 398" stroke="#f8e8ce" strokeWidth="21" fill="none" /><path d="M29 406Q278 367 546 405M38 420Q279 382 537 418" stroke="#375154" strokeWidth="2" fill="none" />
    <g transform="translate(135 276) rotate(-4 124 64)">
      <path d="M19 9H227Q243 9 243 26V114H4V26Q4 9 19 9" fill="#f7d45b" stroke="#28464a" strokeWidth="4" /><path d="M4 80H243V114H4Z" fill="#df9f2c" />
      <rect x="17" y="22" width="151" height="46" rx="4" fill="#d1e4de" stroke="#28464a" strokeWidth="3" /><path d="M55 23V68M94 23V68M131 23V68" stroke="#28464a" strokeWidth="4" />
      <rect x="185" y="22" width="41" height="78" rx="4" fill="#d1e4de" stroke="#28464a" strokeWidth="3" /><path d="M206 22V100" stroke="#28464a" strokeWidth="3" /><path d="M15 77H170" stroke="#fff1cd" strokeWidth="4" />
      <rect x="82" y="-6" width="85" height="18" rx="5" fill="#28464a" /><text x="124" y="7" textAnchor="middle" fill="#fff1cd" fontSize="10" fontFamily="sans-serif">28 · LISBOA</text>
      <circle cx="48" cy="115" r="13" fill="#28464a" /><circle cx="198" cy="115" r="13" fill="#28464a" /><path d="M112 -7 148 -43 185 -7" stroke="#28464a" strokeWidth="3" fill="none" />
    </g>
    <path d="M38 251V385M38 249Q6 232 14 208Q35 205 38 231Q44 196 63 197Q81 223 38 251" fill="#456d53" stroke="#456d53" strokeWidth="6" /><path d="M486 278V387M486 280Q462 260 461 241Q487 233 486 264Q501 231 519 247Q527 273 486 280" fill="#456d53" stroke="#456d53" strokeWidth="6" />
    <g fill="#fff7e5"><path d="m76 95 5 12 13 4-13 5-5 12-5-12-13-5 13-4Z" /><path d="m477 198 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" /></g>
  </svg>;
}

export function PlaceArt({ type }) {
  return <svg viewBox="0 0 320 180" aria-hidden="true" className="place-art">
    {type === 'streets' && <><path d="M0 180 136 78 202 180" fill="#e1a57d" /><path d="M33 0H126V155H33Z" fill="#f8df9a" /><path d="M208 0H288V170H208Z" fill="#d86a51" /><path d="M130 54H202V132H130Z" fill="#7a9ba5" /><g fill="#334f4c"><path d="M52 20H74V56H52ZM90 20H112V56H90ZM52 82H74V118H52ZM90 82H112V118H90ZM226 15H247V52H226ZM261 15H282V52H261ZM226 81H247V119H226ZM261 81H282V119H261ZM145 68H163V102H145ZM176 68H194V102H176Z" /></g><path d="m121 175 46-35 47 35" fill="none" stroke="#f7e9d2" strokeWidth="5" /></>}
    {type === 'food' && <><ellipse cx="159" cy="144" rx="96" ry="16" fill="#dcb64b" /><ellipse cx="151" cy="95" rx="76" ry="49" fill="#fff3d8" /><ellipse cx="151" cy="95" rx="58" ry="35" fill="#ef8956" /><path d="m117 90 31-16 34 24-29 19Z" fill="#f9da72" /><g fill="#668259"><circle cx="126" cy="110" r="8" /><circle cx="165" cy="77" r="8" /><circle cx="174" cy="113" r="6" /></g><path d="M249 42V142M234 42V69Q249 90 264 69V42M249 42V72M55 42V142M43 42V77H55" fill="none" stroke="#3b5650" strokeWidth="5" strokeLinecap="round" /></>}
    {type === 'sunset' && <><circle cx="210" cy="59" r="35" fill="#f7c852" /><path d="M0 123 55 91 93 128 144 75 206 133 257 105 320 139V180H0Z" fill="#c38d94" /><path d="M0 142 48 113 84 141 109 99 166 145 226 123 320 151V180H0Z" fill="#8c7f9c" /><path d="M0 163Q160 122 320 161V180H0Z" fill="#6a8e98" /><path d="M35 134H285M47 134V174M99 134V174M151 134V174M203 134V174M255 134V174" stroke="#f8e5cf" strokeWidth="7" /><path d="M90 41q9-9 18 0q9-9 18 0M142 26q7-7 14 0q7-7 14 0" stroke="#665e79" strokeWidth="2" fill="none" /></>}
    {type === 'pastry' && <><ellipse cx="159" cy="137" rx="95" ry="20" fill="#6ca798" /><ellipse cx="158" cy="126" rx="88" ry="29" fill="#f5eee0" /><path d="m111 91 8 43q39 28 79-1l10-42" fill="#d78c43" /><ellipse cx="160" cy="91" rx="49" ry="30" fill="#e8b655" /><ellipse cx="160" cy="87" rx="38" ry="21" fill="#f8d67c" /><g fill="#b76432"><ellipse cx="141" cy="81" rx="9" ry="5" /><ellipse cx="174" cy="88" rx="11" ry="6" /><ellipse cx="152" cy="97" rx="7" ry="4" /></g><path d="M234 69q31-2 25 21q-6 11-24 5" fill="none" stroke="#f8eee1" strokeWidth="7" /><path d="M199 60h39v45q-20 23-39 0Z" fill="#f8eee1" /><ellipse cx="218" cy="61" rx="19" ry="5" fill="#6d483b" /><path d="M212 43q-9-10 0-20M225 43q-9-10 0-20" fill="none" stroke="#f8eee1" strokeWidth="3" strokeLinecap="round" /></>}
  </svg>;
}
