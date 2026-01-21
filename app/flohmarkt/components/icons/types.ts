export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const iconSizeMap: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};
