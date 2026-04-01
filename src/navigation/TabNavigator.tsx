import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import ListingDetailsScreen from '../screens/ListingDetailsScreen';
import AddListingScreen from '../screens/AddListingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import InboxScreen from '../screens/InboxScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen'; // Refreshed import to clear lint error
import PaymentScreen from '../screens/PaymentScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const ProfileWrapperStack = createNativeStackNavigator();
const AddWrapperStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ListingDetails" component={ListingDetailsScreen} />
      <HomeStack.Screen name="Inbox" component={InboxScreen} />
      <HomeStack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <HomeStack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen} 
        options={{ title: 'Сброс пароля' }} 
      />
    </HomeStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="SearchResults" component={SearchResultsScreen} />
      <SearchStack.Screen name="ListingDetails" component={ListingDetailsScreen} />
      <SearchStack.Screen name="PublicProfile" component={PublicProfileScreen} />
    </SearchStack.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Login" component={LoginScreen} />
      <ProfileStack.Screen name="Register" component={RegisterScreen} />
      <ProfileStack.Screen name="MyListings" component={MyListingsScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <ProfileStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      {/* Добавляем новый экран оплаты: */}
      <ProfileStack.Screen name="PaymentScreen" component={PaymentScreen} /> 
      {/* Сохраняем остальные экраны для работы навигации: */}
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
      <ProfileStack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <ProfileStack.Screen name="ListingDetails" component={ListingDetailsScreen} />
    </ProfileStack.Navigator>
  );
}

function ProfileTabWrapper() {
  const { user } = useAuth();
  return (
    <ProfileWrapperStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <ProfileWrapperStack.Screen name="ProfileStackScreen" component={ProfileStackScreen} />
      ) : (
        <ProfileWrapperStack.Screen name="AuthStackScreen" component={AuthStackScreen} />
      )}
    </ProfileWrapperStack.Navigator>
  );
}

function AddTabWrapper() {
  const { user } = useAuth();
  return (
    <AddWrapperStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <AddWrapperStack.Screen name="AddListingScreen" component={AddListingScreen} />
      ) : (
        <AddWrapperStack.Screen name="AuthStackScreen" component={AuthStackScreen} />
      )}
    </AddWrapperStack.Navigator>
  );
}

const CustomTabBarButton = ({ children, onPress, style, isKeyboardVisible }: any) => {
  if (isKeyboardVisible) return null;
  return (
    <TouchableOpacity
      style={styles.customButtonContainer}
      onPress={onPress}
    >
      <View style={[styles.customButton, style]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

function TabNavigator() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Add') {
            iconName = 'add';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#777' : 'gray',
        tabBarStyle: {
          height: 80,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackScreen} 
        options={{ title: 'Главная' }} 
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchStackScreen} 
        options={{ title: 'Поиск' }} 
      />
      <Tab.Screen
        name="Add"
        component={AddTabWrapper}
        options={{
          title: 'Добавить',
          tabBarButton: (props) => (
            <CustomTabBarButton 
              {...props} 
              style={{ backgroundColor: colors.primary }} 
              isKeyboardVisible={isKeyboardVisible}
            >
              <Ionicons name="add" size={32} color="white" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileTabWrapper}
        options={{ title: 'Профиль' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Настройки' }} 
      />
    </Tab.Navigator>
  );
}

export default function Navigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
