import React from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const LOCATIONS: Record<string, string[]> = {
  'Любой район': ['Любой город'],
  'Гагрский': ['Любой город', 'Гагра', 'Пицунда', 'Другой населенный пункт...'],
  'Гудаутский': ['Любой город', 'Гудаута', 'Новый Афон', 'Другой населенный пункт...'],
  'Сухумский': ['Любой город', 'Сухум', 'Другой населенный пункт...'],
  'Гулрыпшский': ['Любой город', 'Гулрыпш', 'Агудзера', 'Другой населенный пункт...'],
  'Очамчырский': ['Любой город', 'Очамчыра', 'Другой населенный пункт...'],
  'Ткуарчалский': ['Любой город', 'Ткуарчал', 'Другой населенный пункт...'],
  'Галский': ['Любой город', 'Гал', 'Другой населенный пункт...'],
};

const DEAL_TYPES = ['Все', 'Купить', 'Продать', 'Аренда'];

const SelectionModal = ({ visible, onClose, data, onSelect, title }: any) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.modalItemText, { color: colors.text }]}>{item}</Text>
                <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#333' : '#eee'} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};


const FilterChip = ({ label, value, onPress }: { label: string; value: string; onPress: () => void }) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.chip, { backgroundColor: isDarkMode ? colors.surface : '#f5f5f5' }]}
      onPress={onPress}
    >
      <Text style={[styles.chipLabel, { color: isDarkMode ? '#888' : '#888' }]}>{label}: </Text>
      <Text 
        style={[styles.chipValue, { color: colors.primary }]} 
        numberOfLines={1} 
        ellipsizeMode="tail"
      >
        {value}
      </Text>
      <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#666' : '#666'} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
};

export default function SearchResultsScreen({ navigation, route }: any) {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const initialFilters = route.params?.filters || {};
  
  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Interactive Filter States
  const [district, setDistrict] = React.useState(initialFilters.district || 'Любой район');
  const [city, setCity] = React.useState(initialFilters.city || 'Любой город');
  const [dealType, setDealType] = React.useState(initialFilters.dealType || 'Все');
  
  // Modal states
  const [isDistrictModalVisible, setDistrictModalVisible] = React.useState(false);
  const [isCityModalVisible, setCityModalVisible] = React.useState(false);
  const [isDealTypeModalVisible, setDealTypeModalVisible] = React.useState(false);

  // Alert State
  const [isAlertVisible, setAlertVisible] = React.useState(false);
  const [alertConfig, setAlertConfig] = React.useState({
    title: '',
    message: '',
    primaryBtnText: '',
    primaryBtnAction: () => {},
    secondaryBtnText: '',
    secondaryBtnAction: () => {},
  });

  const showAlert = (config: any) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('properties').select('*, likes(count), comments(count)');

      if (initialFilters.searchQuery) {
        query = query.or(`title.ilike.%${initialFilters.searchQuery}%,description.ilike.%${initialFilters.searchQuery}%`);
      }

      if (district !== 'Любой район') {
        query = query.eq('district', district);
      }

      if (city !== 'Любой город') {
        if (city === 'Другой населенный пункт...' && initialFilters.customCity) {
          query = query.ilike('city', `%${initialFilters.customCity}%`);
        } else if (city !== 'Другой населенный пункт...') {
          query = query.eq('city', city);
        }
      }

      if (initialFilters.priceFrom) {
        query = query.gte('price', Number(initialFilters.priceFrom));
      }

      if (initialFilters.priceTo) {
        query = query.lte('price', Number(initialFilters.priceTo));
      }

      if (dealType !== 'Все') {
        if (dealType === 'Купить') {
          query = query.eq('deal_type', 'Продажа');
        } else if (dealType === 'Продать') {
          query = query.eq('deal_type', 'Покупка');
        } else if (dealType === 'Аренда') {
          query = query.eq('deal_type', 'Аренда');
        }
      }

      const { data: propData, error: propError } = await query.order('created_at', { ascending: false });

      if (propError) throw propError;

      // Fetch user likes/favorites for sync
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

      const augmentedData = (propData || []).map(item => ({
        ...item,
        likesCount: item.likes?.[0]?.count || 0,
        commentsCount: item.comments?.[0]?.count || 0,
        isLiked: likedIds.has(item.id),
        isFavorited: favoritedIds.has(item.id)
      }));

      setResults(augmentedData);
    } catch (error: any) {
      console.error('Search error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchResults();
    RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [district, city, dealType, isDarkMode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDetailedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const checkAuthAndProceed = (action: () => void) => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Некоторые действия доступны только зарегистрированным пользователям.',
        primaryBtnText: 'Войти',
        primaryBtnAction: () => {
          setAlertVisible(false);
          navigation.navigate('Login');
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
    setResults(prev => prev.map(p => {
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
        await supabase.from('likes').delete().match({ user_id: user.id, property_id: propertyId });
      } else {
        await supabase.from('likes').insert({ user_id: user.id, property_id: propertyId });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
      fetchResults();
    }
  };

  const handleToggleFavorite = async (propertyId: string, isCurrentlyFavorited: boolean) => {
    if (!user) return;
    setResults(prev => prev.map(p => {
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
        await supabase.from('favorites').delete().match({ user_id: user.id, property_id: propertyId });
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error.message);
      fetchResults();
    }
  };

  const renderItem = ({ item }: { item: any }) => {
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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Результаты поиска</Text>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }} 
        />
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterRowStatic}>
          <FilterChip label="РАЙОН" value={district} onPress={() => setDistrictModalVisible(true)} />
          <FilterChip label="ГОРОД" value={city} onPress={() => setCityModalVisible(true)} />
          <FilterChip label="ТИП" value={dealType} onPress={() => setDealTypeModalVisible(true)} />
        </View>
      </View>

      <View style={styles.resultsSummary}>
        <Text style={[styles.resultsCount, { color: colors.text }]}>
          {isLoading ? 'Поиск...' : `Найдено ${results.length} объв.`}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <AppLoader />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && results.length > 0}
              onRefresh={fetchResults}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={isDarkMode ? '#444' : '#ccc'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>По вашему запросу ничего не найдено</Text>
              <TouchableOpacity 
                style={[styles.retryBtn, { backgroundColor: colors.primary }]} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryBtnText}>Изменить поиск</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <SelectionModal 
        visible={isDistrictModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        data={Object.keys(LOCATIONS)}
        onSelect={(val: string) => { setDistrict(val); setCity('Любой город'); setDistrictModalVisible(false); }}
        title="Выберите район"
      />

      <SelectionModal 
        visible={isCityModalVisible}
        onClose={() => setCityModalVisible(false)}
        data={LOCATIONS[district] || []}
        onSelect={(val: string) => { setCity(val); setCityModalVisible(false); }}
        title="Выберите город"
      />

      <SelectionModal 
        visible={isDealTypeModalVisible}
        onClose={() => setDealTypeModalVisible(false)}
        data={DEAL_TYPES}
        onSelect={(val: string) => { setDealType(val); setDealTypeModalVisible(false); }}
        title="Тип сделки"
      />

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText={alertConfig.primaryBtnText}
        primaryBtnAction={alertConfig.primaryBtnAction}
        secondaryBtnText={alertConfig.secondaryBtnText}
        secondaryBtnAction={alertConfig.secondaryBtnAction}
      />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRowStatic: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    minWidth: '28%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  chipLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: 'bold',
  },
  chipValue: {
    fontSize: 11,
    color: '#0047AB',
    fontWeight: 'bold',
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
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
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.7,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 24,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 24,
  },
});
