export function LogoMark({ size }: { size?: number }) {
  return (
    <span className="logo-mark" style={size ? { width: size, height: size } : undefined} aria-hidden>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5c.5 4.3 2.1 6.9 6.3 9-4.2 2.1-5.8 4.7-6.3 9-.5-4.3-2.1-6.9-6.3-9 4.2-2.1 5.8-4.7 6.3-9Z" />
        <circle cx="19" cy="4.8" r="1.7" />
      </svg>
    </span>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span>
        STUDY <b>AI</b>
      </span>
    </span>
  );
}
