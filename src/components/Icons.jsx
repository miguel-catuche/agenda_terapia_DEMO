export default function Icon({ name, size = 24, className = "" }) {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };

  const icons = {
    clock: (
      <svg {...commonProps} className={`lucide lucide-clock-icon ${className}`}>
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    calendar: (
      <svg {...commonProps} className={`lucide lucide-calendar-icon ${className}`}>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    people: (
      <svg {...commonProps} className={`lucide lucide-users-icon ${className}`}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <path d="M16 3.128a4 4 0 0 1 0 7.744" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    person: (
      <svg {...commonProps} className={`lucide lucide-user-icon ${className}`}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    edit: (
      <svg {...commonProps} className={`lucide lucide-file-pen-line-icon ${className}`}>
        <path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
        <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        <path d="M8 18h1" />
      </svg>
    ),
    delete: (
      <svg {...commonProps} className={`lucide lucide-trash-icon ${className}`}>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    search: (
      <svg {...commonProps} className={`lucide lucide-search-icon ${className}`}>
        <path d="m21 21-4.34-4.34" />
        <circle cx="11" cy="11" r="8" />
      </svg>
    ),
    plus: (
      <svg {...commonProps} className={`lucide lucide-plus-icon ${className}`}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    ),
    close: (
      <svg {...commonProps} className={`lucide lucide-x-icon ${className}`}>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    ),
    menu: (
      <svg {...commonProps} className={`lucide lucide-menu-icon ${className}`}>
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
      </svg>
    ),
    personplus: (
      <svg {...commonProps} className={`lucide lucide-user-plus-icon ${className}`}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    personservices: (
      <svg {...commonProps} className={`lucide lucide-user-star-icon ${className}`}>
        <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
        <path d="M8 15H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
      </svg>
    ),

  };

  return icons[name] || null;
}
