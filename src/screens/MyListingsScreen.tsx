import React, { useState } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function MyListingsScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { user, userAvatar } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const showAlert = (config: any) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const fetchMyListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyListings(data || []);
    } catch (error: any) {
      console.error('Error fetching my listings:', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (propertyId: string) => {
    showAlert({
      title: 'Удаление',
      message: 'Вы уверены, что хотите удалить это объявление?',
      primaryBtnText: 'Да, удалить',
      primaryBtnAction: async () => {
        setAlertVisible(false);
        try {
          const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId);
          
          if (error) throw error;
          fetchMyListings();
        } catch (error: any) {
          console.error('Error deleting listing:', error.message);
        }
      },
      secondaryBtnText: 'Отмена',
      secondaryBtnAction: () => setAlertVisible(false),
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMyListings();
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }, [user, isDarkMode])
  );

  const renderListingItem = ({ item }: { item: any }) => {
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0] 
      : 'https://via.placeholder.com/400x300?text=Нет+фото';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('MainTabs', { 
          screen: 'HomeTab', 
          params: { 
            screen: 'ListingDetails', 
            params: { property: item, scrollToComments: false } 
          } 
        })}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={[styles.badge, { backgroundColor: item.is_rent ? '#0047AB' : '#CC5500' }]}>
          <Text style={styles.badgeText}>{item.is_rent ? 'АРЕНДА' : 'ПРОДАЖА'}</Text>
        </View>
        
        {/* Management Buttons */}
        <View style={styles.managementButtons}>
          <TouchableOpacity 
            style={[styles.manageBtn, styles.editBtn]} 
            onPress={() => navigation.navigate('MainTabs', { 
              screen: 'Add', 
              params: { editProperty: item } 
            })}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.manageBtn, styles.deleteBtn]} 
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.price, { color: colors.text }]}>{new Intl.NumberFormat('ru-RU').format(item.price)} ₽</Text>
          <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>{item.city}, {item.district}</Text>
          <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Мои объявления</Text>
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
              <Ionicons name="person-circle-outline" size={30} color={colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <AppLoader />
        </View>
      ) : (
        <FlatList
          data={myListings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Ionicons name="business-outline" size={64} color={isDarkMode ? '#444' : '#ccc'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>У вас пока нет объявлений</Text>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Add')}
              >
                <Text style={styles.addBtnText}>Создать первое</Text>
              </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  addBtn: {
    marginTop: 24,
    backgroundColor: '#0047AB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
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
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  title: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  managementButtons: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
  },
  manageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editBtn: {
    backgroundColor: '#0047AB',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
});
