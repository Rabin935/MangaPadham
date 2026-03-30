type IconProps = {
  className?: string;
};

export function CoinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 9.5c.7-1 1.9-1.5 3.5-1.5 1.8 0 3 .8 3 2 0 1.4-1.3 1.9-3 2.2-1.7.3-3 .8-3 2.3 0 1.2 1.2 2 3.1 2 1.6 0 2.8-.5 3.5-1.6" />
      <path d="M12 6.8v10.4" />
    </svg>
  );
}

export function LockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" />
      <path d="M12 15v2.5" />
    </svg>
  );
}
