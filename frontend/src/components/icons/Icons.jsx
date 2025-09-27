// src/components/icons/Icons.jsx
import React from 'react';

/**
 * Utility to merge classes without bringing in a lib.
 */
function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Base Icon wrapper to standardize size, title, and aria-label.
 * - size: number in px; defaults to 20
 * - className: additional Tailwind classes (color, hover, etc.)
 */
function IconBase({ children, size = 20, className, title, ariaLabel, ...rest }) {
  const ariaProps = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': 'true' };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cx('w-5 h-5 text-gray-800 dark:text-white', className)}
      {...ariaProps}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* =========================================================
   EXISTING CONTROL ICONS (kept as-is)
   ========================================================= */

/**
 * Edit (pencil) outline icon
 */
export function IconEdit({
  size = 20,
  className,
  title = 'Edit',
  ariaLabel,
  ...rest
}) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
      />
    </IconBase>
  );
}

/**
 * Trash/delete outline icon
 */
export function IconTrash({
  size = 20,
  className,
  title = 'Delete',
  ariaLabel,
  ...rest
}) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
      />
    </IconBase>
  );
}

/**
 * Close (X) outline icon
 */
export function IconClose({ size = 20, className, title = 'Close', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18 17.94 6M18 18 6.06 6"
      />
    </IconBase>
  );
}

export function IconSoundOn({ size = 20, className, title = 'Sound on', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      {/* Adapted to use currentColor for strokes */}
      <path d="M3 16V8H6L11 4V20L6 16H3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9C13 9 15 9.5 15 12C15 14.5 13 15 13 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7C15 7 18 7.83333 18 12C18 16.1667 15 17 15 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 5C17 5 21 6.16667 21 12C21 17.8333 17 19 17 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconSoundOff({ size = 20, className, title = 'Sound off', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path d="M3 16V8H6L11 4V20L6 16H3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 15L20.5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 9L20.5 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconStart({ size = 20, className, title = 'Start', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" />
    </IconBase>
  );
}

export function IconPause({ size = 20, className, title = 'Pause', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" />
    </IconBase>
  );
}

export function IconStop({ size = 20, className, title = 'Stop', ariaLabel, ...rest }) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path fill="currentColor" d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z" />
    </IconBase>
  );
}

/* =========================================================
   NEW: Feature icons for the landing page
   - Friendly strokes, color via currentColor
   - Subtle gradient accent using currentColor
   - Work in light and dark modes
   ========================================================= */

function FeatureBase({ children, size = 24, className, title, ariaLabel, ...rest }) {
  const ariaProps = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': 'true' };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cx('w-6 h-6 text-[rgb(var(--fg))]', className)}
      stroke="currentColor"
      {...ariaProps}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="lg-feature" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

export function IconTasksFeature({ size = 24, className, title = 'Tasks', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" strokeWidth="1.8" />
      <path d="M7 8.5l1.6 1.7 3.2-3.2" stroke="url(#lg-feature)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="15" x2="14.5" y2="15" strokeWidth="1.8" strokeLinecap="round" />
    </FeatureBase>
  );
}

export function IconPlannerFeature({ size = 24, className, title = 'Planner', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <rect x="3.5" y="5.5" width="17" height="14" rx="2.5" strokeWidth="1.8" />
      <line x1="8" y1="4" x2="8" y2="7" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="4" x2="16" y2="7" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6.5" y="9" width="4.5" height="3.2" rx="0.8" fill="currentColor" opacity="0.22" />
      <rect x="12" y="9" width="5.5" height="1.6" rx="0.8" fill="currentColor" opacity="0.22" />
      <rect x="12" y="11.5" width="3.8" height="3.2" rx="0.8" fill="currentColor" opacity="0.22" />
    </FeatureBase>
  );
}

export function IconFocusFeature({ size = 24, className, title = 'Focus', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <circle cx="12" cy="12" r="8.5" strokeWidth="1.8" />
      <path d="M12 3.5a8.5 8.5 0 1 1 -7.7 12.2" stroke="url(#lg-feature)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 12L12 7.2" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </FeatureBase>
  );
}

export function IconNotesFeature({ size = 24, className, title = 'Notes', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path d="M7.2 5h8a2.2 2.2 0 0 1 2.2 2.2v9.6a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V7.2A2.2 2.2 0 0 1 7.2 5Z" strokeWidth="1.8" />
      <path d="M8.6 5v14" strokeWidth="1.4" />
      <line x1="10.5" y1="8.2" x2="16.5" y2="8.2" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <line x1="10.5" y1="11.1" x2="16.5" y2="11.1" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      <line x1="10.5" y1="14" x2="15" y2="14" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
    </FeatureBase>
  );
}

export function IconHabitsFeature({ size = 24, className, title = 'Habits', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <path
        d="M12.2 4.6c.4 1.6-.5 2.8-1.5 3.6-1.6 1.3-2.6 2.8-2.6 4.6 0 2.9 2.3 5.3 5.1 5.3s5.1-2.4 5.1-5.3c0-2-1.1-3.7-2.8-5.1-.8-.7-1.4-1.7-1.2-3.1"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.6 13.8l1.6 1.6 3.1-3.1" stroke="url(#lg-feature)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </FeatureBase>
  );
}

export function IconGroupsFeature({ size = 24, className, title = 'Groups', ariaLabel, ...rest }) {
  return (
    <FeatureBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      <circle cx="9" cy="9" r="2.8" strokeWidth="1.8" />
      <path d="M4.8 16.7c.6-2.1 2.6-3.7 4.9-3.7s4.3 1.6 4.9 3.7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M14.4 7.5a3.6 3.6 0 1 1 6.1 2.7v2.8l-1.8-1a3.6 3.6 0 0 1-4.3-3.5Z" stroke="url(#lg-feature)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    </FeatureBase>
  );
}

/**
 * Settings (gear) outline icon
 * - Inherits color via currentColor for light/dark themes
 */
export function IconSettings({
  size = 20,
  className,
  title = 'Settings',
  ariaLabel,
  ...rest
}) {
  return (
    <IconBase size={size} className={className} title={title} ariaLabel={ariaLabel} {...rest}>
      {/* Adapted from the provided SVG and normalized to currentColor */}
      <path
        d="M20.3499 8.92293L19.9837 8.7192C19.9269 8.68756 19.8989 8.67169 19.8714 8.65524C19.5983 8.49165 19.3682 8.26564 19.2002 7.99523C19.1833 7.96802 19.1674 7.93949 19.1348 7.8831C19.1023 7.82677 19.0858 7.79823 19.0706 7.76998C18.92 7.48866 18.8385 7.17515 18.8336 6.85606C18.8331 6.82398 18.8332 6.79121 18.8343 6.72604L18.8415 6.30078C18.8529 5.62025 18.8587 5.27894 18.763 4.97262C18.6781 4.70053 18.536 4.44993 18.3462 4.23725C18.1317 3.99685 17.8347 3.82534 17.2402 3.48276L16.7464 3.1982C16.1536 2.85658 15.8571 2.68571 15.5423 2.62057C15.2639 2.56294 14.9765 2.56561 14.6991 2.62789C14.3859 2.69819 14.0931 2.87351 13.5079 3.22396L13.5045 3.22555L13.1507 3.43741C13.0948 3.47091 13.0665 3.48779 13.0384 3.50338C12.7601 3.6581 12.4495 3.74365 12.1312 3.75387C12.0992 3.7549 12.0665 3.7549 12.0013 3.7549C11.9365 3.7549 11.9024 3.7549 11.8704 3.75387C11.5515 3.74361 11.2402 3.65759 10.9615 3.50224C10.9334 3.48658 10.9056 3.46956 10.8496 3.4359L10.4935 3.22213C9.90422 2.86836 9.60915 2.69121 9.29427 2.62057C9.0157 2.55807 8.72737 2.55634 8.44791 2.61471C8.13236 2.68062 7.83577 2.85276 7.24258 3.19703L7.23994 3.1982L6.75228 3.48124L6.74688 3.48454C6.15904 3.82572 5.86441 3.99672 5.6517 4.23614C5.46294 4.4486 5.32185 4.69881 5.2374 4.97018C5.14194 5.27691 5.14703 5.61896 5.15853 6.3027L5.16568 6.72736C5.16676 6.79166 5.16864 6.82362 5.16817 6.85525C5.16343 7.17499 5.08086 7.48914 4.92974 7.77096C4.9148 7.79883 4.8987 7.8267 4.86654 7.88237C4.83436 7.93809 4.81877 7.96579 4.80209 7.99268C4.63336 8.26452 4.40214 8.49186 4.12733 8.65572C4.10015 8.67193 4.0715 8.68752 4.01521 8.71871L3.65365 8.91908C3.05208 9.25245 2.75137 9.41928 2.53256 9.65669C2.33898 9.86672 2.19275 10.1158 2.10349 10.3872C2.00259 10.6939 2.00267 11.0378 2.00424 11.7255L2.00551 12.2877C2.00706 12.9708 2.00919 13.3122 2.11032 13.6168C2.19979 13.8863 2.34495 14.134 2.53744 14.3427C2.75502 14.5787 3.05274 14.7445 3.64974 15.0766L4.00808 15.276C4.06907 15.3099 4.09976 15.3266 4.12917 15.3444C4.40148 15.5083 4.63089 15.735 4.79818 16.0053C4.81625 16.0345 4.8336 16.0648 4.8683 16.1255C4.90256 16.1853 4.92009 16.2152 4.93594 16.2452C5.08261 16.5229 5.16114 16.8315 5.16649 17.1455C5.16707 17.1794 5.16658 17.2137 5.16541 17.2827L5.15853 17.6902C5.14695 18.3763 5.1419 18.7197 5.23792 19.0273C5.32287 19.2994 5.46484 19.55 5.65463 19.7627C5.86915 20.0031 6.16655 20.1745 6.76107 20.5171L7.25478 20.8015C7.84763 21.1432 8.14395 21.3138 8.45869 21.379C8.73714 21.4366 9.02464 21.4344 9.30209 21.3721C9.61567 21.3017 9.90948 21.1258 10.4964 20.7743L10.8502 20.5625C10.9062 20.5289 10.9346 20.5121 10.9626 20.4965C11.2409 20.3418 11.5512 20.2558 11.8695 20.2456C11.9015 20.2446 11.9342 20.2446 11.9994 20.2446C12.0648 20.2446 12.0974 20.2446 12.1295 20.2456C12.4484 20.2559 12.7607 20.3422 13.0394 20.4975C13.0639 20.5112 13.0885 20.526 13.1316 20.5519L13.5078 20.7777C14.0971 21.1315 14.3916 21.3081 14.7065 21.3788C14.985 21.4413 15.2736 21.4438 15.5531 21.3855C15.8685 21.3196 16.1657 21.1471 16.7586 20.803L17.2536 20.5157C17.8418 20.1743 18.1367 20.0031 18.3495 19.7636C18.5383 19.5512 18.6796 19.3011 18.764 19.0297C18.8588 18.7252 18.8531 18.3858 18.8417 17.7119L18.8343 17.2724C18.8332 17.2081 18.8331 17.1761 18.8336 17.1445C18.8383 16.8247 18.9195 16.5104 19.0706 16.2286C19.0856 16.2007 19.1018 16.1726 19.1338 16.1171C19.166 16.0615 19.1827 16.0337 19.1994 16.0068C19.3681 15.7349 19.5995 15.5074 19.8744 15.3435C19.9012 15.3275 19.9289 15.3122 19.9838 15.2818L19.9857 15.2809L20.3472 15.0805C20.9488 14.7472 21.2501 14.5801 21.4689 14.3427C21.6625 14.1327 21.8085 13.8839 21.8978 13.6126C21.9981 13.3077 21.9973 12.9658 21.9958 12.2861L21.9945 11.7119C21.9929 11.0287 21.9921 10.6874 21.891 10.3828C21.8015 10.1133 21.6555 9.86561 21.463 9.65685C21.2457 9.42111 20.9475 9.25526 20.3517 8.92378L20.3499 8.92293Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00033 12C8.00033 14.2091 9.79119 16 12.0003 16C14.2095 16 16.0003 14.2091 16.0003 12C16.0003 9.79082 14.2095 7.99996 12.0003 7.99996C9.79119 7.99996 8.00033 9.79082 8.00033 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function IconChevronLeft({
  size = 24,
  stroke = 1.8,
  className = "",
  ariaLabel = "Chevron left",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={ariaLabel}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
// Menu / Hamburger (24px, stroke 1.8)
// Usage: <IconMenu ariaLabel="Expand sidebar" />
export function IconMenu({
  size = 24,
  stroke = 1.8,
  className = "",
  ariaLabel = "Menu",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={ariaLabel}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

// src/components/icons/Icons.jsx (add this export)

export function IconChevronDown({ size = 18, className = "", ariaLabel = "Chevron Down" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={ariaLabel}
      role="img"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}