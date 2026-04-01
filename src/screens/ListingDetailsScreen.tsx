import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  Linking,
  Share,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
import UserAvatar from '../components/UserAvatar';
import ImageView from "react-native-image-viewing";
// import YaMap, { Marker } from 'react-native-yamap';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

const MOCK_COMMENTS = [
  {
    id: '1',
    user: 'Алексей Иванов',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    text: 'Прекрасный вид! Подскажите, возможна ли ипотека?',
    date: '2 дня назад',
  },
  {
    id: '2',
    user: 'Марина С.',
    avatar: 'https://i.pravatar.cc/150?u=marina',
    text: 'Район очень тихий, была там на прошлой неделе. Рекомендую.',
    date: 'Вчера',
  },
];

export default function ListingDetailsScreen({ navigation, route }: any) {
  const { colors, isDarkMode } = useTheme();
  const { property, scrollToComments } = route.params || {};
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<any | null>(null);
  const [sellerListingCount, setSellerListingCount] = useState<number>(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [localViews, setLocalViews] = useState(property.views || 0);

  // Report State
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'property' | 'comment', id: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [hiddenComments, setHiddenComments] = useState<string[]>([]);

  const REPORT_REASONS = [
    'Спам или реклама',
    'Мошенничество',
    'Оскорбительное поведение',
    'Неверные контактные данные',
    'Другое'
  ];

  // Alert State
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    primaryBtnText: '',
    primaryBtnAction: () => {},
  });

  const showAlert = (config: any) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  useEffect(() => {
    const loadHiddenComments = async () => {
      try {
        const stored = await AsyncStorage.getItem('@hidden_comments');
        if (stored) {
          setHiddenComments(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load hidden comments', e);
      }
    };
    loadHiddenComments();
  }, []);

  const checkSocialStatus = async () => {
    if (!user || !property.id) return;
    try {
      // Check Likes
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('property_id', property.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (likeData) {
        setIsLiked(true);
        setLikeId(likeData.id);
      } else {
        setIsLiked(false);
        setLikeId(null);
      }

      // Check Favorites
      const { data: favData } = await supabase
        .from('favorites')
        .select('id')
        .eq('property_id', property.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (favData) {
        setIsFavorited(true);
        setFavoriteId(favData.id);
      } else {
        setIsFavorited(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error checking social status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Войдите, чтобы ставить лайки объявлениям.',
        primaryBtnText: 'ОК',
        primaryBtnAction: () => setAlertVisible(false),
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('property_id', property.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikeId(null);
      } else {
        const { data, error } = await supabase
          .from('likes')
          .insert([{ property_id: property.id, user_id: user.id }])
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
             setIsLiked(true);
             return;
          }
          throw error;
        }
        
        setIsLiked(true);
        setLikeId(data.id);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Войдите, чтобы добавлять объявления в Избранное',
        primaryBtnText: 'ОК',
        primaryBtnAction: () => setAlertVisible(false),
      });
      return;
    }

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsFavorited(false);
        setFavoriteId(null);
        showAlert({
          title: 'Удалено',
          message: 'Объявление удалено из Избранного',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => setAlertVisible(false),
        });
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert([{ property_id: property.id, user_id: user.id }])
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
             setIsFavorited(true);
             return;
          }
          throw error;
        }
        
        setIsFavorited(true);
        setFavoriteId(data.id);
        showAlert({
          title: 'Добавлено',
          message: 'Объявление добавлено в Избранное',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => setAlertVisible(false),
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error.message);
    }
  };

  const incrementViews = async () => {
    if (!property?.id) return;
    try {
      await supabase.rpc('increment_views', { row_id: property.id });
      setLocalViews((prev: number) => prev + 1);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const onShare = async () => {
    try {
      const shareUrl = `https://abkhazia-realty.app/property/${property.id}`;
      await Share.share({
        title: property.title,
        message: `Посмотри это объявление на Abkhazia Realty: ${property.title}\n${shareUrl}`,
        url: shareUrl, // For iOS support
      });
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  const fetchSeller = async () => {
    if (!property?.user_id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, show_online_status')
        .eq('id', property.user_id)
        .single();
      
      if (error) throw error;
      setSellerProfile(data);

      // Fetch seller listing count
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', property.user_id);
      
      setSellerListingCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching seller:', error.message);
    }
  };

  const fetchComments = async () => {
    if (!property?.id) return;
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, avatar_url, show_online_status)')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error.message);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
      fetchComments();
      fetchSeller();
      checkSocialStatus();
    }, [property?.id, property?.user_id, user?.id, isDarkMode])
  );

  useEffect(() => {
    incrementViews();
  }, [property?.id]);

  useEffect(() => {
    if (scrollToComments && !isLoadingComments) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scrollToComments, isLoadingComments]);

  const submitReport = async () => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Войдите, чтобы отправить жалобу',
        primaryBtnText: 'ОК',
        primaryBtnAction: () => setAlertVisible(false),
      });
      return;
    }

    if (!reportReason || !reportTarget) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_item_type: reportTarget.type,
          reported_item_id: reportTarget.id,
          reason: reportReason,
          details: reportReason === 'Другое' ? reportDetails.trim() : null,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (reportTarget.type === 'comment') {
        const newHidden = [...hiddenComments, reportTarget.id];
        setHiddenComments(newHidden);
        await AsyncStorage.setItem('@hidden_comments', JSON.stringify(newHidden));
      }

      setReportModalVisible(false);
      setReportReason('');
      setReportDetails('');
      setReportTarget(null);

      showAlert({
        title: 'Жалоба отправлена',
        message: 'Спасибо за сигнал! Мы проверим информацию в ближайшее время.',
        primaryBtnText: 'ОК',
        primaryBtnAction: () => setAlertVisible(false),
      });
    } catch (error: any) {
      console.error('Error submitting report:', error.message);
      showAlert({
        title: 'Ошибка',
        message: 'Не удалось отправить жалобу. Попробуйте позже.',
        primaryBtnText: 'ОК',
        primaryBtnAction: () => setAlertVisible(false),
      });
    }
  };

  const submitComment = async () => {
    if (!user) return;
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          property_id: property.id,
          user_id: user.id,
          content: newComment,
          parent_id: replyingTo?.id || null
        });

      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      fetchComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#0047AB', '#FF8C00', '#25D366', '#FF3B30', '#9B59B6', '#34495E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!property) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={isDarkMode ? '#444' : '#ccc'} />
        <Text style={[styles.errorText, { color: colors.text }]}>Объявление не найдено</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Вернуться назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const imageList = property.images && property.images.length > 0
    ? property.images
    : ['https://via.placeholder.com/1200x800?text=Нет+фото'];

  const renderCharacteristic = (icon: any, value: string, label: string) => (
    <View style={styles.charBox}>
      <Ionicons name={icon} size={24} color="#0047AB" />
      <Text style={styles.charValue}>{value}</Text>
      <Text style={styles.charLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header Image Gallery */}
        {property.deal_type !== 'Покупка' ? (
          <View style={[styles.galleryContainer, { backgroundColor: isDarkMode ? colors.surface : '#eee', borderColor: isDarkMode ? colors.border : '#E5E5EA' }]}>
            <FlatList
              data={imageList}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setActiveImageIndex(index);
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity activeOpacity={0.9} onPress={() => {
                  setActiveImageIndex(index);
                  setImageViewVisible(true);
                }}>
                  <Image
                    source={{ uri: item }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            
            {/* Pagination dots */}
            <View style={styles.paginationDots}>
              {imageList.map((_: any, index: number) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    activeImageIndex === index && styles.activeDot
                  ]} 
                />
              ))}
            </View>
  
            <SafeAreaView style={styles.imageOverlay} edges={['top']}>
              <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        ) : (
          <View style={styles.compactHeader}>
            <TouchableOpacity style={[styles.backButtonCircle, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.favoriteButtonCircle, { backgroundColor: colors.surface }]}
              onPress={handleFavoriteToggle}
            >
              <Ionicons 
                name={isFavorited ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isFavorited ? colors.primary : colors.text} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={[styles.actionsCard, { backgroundColor: isDarkMode ? colors.surface : '#F5F5F7', borderColor: isDarkMode ? colors.border : '#E5E5EA' }]}>
          <View style={styles.headerActionBadge}>
            <Ionicons name="eye-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.headerBadgeText, { color: colors.textSecondary }]}>{localViews}</Text>
          </View>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleLikeToggle}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#E21D48" : (isDarkMode ? '#fff' : "#333")} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleFavoriteToggle}>
            <Ionicons name={isFavorited ? "bookmark" : "bookmark-outline"} size={26} color={isFavorited ? colors.primary : (isDarkMode ? '#fff' : "#333")} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={onShare}>
            <Ionicons name="share-outline" size={26} color={isDarkMode ? '#fff' : "#333"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton} 
            onPress={() => {
              setReportTarget({ type: 'property', id: property.id });
              setReportModalVisible(true);
            }}
          >
            <Ionicons name="warning-outline" size={26} color="#FFA500" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.paddingContainer}>
          <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {property.deal_type ? property.deal_type.toUpperCase() : 'ПРОДАЖА'}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{property.city}, {property.district} район</Text>
          </View>
        </View>

        {/* Price Section */}
        <View style={[styles.priceSection, { borderTopColor: colors.border, borderBottomColor: colors.border, backgroundColor: isDarkMode ? colors.card : '#fff' }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Цена</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>{formatPrice(property.price)}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (sellerProfile?.phone) {
                  Linking.openURL('tel:' + sellerProfile.phone.replace(/\D/g, ''));
                }
              }}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Позвонить</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.paddingContainer}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>Описание</Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {property.description}
          </Text>
          
          {property.is_negotiable && (
            <View style={[styles.negotiableBadge, { backgroundColor: isDarkMode ? 'rgba(0, 71, 171, 0.1)' : '#f0f7ff', borderColor: isDarkMode ? 'rgba(0, 71, 171, 0.3)' : '#e0eaff' }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={[styles.negotiableBadgeText, { color: colors.primary }]}>Торг уместен</Text>
            </View>
          )}
        </View>

        {/* Map Section */}
        {property.latitude && property.longitude && (
          <View style={styles.paddingContainer}>
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>Расположение</Text>
            <View style={[styles.detailsMapWrapper, { borderColor: colors.border }]}>
            {/* <YaMap
                style={styles.detailsMap}
                initialRegion={{
                  lat: property.latitude,
                  lon: property.longitude,
                  zoom: 14,
                  azimuth: 0,
                  tilt: 0,
                }}
              >
                <Marker point={{ lat: property.latitude, lon: property.longitude }}>
                   <Ionicons name="location" size={32} color={colors.primary} />
                </Marker>
              </YaMap> */}
              <MapView
                style={styles.detailsMap}
                initialRegion={{
                  latitude: property.latitude,
                  longitude: property.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                  }}
                >
                  <Ionicons name="location" size={32} color={colors.primary} />
                </Marker>
              </MapView>
            </View>
          </View>
        )}

        {/* Characteristics Grid - REMOVED per user request */}

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Связаться с продавцом</Text>
          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.sellerHeader}
              onPress={() => navigation.navigate('PublicProfile', { userId: property.user_id })}
            >
              <UserAvatar 
                url={sellerProfile?.avatar_url} 
                size={50} 
                isOnline={sellerProfile?.show_online_status} 
                fallbackName={sellerProfile?.full_name} 
              />
              <View>
                <Text style={[styles.sellerName, { color: colors.text }]}>{sellerProfile?.full_name || 'Пользователь'}</Text>
                <Text style={[styles.sellerStats, { color: colors.textSecondary }]}>
                  Объявлений: {sellerListingCount}
                </Text>
                <Text style={[styles.sellerStats, { color: colors.textSecondary }]}>
                  На сервисе с {(() => {
                    if (!sellerProfile?.created_at) return '...';
                    const date = new Date(sellerProfile.created_at);
                    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    return `${months[date.getMonth()]} ${date.getFullYear()}`;
                  })()}
                </Text>
              </View>
            </TouchableOpacity>

            {sellerProfile?.whatsapp && (
              <TouchableOpacity 
                style={[styles.contactRow, { borderTopColor: colors.border }]}
                onPress={() => Linking.openURL('https://wa.me/' + sellerProfile.whatsapp.replace(/\D/g, ''))}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={[styles.contactText, { color: colors.text }]}>WhatsApp</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {sellerProfile?.telegram && (
              <TouchableOpacity 
                style={[styles.contactRow, { borderTopColor: colors.border }]}
                onPress={() => Linking.openURL('https://t.me/' + sellerProfile.telegram.replace('@', ''))}
              >
                <Ionicons name="paper-plane" size={20} color="#0088cc" />
                <Text style={[styles.contactText, { color: colors.text }]}>Telegram</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Comments Section */}
        <View style={[styles.paddingContainer, { paddingBottom: 100 }]}>
          {(() => {
            const visibleComments = comments.filter(c => !hiddenComments.includes(c.id));
            return (
              <>
                <View style={styles.commentsHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Комментарии</Text>
                  <View style={[styles.commentsBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.commentsCountText}>{visibleComments.length}</Text>
                  </View>
                </View>

                {user ? (
                  <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                  >
                    <View style={[styles.commentInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {replyingTo && (
                        <View style={[styles.replyingToBar, { backgroundColor: isDarkMode ? colors.surface : '#f8f8f8', borderBottomColor: colors.border }]}>
                          <Text style={[styles.replyingToText, { color: colors.textSecondary }]}>
                            Ответ пользователю <Text style={{ fontWeight: 'bold', color: colors.text }}>{replyingTo.profiles?.full_name || 'Пользователь'}</Text>
                          </Text>
                          <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View style={[styles.commentInputRow, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#f0f0f0' }]}>
                        <TextInput
                          style={[styles.commentInput, { color: colors.text }]}
                          placeholder="Оставьте ваш комментарий..."
                          value={newComment}
                          onChangeText={setNewComment}
                          placeholderTextColor={colors.textSecondary}
                          multiline
                        />
                        <TouchableOpacity style={styles.sendIcon} onPress={submitComment}>
                          <Ionicons name="send" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                ) : (
                  <TouchableOpacity 
                    style={[styles.loginPrompt, { backgroundColor: isDarkMode ? colors.card : '#f0f7ff', borderColor: colors.border }]} 
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                    <Text style={[styles.loginPromptText, { color: colors.primary }]}>Войдите или зарегистрируйтесь, чтобы оставить комментарий</Text>
                  </TouchableOpacity>
                )}

                {isLoadingComments ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                  visibleComments.map((item) => {
                    const isReply = !!item.parent_id;
                    
                    return (
                      <TouchableOpacity 
                        key={item.id} 
                        activeOpacity={0.7}
                        onLongPress={() => {
                          setReportTarget({ type: 'comment', id: item.id });
                          setReportModalVisible(true);
                        }}
                        style={[
                          styles.commentCard, 
                          isReply ? styles.replyCard : styles.mainCommentCard
                        ]}
                      >
                        <TouchableOpacity 
                          style={styles.commentAvatarWrapper}
                          onPress={() => navigation.navigate('PublicProfile', { userId: item.user_id })}
                        >
                          <UserAvatar 
                            url={item.profiles?.avatar_url} 
                            size={40} 
                            isOnline={item.profiles?.show_online_status} 
                            fallbackName={item.profiles?.full_name} 
                          />
                        </TouchableOpacity>
                        
                        <View style={styles.commentBody}>
                          <View style={[
                            styles.commentContentBubble, 
                            { backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7' }
                          ]}>
                            <View style={styles.commentMeta}>
                              <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { userId: item.user_id })}>
                                <Text style={[styles.commentUserName, { color: colors.text }]}>
                                  {item.profiles?.full_name || 'Пользователь'}
                                </Text>
                              </TouchableOpacity>
                              <Text style={[styles.commentDate, { color: colors.textSecondary }]}>{formatDate(item.created_at)}</Text>
                            </View>
                            <Text style={[styles.commentText, { color: colors.text }]}>{item.content}</Text>
                          </View>
                          
                          {!isReply && (
                            <TouchableOpacity 
                              style={styles.replyButton}
                              onPress={() => setReplyingTo(item)}
                            >
                              <Ionicons name="return-down-forward" size={14} color="#888" />
                              <Text style={styles.replyButtonText}>Ответить</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            );
          })()}
        </View>
      </ScrollView>

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText={alertConfig.primaryBtnText}
        primaryBtnAction={alertConfig.primaryBtnAction}
      />

      {/* Report Modal */}
      <Modal
        visible={isReportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseArea} 
            activeOpacity={1} 
            onPress={() => setReportModalVisible(false)} 
          />
          <View style={[styles.reportModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>В чем проблема?</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportReasonsList}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity 
                  key={reason} 
                  style={styles.reasonItem}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={[styles.reasonText, { color: colors.text }]}>{reason}</Text>
                  <View style={[
                    styles.radioCircle, 
                    { borderColor: colors.primary },
                    reportReason === reason && { backgroundColor: colors.primary }
                  ]}>
                    {reportReason === reason && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                </TouchableOpacity>
              ))}

              {reportReason === 'Другое' && (
                <TextInput
                  style={[
                    styles.reportDetailsInput, 
                    { 
                      backgroundColor: isDarkMode ? colors.surface : '#f9f9f9', 
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Опишите подробнее..."
                  placeholderTextColor={colors.textSecondary}
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  multiline
                  numberOfLines={4}
                />
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.submitReportBtn, 
                { backgroundColor: reportReason ? '#FF3B30' : '#ccc' }
              ]}
              disabled={!reportReason}
              onPress={submitReport}
            >
              <Text style={styles.submitReportBtnText}>Отправить жалобу</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ImageView
        images={imageList.map((uri: string) => ({ uri }))}
        imageIndex={activeImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
        backgroundColor={isDarkMode ? 'rgba(18, 18, 18, 0.85)' : 'rgba(0, 0, 0, 0.7)'}
        // @ts-ignore - explicitly requested by user for status bar handling
        statusBarTranslucent={true}
      />
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  galleryContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    height: 400,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#eee',
  },
  actionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 25,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'visible',
  },
  mainImage: {
    width: width - 32,
    height: '100%',
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0eaff',
  },
  negotiableBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0047AB',
    marginLeft: 6,
  },
  paddingContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  badge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 32,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  priceSection: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  priceContainer: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0047AB',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0, // Changed from 10 to 0 as there's only one button
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  secondaryBtnText: {
    color: '#0047AB',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  charGrid: {
    marginTop: 8,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  charBox: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  charValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  charLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  sellerSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sellerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sellerStats: {
    fontSize: 13,
    marginTop: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favoriteButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sellerStatus: {
    fontSize: 12,
    color: '#25D366',
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsBadge: {
    backgroundColor: '#0047AB',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
    minWidth: 30,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsCountText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  commentInputContainer: {
    marginBottom: 24,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
    paddingVertical: 8,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0eaff',
  },
  loginPromptText: {
    flex: 1,
    fontSize: 14,
    color: '#0047AB',
    marginLeft: 10,
    fontWeight: '500',
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sendIcon: {
    marginLeft: 10,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mainCommentCard: {
    // Styles for top-level comments
  },
  replyCard: {
    marginLeft: 30,
    borderLeftWidth: 3,
    borderLeftColor: '#0047AB',
    paddingLeft: 12,
  },
  commentAvatarWrapper: {
    marginRight: 12,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentBody: {
    flex: 1,
  },
  commentContentBubble: {
    borderRadius: 16,
    padding: 12,
    borderTopLeftRadius: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  replyButtonText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#0047AB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  detailsMapWrapper: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
  },
  detailsMap: {
    flex: 1,
  },
  // Report Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCloseArea: {
    flex: 1,
  },
  reportModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportReasonsList: {
    padding: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  reasonText: {
    fontSize: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportDetailsInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  submitReportBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReportBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
