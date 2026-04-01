import React, { useState } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import UserAvatar from '../components/UserAvatar';

export default function InboxScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { user, userAvatar } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      // 1. Get user's properties
      const { data: myProperties, error: propError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('user_id', user.id);

      if (propError) throw propError;
      if (!myProperties || myProperties.length === 0) {
        setNotifications([]);
        return;
      }

      const propIds = myProperties.map(p => p.id);
      const propMap = myProperties.reduce((acc: any, p: any) => {
        acc[p.id] = p.title;
        return acc;
      }, {});

      // 2. Fetch comments for these properties (excluding user's own comments)
      const { data: comments, error: commError } = await supabase
        .from('comments')
        .select('*, profiles(full_name, avatar_url, show_online_status)')
        .in('property_id', propIds)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (commError) throw commError;

      // Augment with property titles
      const augmented = (comments || []).map(c => ({
        ...c,
        propertyTitle: propMap[c.property_id] || 'Ваше объявление'
      }));

      setNotifications(augmented);
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }, [user, isDarkMode])
  );

  const handleNotificationPress = async (item: any) => {
    // 1. Mark as read
    if (!item.is_read) {
      await supabase
        .from('comments')
        .update({ is_read: true })
        .eq('id', item.id);
    }

    // 2. Navigate to Details
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', item.property_id)
      .single();

    if (!error && property) {
      navigation.navigate('MainTabs', { 
        screen: 'HomeTab', 
        params: { 
          screen: 'ListingDetails', 
          params: { property, scrollToComments: true } 
        } 
      });
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#0047AB', '#FF8C00', '#25D366', '#FF3B30', '#9B59B6', '#34495E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderItem = ({ item }: { item: any }) => {
    const userName = item.profiles?.full_name || 'Пользователь';
    const avatarColor = getAvatarColor(userName);
    const initial = userName.charAt(0).toUpperCase();

    return (
      <TouchableOpacity 
        style={[
          styles.notificationCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          !item.is_read && (isDarkMode ? { backgroundColor: '#1A2A40', borderColor: '#2A3A50' } : styles.unreadCard)
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <UserAvatar 
          url={item.profiles?.avatar_url} 
          size={50} 
          isOnline={item.profiles?.show_online_status} 
          fallbackName={userName} 
          style={{ marginRight: 15 }} 
        />
        
        <View style={styles.content}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.userName, { color: colors.text }, !item.is_read && (isDarkMode ? { color: colors.primary } : styles.unreadText)]}>
              {userName}
            </Text>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
          
           <Text style={[styles.propertyTitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Объект: {item.propertyTitle}
          </Text>
          
          <Text style={[styles.commentPreview, { color: isDarkMode ? colors.text : '#444' }]} numberOfLines={2}>
            "{item.content}"
          </Text>
          
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString('ru-RU', { 
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Уведомления</Text>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <UserAvatar 
            url={userAvatar} 
            size={42} 
            fallbackName={user?.user_metadata?.full_name || 'Пользователь'} 
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => {
              setIsRefreshing(true);
              fetchNotifications();
            }} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={64} color={isDarkMode ? '#444' : '#ccc'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>У вас пока нет уведомлений</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
    borderColor: '#e0eaff',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadText: {
    color: '#0047AB',
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0047AB',
  },
  propertyTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  commentPreview: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
