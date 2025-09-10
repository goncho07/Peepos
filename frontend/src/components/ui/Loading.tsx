import React from 'react';
import { classNames } from '../../utils/helpers.ts';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
}

// Componente de spinner básico
const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white'
  };
  
  return (
    <svg
      className={classNames(
        'animate-spin',
        sizes[size],
        colors[color]
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

interface DotsProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
}

// Componente de puntos animados
const Dots: React.FC<DotsProps> = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4'
  };
  
  const colors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    white: 'bg-white'
  };
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={classNames(
            'rounded-full animate-pulse',
            sizes[size],
            colors[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress?: number;
  color?: SpinnerColor;
  showPercentage?: boolean;
}

// Componente de barra de progreso
const ProgressBar: React.FC<ProgressBarProps> = ({ progress = 0, color = 'primary', showPercentage = false }) => {
  const colors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={classNames(
            'h-2 rounded-full transition-all duration-300 ease-out',
            colors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

// Componente de skeleton loader
const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1, avatar = false }) => {
  return (
    <div className={classNames('animate-pulse', className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={classNames(
              'h-4 bg-gray-300 rounded',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          ></div>
        ))}
      </div>
    </div>
  );
};

interface LoadingProps {
  type?: 'spinner' | 'dots' | 'progress' | 'skeleton';
  size?: SpinnerSize;
  color?: SpinnerColor;
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  className?: string;
  progress?: number;
  showPercentage?: boolean;
  lines?: number;
  avatar?: boolean;
}

// Componente principal de Loading
const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text = '',
  overlay = false,
  fullScreen = false,
  className = '',
  progress,
  showPercentage = false,
  lines = 3,
  avatar = false
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <Dots size={size} color={color} />;
      case 'progress':
        return (
          <ProgressBar
            progress={progress}
            color={color}
            showPercentage={showPercentage}
          />
        );
      case 'skeleton':
        return <Skeleton lines={lines} avatar={avatar} className={className} />;
      case 'spinner':
      default:
        return <Spinner size={size} color={color} />;
    }
  };
  
  const content = (
    <div className={classNames(
      'flex flex-col items-center justify-center',
      type === 'skeleton' ? '' : 'space-y-3',
      className
    )}>
      {renderLoader()}
      {text && type !== 'skeleton' && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {content}
      </div>
    );
  }
  
  return content;
};

// Componentes de conveniencia
export const LoadingSpinner: React.FC<Omit<LoadingProps, 'type'>> = (props) => <Loading type="spinner" {...props} />;
export const LoadingDots: React.FC<Omit<LoadingProps, 'type'>> = (props) => <Loading type="dots" {...props} />;
export const LoadingProgress: React.FC<Omit<LoadingProps, 'type'>> = (props) => <Loading type="progress" {...props} />;
export const LoadingSkeleton: React.FC<Omit<LoadingProps, 'type'>> = (props) => <Loading type="skeleton" {...props} />;
export const LoadingOverlay: React.FC<LoadingProps> = (props) => <Loading overlay {...props} />;
export const LoadingFullScreen: React.FC<LoadingProps> = (props) => <Loading fullScreen {...props} />;

export { Spinner, Dots, ProgressBar, Skeleton };
export default Loading;