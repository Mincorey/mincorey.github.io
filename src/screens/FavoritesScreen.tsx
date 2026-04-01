import React, { useState } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function FavoritesScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userAvatar } = useAuth();

  // Alert State
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    primaryBtnText: '',
    primaryBtnAction: () => {},
    secondaryBtnText: '',
    secondaryBtnAction: () => {},
  });

  const fetchFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch user's favorites property IDs
      const { data: favsData, error: favsError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favsError) throw favsError;

      if (!favsData || favsData.length === 0) {
        setProperties([]);
        return;
      }

      const favIds = favsData.map(f => f.property_id);

      // 2. Fetch properties for these IDs
      // Also fetch like counts and like status while we're at it
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select(`
          *,
          likes(count)
        `)
        .in('id', favIds)
        .order('created_at', { ascending: false });

      if (propError) throw propError;

      // 3. Fetch user's likes for heart status
      const { data: userLikes, error: likeError } = await supabase
        .from('likes')
        .select('property_id')
        .eq('user_id', user.id);
      
      const likedIds = new Set(userLikes?.map(l => l.property_id) || []);

      // 4. Augment data
      const augmentedData = (propData || []).map(item => ({
        ...item,
        likesCount: item.likes?.[0]?.count || 0,
        isLiked: likedIds.has(item.id),
        isFavorited: true // They are favorites since they are on this screen
      }));

      setProperties(augmentedData);
    } catch (error: any) {
      console.error('Error fetching favorites:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }, [user, isDarkMode])
  );

  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) return;

    // Optimistic UI update: remove from list immediately
    setProperties(prev => prev.filter(p => p.id !== propertyId));

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, property_id: propertyId });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error removing favorite:', error.message);
      fetchFavorites();
    }
  };

  const handleLike = async (propertyId: string, isCurrentlyLiked: boolean) => {
    if (!user) return;

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          isLiked: !isCurrentlyLiked,
          likesCount: isCurrentlyLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
      fetchFavorites();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const renderPropertyCard = ({ item }: { item: any }) => {
    const mainImage = item.images && item.images.length > 0 
      ? { uri: item.images[0] } 
      : { uri: 'https://via.placeholder.com/400x300?text=Нет+фото' };

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('ListingDetails', { property: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={mainImage} style={styles.cardImage} />
          <View style={[styles.badge, { backgroundColor: item.is_rent ? '#0047AB' : '#CC5500' }]}>
            <Text style={styles.badgeText}>{item.is_rent ? 'АРЕНДА' : 'ПРОДАЖА'}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{item.city}, {item.district}</Text>
          </View>
          <Text style={[styles.descriptionText, { color: isDarkMode ? colors.text : '#888' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.footerLeft}>
              <TouchableOpacity 
                style={styles.stat}
                onPress={() => handleLike(item.id, item.isLiked)}
              >
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={item.isLiked ? (isDarkMode ? '#FF4b4b' : '#800000') : colors.textSecondary} 
                />
                <Text style={[styles.statText, { color: colors.textSecondary }, item.isLiked && { color: (isDarkMode ? '#FF4b4b' : '#800000'), fontWeight: 'bold' }]}>
                  {item.likesCount}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
              <Ionicons name="bookmark" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Сохранённые</Text>
        <TouchableOpacity 
          style={[
            styles.profileButton,
            { 
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#eeeeee',
              borderWidth: 1.5
            }
          ]} 
          onPress={() => navigation.navigate('ProfileTab')}
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <AppLoader />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={64} color={isDarkMode ? '#444' : '#ddd'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>У вас пока нет сохраненных объявлений</Text>
              <Text style={[styles.emptySubTitle, { color: colors.textSecondary }]}>
                Нажимайте на иконку закладки на объявлениях, чтобы они появились здесь.
              </Text>
              <TouchableOpacity 
                style={[styles.browseButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' })}
              >
                <Text style={styles.browseButtonText}>Перейти к поиску</Text>
              </TouchableOpacity>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
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
  feed: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: width * 0.5,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubTitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
