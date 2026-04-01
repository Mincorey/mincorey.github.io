import React, { useState, useRef } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StatusBar as RNStatusBar, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
import UserAvatar from '../components/UserAvatar';

const { width } = Dimensions.get('window');

const FILTERS = ['Все', 'Купить', 'Продать', 'Аренда'];
const PAGE_SIZE = 10;

export default function HomeScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Все');
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user, userAvatar } = useAuth();
  const flatListRef = useRef<FlatList<any>>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const fetchProperties = async (loadMore = false) => {
    if (loadMore) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const currentPage = loadMore ? page + 1 : 0;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Base query
      let query = supabase.from('properties').select('*, likes(count), comments(count)');

      // Apply filtering
      if (activeFilter === 'Купить') {
        query = query.eq('deal_type', 'Продажа');
      } else if (activeFilter === 'Продать') {
        query = query.eq('deal_type', 'Покупка');
      } else if (activeFilter === 'Аренда') {
        query = query.eq('deal_type', 'Аренда');
      }

      const { data: propData, error: propError } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (propError) throw propError;

      // 2. Fetch current user's likes and favorites if logged in
      let likedIds = new Set();
      let favoritedIds = new Set();
      if (user) {
        const [likesRes, favsRes] = await Promise.all([
          supabase.from('likes').select('property_id').eq('user_id', user.id),
          supabase.from('favorites').select('property_id').eq('user_id', user.id)
        ]);
        
        if (!likesRes.error && likesRes.data) {
          likedIds = new Set(likesRes.data.map(l => l.property_id));
        }
        if (!favsRes.error && favsRes.data) {
          favoritedIds = new Set(favsRes.data.map(f => f.property_id));
        }
      }

      // 3. Augment data
      const augmentedData = (propData || []).map(item => ({
        ...item,
        likesCount: item.likes?.[0]?.count || 0,
        commentsCount: item.comments?.[0]?.count || 0,
        isLiked: likedIds.has(item.id),
        isFavorited: favoritedIds.has(item.id)
      }));

      setHasMore(augmentedData.length === PAGE_SIZE);

      if (loadMore) {
        setProperties(prev => [...prev, ...augmentedData]);
        setPage(currentPage);
      } else {
        setProperties(augmentedData);
        setPage(0);
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      // 1. Get user's properties
      const { data: myProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id);

      if (!myProperties || myProperties.length === 0) {
        setUnreadCount(0);
        return;
      }

      const propIds = myProperties.map(p => p.id);

      // 2. Count unread comments
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propIds)
        .neq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };


  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchProperties(false), fetchUnreadCount()]);
    setIsRefreshing(false);
  };

  const showAlert = (config: any) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const checkAuthAndProceed = (action: () => void) => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Некоторые действия доступны только зарегистрированным пользователям.',
        primaryBtnText: 'Войти',
        primaryBtnAction: () => {
          setAlertVisible(false);
          navigation.navigate('ProfileTab');
        },
        secondaryBtnText: 'ОК',
        secondaryBtnAction: () => setAlertVisible(false),
      });
      return;
    }
    action();
  };

  const handleLike = async (propertyId: string, isCurrentlyLiked: boolean) => {
    if (!user) return;

    // Optimistic UI update
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
      fetchProperties();
    }
  };

  const handleToggleFavorite = async (propertyId: string, isCurrentlyFavorited: boolean) => {
    if (!user) return;

    // Optimistic UI update
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          isFavorited: !isCurrentlyFavorited
        };
      }
      return p;
    }));

    try {
      if (isCurrentlyFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error.message);
      fetchProperties();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProperties(false);
      fetchUnreadCount();
    }, [user, activeFilter])
  );

  React.useEffect(() => {
    fetchProperties(false);
  }, [activeFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDetailedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }} 
        />
        <Text style={[styles.headerTitle, { color: colors.primary, marginLeft: 8 }]}>APSNY-NEDVIGA</Text>
      </View>
      <View style={styles.headerRight}>
        {user && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Inbox')}
          >
            <Ionicons name="mail-outline" size={28} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badgeContainer, { borderColor: colors.background }]}>
                <Text style={styles.badgeTextCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <UserAvatar 
            url={userAvatar} 
            size={36} 
            fallbackName={user?.user_metadata?.full_name || 'Пользователь'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={[
              styles.filterButton,
              { 
                backgroundColor: isActive ? '#0047AB' : (isDarkMode ? colors.surface : '#F5F5F7')
              }
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: isActive ? '#fff' : (isDarkMode ? colors.textSecondary : '#666') }
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderPropertyCard = ({ item }: { item: any }) => {
    const mainImage = item.images && item.images.length > 0 
      ? { uri: item.images[0] } 
      : { uri: 'https://via.placeholder.com/400x300?text=Нет+фото' };

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('ListingDetails', { property: item })}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          {item.deal_type === 'Покупка' ? (
            <View 
              style={[
                styles.purchaseTextContainer, 
                { backgroundColor: isDarkMode ? colors.surface : '#F5F5F7', borderColor: colors.border }
              ]}
            >
              <Text 
                style={[styles.purchaseCardDescription, { color: colors.textSecondary }]} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {item.description || 'Нет описания'}
              </Text>
            </View>
          ) : (
            <Image source={mainImage} style={styles.cardImage} />
          )}
          <View style={[styles.badge, { backgroundColor: item.deal_type === 'Аренда' ? colors.primary : (item.deal_type === 'Покупка' ? '#2E8B57' : '#CC5500') }]}>
            <Text style={styles.badgeText}>{item.deal_type ? item.deal_type.toUpperCase() : (item.is_rent ? 'АРЕНДА' : 'ПРОДАЖА')}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{item.city}, {item.district} район</Text>
          </View>
          {item.deal_type !== 'Покупка' && (
            <Text style={[styles.descriptionText, { color: isDarkMode ? '#aaa' : '#888' }]} numberOfLines={2}>
              {item.title}
            </Text>
          )}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.footerLeft}>
              <TouchableOpacity 
                style={styles.stat}
                onPress={() => checkAuthAndProceed(() => handleLike(item.id, item.isLiked))}
              >
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={item.isLiked ? "#FF3B30" : colors.textSecondary} 
                />
                <Text style={[styles.statText, { color: colors.textSecondary }, item.isLiked && { color: "#FF3B30", fontWeight: 'bold' }]}>
                  {item.likesCount}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.stat}
                onPress={() => navigation.navigate('ListingDetails', { property: item, scrollToComments: true })}
              >
                <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.commentsCount}</Text>
              </TouchableOpacity>
              <View style={styles.stat}>
                <Ionicons name="eye-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.views || 0}</Text>
              </View>
            </View>
            <View style={styles.footerRight}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDetailedDate(item.created_at)}
              </Text>
              <TouchableOpacity onPress={() => checkAuthAndProceed(() => handleToggleFavorite(item.id, item.isFavorited))}>
                <Ionicons 
                  name={item.isFavorited ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={item.isFavorited ? colors.primary : colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {renderHeader()}
      {renderFilterBar()}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <AppLoader />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            setShowScrollTop(offsetY > 500);
          }}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (hasMore && !isLoading && !isFetchingMore) {
              fetchProperties(true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            isFetchingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]} 
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Объявлений пока нет</Text>
            </View>
          )}
        />
      )}

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText={alertConfig.primaryBtnText}
        primaryBtnAction={alertConfig.primaryBtnAction}
        secondaryBtnText={alertConfig.secondaryBtnText}
        secondaryBtnAction={alertConfig.secondaryBtnAction}
      />

      {showScrollTop && (
        <TouchableOpacity 
          style={[styles.scrollToTopBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            setTimeout(() => {
              onRefresh();
            }, 500);
          }}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0047AB',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feed: {
    paddingHorizontal: 16,
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
    height: width * 0.6,
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
  purchaseTextContainer: {
    width: '100%',
    height: 100,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
  },
  purchaseCardDescription: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'normal',
    textAlign: 'left',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: '#888',
    lineHeight: 20,
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
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginRight: 8,
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
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeTextCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollToTopBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },
});
