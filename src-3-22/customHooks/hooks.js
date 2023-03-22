import { useState, useEffect, useMemo } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
};

export const useOrganisation = () => {
  const organisation = useMemo(() => {
    const organisationData = localStorage.setOrganisationData;
    if (organisationData) {
      return JSON.parse(organisationData);
    }
    return null;
  }, [localStorage.setOrganisationData]);

  return organisation ? organisation : {};
};
