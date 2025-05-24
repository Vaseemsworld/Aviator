import React, { createContext, useContext } from 'react';
import useSoundEffects from '../hooks/useSoundEffects'; // Adjust the import if needed

// Create context
const SoundContext = createContext();

// Create a custom hook to access context easily
export const useSoundContext = () => {
  return useContext(SoundContext);
};

// Create a provider to wrap the app or specific component tree
export const SoundProvider = ({ children }) => {
  const soundEffects = useSoundEffects();

  return (
    <SoundContext.Provider value={soundEffects}>
      {children}
    </SoundContext.Provider>
  );
};
