type IconProps = {
  name: string;
  size?: number;
  className?: string;
};

const paths: Record<string, React.ReactNode> = {
  overview: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /><path d="M12 4v2M20 12h-2M12 20v-2M4 12h2" /></>,
  projects: <><path d="M4 7.5h6l2 2h8v9H4z" /><path d="M4 7.5v-2h6l2 2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-2.5A4.5 4.5 0 018 12h2a4.5 4.5 0 014.5 4.5V19" /><circle cx="17" cy="9" r="2" /><path d="M16 13h1a3.5 3.5 0 013.5 3.5V18" /></>,
  agents: <><rect x="5" y="6" width="14" height="12" rx="3" /><path d="M12 3v3M8.5 11h.01M15.5 11h.01M9 15h6" /></>,
  memory: <><path d="M7 5.5A3.5 3.5 0 0113.5 4 3.5 3.5 0 0118 7.5a3.5 3.5 0 01-.5 6.95V18a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.55A3.5 3.5 0 017 7.5z" /><path d="M9 9h6M9 13h6M11 17h2" /></>,
  simulation: <><path d="M5 19V8l7-4 7 4v11l-7 3z" /><path d="M5 8l7 4 7-4M12 12v10" /></>,
  activity: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
  chevron: <path d="M9 18l6-6-6-6" />,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  spark: <><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
  send: <path d="M4 4l17 8-17 8 3-8zM7 12h14" />,
  mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M9 21h6" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  shield: <><path d="M12 3l7 3v5c0 4.5-2.7 8.1-7 10-4.3-1.9-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  eye: <><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

export function Icon({ name, size = 20, className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    >
      {paths[name] || paths.overview}
    </svg>
  );
}
