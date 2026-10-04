export function IconTracker({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9m6 10V5m6 14v-8m6 8H2" />
    </svg>
  );
}

export function IconGroups({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.2a7.5 7.5 0 0115 0" />
    </svg>
  );
}

export function IconDebts({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M7 15h4" />
    </svg>
  );
}

export function IconChart({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V9m5 7V5m5 11v-6" />
    </svg>
  );
}

export function IconCalendar({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

export function IconList({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
  );
}

export function IconTag({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12.5V5h7.5L20 13.5 13.5 20 4 12.5z" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BrandMark({ size = 32 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#1D9E75" />
        <path d="M9 21.5V10.5h8.2c2.6 0 4.3 1.5 4.3 3.7 0 1.5-.9 2.7-2.3 3.2 1.6.4 2.7 1.7 2.7 3.4 0 2.3-1.8 4-4.6 4H9zm3.1-1.9h5.4c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8h-5.4v3.6zm0-5.5h4.9c1.3 0 2.1-.7 2.1-1.7s-.8-1.7-2.1-1.7h-4.9v3.4z" fill="white" />
      </svg>
    </span>
  );
}
