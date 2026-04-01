import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface UserAvatarProps {
  url?: string | null;
  size?: number;
  isOnline?: boolean;
  fallbackName?: string;
  style?: any;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  url, 
  size = 50, 
  isOnline = false, 
  fallbackName = 'Пользователь',
  style 
}) => {
  const { colors, isDarkMode } = useTheme();

  const getAvatarColor = (name: string) => {
    const avatarColors = ['#0047AB', '#FF8C00', '#25D366', '#FF3B30', '#9B59B6', '#34495E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const avatarColor = getAvatarColor(fallbackName);
  const initial = fallbackName.charAt(0).toUpperCase();

  const containerStyle = [
    styles.container,
    { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      borderColor: isOnline ? '#4CAF50' : (isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#eeeeee'),
      borderWidth: isOnline ? 2 : 1.5,
    },
    style
  ];

  if (url) {
    return (
      <View style={containerStyle}>
        <Image source={{ uri: url }} style={styles.image} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: avatarColor }]}>
      <Text style={[styles.initial, { fontSize: size / 2.5 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserAvatar;
