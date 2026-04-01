import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AppLoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function AppLoader({ size = 'large', color }: AppLoaderProps) {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          shadowColor: isDarkMode ? '#000' : '#ccc'
        }
      ]}>
        <ActivityIndicator size={size} color={color || colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  }
});
