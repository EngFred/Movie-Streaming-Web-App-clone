import React from 'react';

interface SpinProps {
  className?: string;
}

export const Spin: React.FC<SpinProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};