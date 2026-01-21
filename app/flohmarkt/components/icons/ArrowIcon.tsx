import { IconProps } from './types';

interface ArrowIconProps extends IconProps {
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ArrowIcon({
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  direction = 'right',
  'aria-label': ariaLabel = 'Arrow'
}: ArrowIconProps) {
  const rotations = {
    right: '0',
    down: '90',
    left: '180',
    up: '270'
  };

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
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
