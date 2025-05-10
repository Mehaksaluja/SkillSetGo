import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const { currentUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDarkMode = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
        if (settingsDoc.exists()) {
          const { darkMode } = settingsDoc.data();
          setIsDarkMode(darkMode);
          if (darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error loading dark mode setting:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDarkMode();
  }, [currentUser]);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'userSettings', currentUser.uid), {
          darkMode: newDarkMode,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving dark mode setting:', error);
      }
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isLoading }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
} 