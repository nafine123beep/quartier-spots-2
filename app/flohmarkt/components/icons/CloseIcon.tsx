import { IconProps } from './types';

export function CloseIcon({
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  'aria-label': ariaLabel = 'Close'
}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
