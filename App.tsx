import React from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import * as Linking from 'expo-linking';
// import { YaMap } from 'react-native-yamap';
// TODO: Uncomment for Production (Yandex Maps)
// YaMap.init('2466afbd-94a7-4e25-bbd1-0c38ad97b80b');

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

function RootApp() {
  const { isDarkMode, colors } = useTheme();

  const navTheme = isDarkMode ? { ...NavigationDarkTheme, colors: { ...NavigationDarkTheme.colors, background: colors.background } } : NavigationDefaultTheme;

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <TabNavigator />
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={isDarkMode ? colors.background : "#ffffff"}
        translucent={false}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}