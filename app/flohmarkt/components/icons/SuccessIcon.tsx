import { IconProps } from './types';

export function SuccessIcon({
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  'aria-label': ariaLabel = 'Success'
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
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
