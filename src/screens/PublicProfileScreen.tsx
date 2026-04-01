import React, { useState, useEffect } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen({ navigation, route }: any) {
  const { userId } = route.params;
  const { colors, isDarkMode } = useTheme();
  
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserProperties();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching public profile:', error.message);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, likes(count), comments(count)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching user properties:', error.message);
    } finally {
      setIsLoading(false);
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
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image source={mainImage} style={styles.cardImage} />
          <View style={[styles.badge, { backgroundColor: item.deal_type === 'Аренда' ? colors.primary : (item.deal_type === 'Покупка' ? '#2E8B57' : '#CC5500') }]}>
            <Text style={styles.badgeText}>{item.deal_type ? item.deal_type.toUpperCase() : 'ПРОДАЖА'}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.priceText, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{item.city}</Text>
          </View>
          <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <AppLoader />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Профиль</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPropertyCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <UserAvatar 
              url={profile?.avatar_url} 
              size={100} 
              isOnline={profile?.show_online_status} 
              fallbackName={profile?.full_name} 
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.userName, { color: colors.text }]}>{profile?.full_name || 'Пользователь'}</Text>
            
            {profile?.show_online_status && (
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={[styles.onlineText, { color: colors.textSecondary }]}>В сети</Text>
              </View>
            )}

            <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
              {properties.length} объявлений
            </Text>

            {/* Блок контактов */}
            <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.contactCardTitle, { color: colors.text }]}>Способы связи</Text>
              
              {(() => {
                const showPhone = profile?.phone && profile?.show_phone;
                const showWhatsapp = profile?.whatsapp && profile?.show_whatsapp;
                const showTelegram = profile?.telegram && profile?.show_telegram;
                const showEmail = profile?.email && profile?.show_email;

                if (!showPhone && !showWhatsapp && !showTelegram && !showEmail) {
                  return (
                    <Text style={[styles.hiddenText, { color: colors.textSecondary }]}>
                      Пользователь скрыл контактные данные
                    </Text>
                  );
                }

                return (
                  <View style={styles.contactList}>
                    {showPhone && (
                      <TouchableOpacity 
                        style={styles.contactItem} 
                        onPress={() => Linking.openURL(`tel:${profile.phone}`)}
                      >
                        <View style={[styles.contactIconContainer, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name="call" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Телефон</Text>
                          <Text style={[styles.contactValue, { color: colors.text }]}>{profile.phone}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}

                    {showWhatsapp && (
                      <TouchableOpacity 
                        style={styles.contactItem} 
                        onPress={() => Linking.openURL(`whatsapp://send?phone=${profile.whatsapp.replace(/[^0-9]/g, '')}`)}
                      >
                        <View style={[styles.contactIconContainer, { backgroundColor: '#25D36615' }]}>
                          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>WhatsApp</Text>
                          <Text style={[styles.contactValue, { color: colors.text }]}>{profile.whatsapp}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}

                    {showTelegram && (
                      <TouchableOpacity 
                        style={styles.contactItem} 
                        onPress={() => Linking.openURL(`https://t.me/${profile.telegram.replace('@', '')}`)}
                      >
                        <View style={[styles.contactIconContainer, { backgroundColor: '#0088CC15' }]}>
                          <Ionicons name="paper-plane" size={20} color="#0088CC" />
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Telegram</Text>
                          <Text style={[styles.contactValue, { color: colors.text }]}>{profile.telegram}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}

                    {showEmail && (
                      <TouchableOpacity 
                        style={styles.contactItem} 
                        onPress={() => Linking.openURL(`mailto:${profile.email}`)}
                      >
                        <View style={[styles.contactIconContainer, { backgroundColor: '#E1BEE7' }]}>
                          <Ionicons name="mail" size={20} color="#9C27B0" />
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>E-mail</Text>
                          <Text style={[styles.contactValue, { color: colors.text }]}>{profile.email}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })()}
            </View>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Все объявления автора</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Объявлений пока нет</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    marginBottom: 20,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contactCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  contactCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  hiddenText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  separator: {
    width: '100%',
    height: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: (width - 48) / 2,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 11,
    marginLeft: 2,
  },
  titleText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
