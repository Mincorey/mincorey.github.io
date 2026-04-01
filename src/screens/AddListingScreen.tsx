import React, { useState } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
// import { YaMap } from 'react-native-yamap';
import MapView from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const LOCATIONS = {
  'Гагрский': ['Гагра', 'Пицунда', 'Другой населенный пункт...'],
  'Гудаутский': ['Гудаута', 'Новый Афон', 'Другой населенный пункт...'],
  'Сухумский': ['Сухум', 'Другой населенный пункт...'],
  'Гулрыпшский': ['Гулрыпш', 'Агудзера', 'Другой населенный пункт...'],
  'Очамчырский': ['Очамчыра', 'Другой населенный пункт...'],
  'Ткуарчалский': ['Ткуарчал', 'Другой населенный пункт...'],
  'Галский': ['Гал', 'Другой населенный пункт...'],
};

type DistrictKey = keyof typeof LOCATIONS;

const SelectionModal = ({ visible, onClose, data, onSelect, title }: any) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
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
                <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#444' : '#eee'} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function AddListingScreen({ navigation, route }: any) {
  const { colors, isDarkMode } = useTheme();
  const { editProperty } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState<DistrictKey | ''>('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [isRent, setIsRent] = useState(false);
  const [dealType, setDealType] = useState('Продажа');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  
  const [isMapEnabled, setIsMapEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 43.0015, lon: 41.0234 });

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

  // Modal visibility states
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [isCityModalVisible, setCityModalVisible] = useState(false);

  const handleDistrictSelect = (selectedDistrict: DistrictKey) => {
    setDistrict(selectedDistrict);
    setCity('');
    setCustomCity('');
    setDistrictModalVisible(false);
  };

  React.useEffect(() => {
    if (editProperty) {
      setTitle(editProperty.title || '');
      setDistrict(editProperty.district || '');
      setCity(editProperty.city || '');
      setPrice(editProperty.price?.toString() || '');
      setIsNegotiable(editProperty.is_negotiable || false);
      setDealType(editProperty.deal_type || 'Продажа');
      setDescription(editProperty.description || '');
      
      if (editProperty.images) {
        setSelectedImages(editProperty.images.map((url: string) => ({ uri: url })));
      }
    }
  }, [editProperty]);

  // Task 2: Background auto-save logic (Debounce 1.5s)
  React.useEffect(() => {
    if (editProperty) return;

    const draft = { 
      title, 
      description, 
      price, 
      district, 
      customCity, 
      city, 
      dealType, 
      isNegotiable, 
      isRent 
    };

    const timer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('@draft_listing', JSON.stringify(draft));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, description, price, district, customCity, city, dealType, isNegotiable, isRent]);

  // Task 3: Check and restore draft on mount
  React.useEffect(() => {
    const checkDraft = async () => {
      if (editProperty) return;

      try {
        const savedDraft = await AsyncStorage.getItem('@draft_listing');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          
          // Only prompt if there is meaningful data in the draft
          const hasData = draft.title || draft.description || draft.price || draft.district;
          
          if (hasData) {
            showAlert({
              title: 'Найден черновик',
              message: 'У вас есть несохраненное объявление. Хотите продолжить заполнение?',
              primaryBtnText: 'Продолжить',
              primaryBtnAction: () => {
                setTitle(draft.title || '');
                setDescription(draft.description || '');
                setPrice(draft.price || '');
                setDistrict(draft.district || '');
                setCity(draft.city || '');
                setCustomCity(draft.customCity || '');
                setDealType(draft.dealType || 'Продажа');
                setIsNegotiable(draft.isNegotiable || false);
                setIsRent(draft.isRent || false);
                setAlertVisible(false);
              },
              secondaryBtnText: 'Начать заново',
              secondaryBtnAction: async () => {
                await AsyncStorage.removeItem('@draft_listing');
                setAlertVisible(false);
              },
            });
          }
        }
      } catch (error) {
        console.error('Error checking draft:', error);
      }
    };

    checkDraft();
    fetchUserBalance();
  }, [user]);

  const fetchUserBalance = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setUserBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    if (selectedCity !== 'Другой населенный пункт...') {
      setCustomCity('');
    }
    setCityModalVisible(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Доступ ограничен', 'Нам нужно разрешение на доступ к галерее, чтобы загрузить фото.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const uploadImagesToSupabase = async () => {
    const uploadedUrls = [];
    for (const image of selectedImages) {
      // Smart check: if image is already a URL from Supabase, don't re-upload
      if (image.uri.startsWith('http')) {
        uploadedUrls.push(image.uri);
        continue;
      }

      if (!image.base64) continue;
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(filePath, decode(image.base64), {
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Upload error:', error);
        showAlert({
          title: 'Ошибка загрузки',
          message: 'Не удалось загрузить некоторые фотографии.',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => setAlertVisible(false),
        });
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath);
        
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!user) {
      showAlert({
        title: 'Вход обязателен',
        message: 'Вы должны быть авторизованы, чтобы подать объявление',
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

    setLoading(true);
    try {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const trimmedCustomCity = customCity.trim();
      const trimmedPrice = price.trim();

      // Check balance before proceeding
      if (userBalance < 100) {
        showAlert({
          title: 'Недостаточно средств',
          message: 'Недостаточно средств на балансе. Стоимость публикации: 100 ₽. Пожалуйста, пополните кошелек в разделе Профиль.',
          primaryBtnText: 'Пополнить',
          primaryBtnAction: () => {
            setAlertVisible(false);
            navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
          },
          secondaryBtnText: 'ОК',
          secondaryBtnAction: () => setAlertVisible(false),
        });
        setLoading(false);
        return;
      }

      if (!trimmedTitle || !district || !city || !trimmedPrice) {
        showAlert({
          title: 'Внимание',
          message: 'Пожалуйста, заполните все обязательные поля',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => setAlertVisible(false),
        });
        setLoading(false);
        return;
      }

      if (city === 'Другой населенный пункт...' && !trimmedCustomCity) {
        showAlert({
          title: 'Внимание',
          message: 'Пожалуйста, введите название населенного пункта',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => setAlertVisible(false),
        });
        setLoading(false);
        return;
      }

      // 1. Upload Images first
      const imageUrls = await uploadImagesToSupabase();

      // 2. Submit Listing
      const listingData = {
        title: trimmedTitle,
        district,
        city: city === 'Другой населенный пункт...' ? trimmedCustomCity : city,
        price: parseFloat(trimmedPrice),
        is_negotiable: isNegotiable,
        is_rent: dealType === 'Аренда',
        deal_type: dealType,
        description: trimmedDescription,
        images: imageUrls,
        user_id: user.id,
        latitude: isMapEnabled ? mapCenter.lat : null,
        longitude: isMapEnabled ? mapCenter.lon : null,
      };

      if (editProperty) {
        const { error } = await supabase
          .from('properties')
          .update(listingData)
          .eq('id', editProperty.id);
        
        if (error) throw error;

        showAlert({
          title: 'Успешно!',
          message: 'Объявление успешно обновлено!',
          primaryBtnText: 'ОК',
          primaryBtnAction: () => {
            setAlertVisible(false);
            navigation.navigate('ProfileTab', { screen: 'MyListings' });
          },
        });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([{ ...listingData, created_at: new Date().toISOString() }]);

        if (error) throw error;

        // Task 4: Clear draft after successful publication
        await AsyncStorage.removeItem('@draft_listing');

        // Reset all form states
        setTitle('');
        setDistrict('');
        setCity('');
        setCustomCity('');
        setPrice('');
        setIsNegotiable(false);
        setDescription('');
        setDealType('Продажа');
        setIsRent(false);
        setSelectedImages([]);

        showAlert({
          title: 'Успешно!',
          message: 'Ваше объявление опубликовано и скоро появится в ленте.',
          primaryBtnText: 'Отлично',
          primaryBtnAction: () => {
            setAlertVisible(false);
            navigation.navigate('ProfileTab', { screen: 'MyListings' });
          },
        });

        // 3. Deduct Balance
        const newBalance = userBalance - 100;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', user.id);
        
        if (!balanceError) {
          setUserBalance(newBalance);
        }
      }
    } catch (error: any) {
      console.error('Error submitting listing:', error.message);
      showAlert({
        title: 'Ошибка',
        message: 'Не удалось опубликовать объявление: ' + error.message,
        primaryBtnText: 'Попробовать снова',
        primaryBtnAction: () => setAlertVisible(false),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    showAlert({
      title: 'Очистить форму?',
      message: 'Все введенные данные и выбранные фотографии будут удалены. Это действие нельзя отменить.',
      primaryBtnText: 'Очистить',
      primaryBtnAction: async () => {
        try {
          await AsyncStorage.removeItem('@draft_listing');
          setTitle('');
          setDistrict('');
          setCity('');
          setCustomCity('');
          setPrice('');
          setIsNegotiable(false);
          setDescription('');
          setDealType('Продажа');
          setSelectedImages([]);
          setAlertVisible(false);
        } catch (error) {
          console.error('Error clearing form:', error);
        }
      },
      secondaryBtnText: 'Отмена',
      secondaryBtnAction: () => setAlertVisible(false),
    });
  };

  const showAlert = (config: any) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const renderDropdown = (label: string, value: string, placeholder: string, onPress: () => void, disabled: boolean = false) => (
    <View style={[styles.fieldContainer, disabled && { opacity: 0.5 }]}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity 
        style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, { color: colors.text }, !value && { color: isDarkMode ? '#555' : '#999' }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{editProperty ? 'Редактировать объявление' : 'Добавить объявление'}</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.introSection}>
              <Text style={styles.introLabel}>НОВОЕ ПРЕДЛОЖЕНИЕ</Text>
              <Text style={[styles.introTitle, { color: colors.text }]}>Заполните карточку объявления</Text>
            </View>

            {/* Deal Type Toggle */}
            <View style={[styles.transactionTypeContainer, { backgroundColor: colors.surface }]}>
              {['Продажа', 'Покупка', 'Аренда'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    { backgroundColor: colors.card },
                    dealType === type && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setDealType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    { color: colors.textSecondary },
                    dealType === type && { color: '#fff' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Photo Section */}
            {dealType !== 'Покупка' && (
              <View style={[styles.photoSection, { backgroundColor: colors.surface }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Фотографии</Text>
                  </View>
                  <Text style={styles.photoCount}>{selectedImages.length.toString()} ФОТО</Text>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.primary }]} onPress={pickImage}>
                    <Ionicons name="add" size={32} color={colors.primary} />
                    <Text style={[styles.uploadBtnText, { color: colors.primary }]}>ЗАГРУЗИТЬ ФОТО</Text>
                  </TouchableOpacity>
                  {selectedImages.map((img, index) => (
                    <View key={index} style={styles.mockPhotoContainer}>
                      <Image source={{ uri: img.uri }} style={styles.mockPhoto} />
                      <TouchableOpacity 
                        style={styles.removePhotoBtn} 
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Fields */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>ЗАГОЛОВОК ОБЪЯВЛЕНИЯ</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Например: Просторная квартира в г. Сухум"
                value={title}
                onChangeText={(text) => setTitle(text.trimStart())}
                onBlur={() => setTitle(title.trim())}
                placeholderTextColor={isDarkMode ? '#555' : '#999'}
              />
            </View>

            {renderDropdown(
              'РАЙОН', 
              district ? `${district} район` : '', 
              'Выберите район', 
              () => setDistrictModalVisible(true)
            )}
            
            {renderDropdown(
              'ГОРОД ИЛИ НАСЕЛЕННЫЙ ПУНКТ', 
              city, 
              'Выберите город', 
              () => setCityModalVisible(true),
              !district
            )}

            {city === 'Другой населенный пункт...' && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>УКАЖИТЕ НАСЕЛЕННЫЙ ПУНКТ</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="Введите название..."
                  value={customCity}
                  onChangeText={(text) => setCustomCity(text.trimStart())}
                  onBlur={() => setCustomCity(customCity.trim())}
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                  autoFocus
                />
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>ЦЕНА (₽)</Text>
              <View style={[styles.priceInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  placeholder="0"
                  value={price}
                  onChangeText={(text) => setPrice(text.trim())}
                  keyboardType="numeric"
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                />
                <Text style={styles.currencySuffix}>RUB</Text>
              </View>
            </View>

            <View style={styles.negotiableRow}>
              <View style={styles.negotiableToggle}>
                <Switch
                  value={isNegotiable}
                  onValueChange={setIsNegotiable}
                  trackColor={{ false: isDarkMode ? '#333' : '#eee', true: colors.primary }}
                  thumbColor="#fff"
                />
                <Text style={[styles.negotiableLabel, { color: colors.textSecondary }]}>Уместен ли торг?</Text>
              </View>
            </View>

            {/* Map Section */}
            <View style={styles.mapToggleRow}>
              <Switch
                value={isMapEnabled}
                onValueChange={setIsMapEnabled}
                trackColor={{ false: isDarkMode ? '#333' : '#eee', true: colors.primary }}
                thumbColor="#fff"
              />
              <Text style={[styles.mapToggleLabel, { color: colors.textSecondary }]}>Указать локацию на карте</Text>
            </View>

            {isMapEnabled && (
              <View style={[styles.mapWrapper, { borderColor: colors.border }]}>
                {/* <YaMap
                  style={styles.map}
                  initialRegion={{
                    lat: mapCenter.lat,
                    lon: mapCenter.lon,
                    zoom: 12,
                    azimuth: 0,
                    tilt: 0,
                  }}
                  onCameraPositionChangeEnd={(event) => {
                    const { lat, lon } = event.nativeEvent.point;
                    setMapCenter({ lat, lon });
                  }}
                /> */}
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: mapCenter.lat,
                    longitude: mapCenter.lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onRegionChangeComplete={(region) => {
                    setMapCenter({ lat: region.latitude, lon: region.longitude });
                  }}
                />
                <View style={styles.markerFixed}>
                  <Ionicons name="location-sharp" size={36} color="#FF3B30" />
                </View>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>ОПИСАНИЕ</Text>
              <TextInput
                style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Опишите подробней о чем ваше объявление"
                value={description}
                onChangeText={(text) => setDescription(text.trimStart())}
                onBlur={() => setDescription(description.trim())}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={isDarkMode ? '#555' : '#999'}
              />
            </View>

            <View style={styles.footerNote}>
              <Text style={styles.footerNoteText}>
                Нажимая «Подать объявление», вы соглашаетесь с правилами публикации и условиями использования сервиса APSNY-NEDVIGA.
              </Text>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                    <Text style={styles.submitBtnText}>{editProperty ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'ОПУБЛИКОВАТЬ ОБЪЯВЛЕНИЕ'}</Text>
                  </>
                )}
              </TouchableOpacity>

              {!editProperty && (title || description || price || selectedImages.length > 0) && (
                <TouchableOpacity 
                   style={styles.clearButton} 
                   onPress={handleClearForm}
                >
                  <Text style={styles.clearButtonText}>Очистить форму</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <AppLoader />
          <Text style={[styles.loadingText, { color: '#fff' }]}>{editProperty ? 'Обновляем объявление...' : 'Публикуем ваше объявление...'}</Text>
          <Text style={[styles.loadingSubText, { color: '#ccc' }]}>Это займет немного времени.</Text>
        </View>
      </Modal>

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText={alertConfig.primaryBtnText}
        primaryBtnAction={alertConfig.primaryBtnAction}
        secondaryBtnText={alertConfig.secondaryBtnText}
        secondaryBtnAction={alertConfig.secondaryBtnAction}
      />

      <SelectionModal
        visible={isDistrictModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        title="Выберите район"
        data={Object.keys(LOCATIONS)}
        onSelect={handleDistrictSelect}
      />

      <SelectionModal
        visible={isCityModalVisible}
        onClose={() => setCityModalVisible(false)}
        title="Выберите город"
        data={district ? LOCATIONS[district as DistrictKey] : []}
        onSelect={handleCitySelect}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  helpButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  introSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  introLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  photoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  photoCount: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  photoScroll: {
    flexDirection: 'row',
  },
  uploadBtn: {
    width: width * 0.35,
    height: width * 0.45,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 10,
  },
  uploadBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0047AB',
    marginTop: 8,
    textAlign: 'center',
  },
  mockPhotoContainer: {
    width: width * 0.35,
    height: width * 0.45,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  mockPhoto: {
    width: '100%',
    height: '100%',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  multilineInput: {
    height: 150,
    paddingTop: 16,
    paddingBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  currencySuffix: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginLeft: 8,
  },
  negotiableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  negotiableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  negotiableLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    marginBottom: 24,
    gap: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typeButtonActive: {
    backgroundColor: '#0047AB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  footerNote: {
    marginTop: 10,
    marginBottom: 20,
  },
  footerNoteText: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 16,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#0047AB',
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
  },
  headerActionBadge: {
    opacity: 0.7,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  clearButton: {
    width: '100%',
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C62828',
    marginTop: 12,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.7,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 20,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  mapToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapToggleLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  mapWrapper: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -36,
    zIndex: 10,
  },
});
