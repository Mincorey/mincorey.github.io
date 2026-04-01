import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName, StatusBar as RNStatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  card: string;
  surfaceVariant: string;
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const lightTheme: ThemeColors = {
  background: '#fff',
  surface: '#f8f8f8',
  text: '#333',
  textSecondary: '#666',
  border: '#f0f0f0',
  primary: '#0047AB',
  card: '#fff',
  surfaceVariant: '#f0f0f0',
};

const darkTheme: ThemeColors = {
  background: '#1E1E1E',
  surface: '#2C2C2E',
  text: '#fff',
  textSecondary: '#aaa',
  border: '#404040',
  primary: '#4DA8DA',
  card: '#2C2C2E',
  surfaceVariant: '#3A3A3A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    Appearance.getColorScheme() === 'dark'
  );

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(Appearance.getColorScheme() === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('app_theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(colors.background);
    }
  }, [isDarkMode, colors]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
