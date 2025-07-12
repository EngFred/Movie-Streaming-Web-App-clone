import { useState, useEffect } from 'react';

type Breakpoints = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export const useBreakpoint = (): Breakpoints => {
  const getBreakpoints = (): Breakpoints => {
    const width = window.innerWidth;
    return {
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
    };
  };

  const [breakpoints, setBreakpoints] = useState<Breakpoints>(getBreakpoints());

  useEffect(() => {
    const handleResize = () => {
      setBreakpoints(getBreakpoints());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};
