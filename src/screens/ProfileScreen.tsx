import React, { useState, useEffect, useRef } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { user, refreshAvatar, loading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Dynamic Contact States
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');

  // Editing States
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);

  const loadProfile = async () => {
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone, whatsapp, telegram, balance')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFullName(data?.full_name || '');
        setAvatarUrl(data?.avatar_url || null);
        setPhone(data?.phone || '');
        setWhatsapp(data?.whatsapp || '');
        setTelegram(data?.telegram || '');
        setBalance(data?.balance ?? 0);
        setEmail(user?.email || '');
      }

      // Fetch App Settings
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('is_payment_enabled')
        .eq('id', 1)
        .single();
      
      if (!settingsError && settings) {
        setIsPaymentEnabled(settings.is_payment_enabled);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const pickAndUploadImage = async () => {
    if (!user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      setProfileLoading(true);
      const base64 = result.assets[0].base64;
      const filePath = `${user.id}/${Date.now()}.jpg`;
      const fileData = decode(base64);

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await refreshAvatar();
      setAvatarUrl(publicUrl);
      setAlertTitle('Успех');
      setAlertMessage('Аватарка успешно обновлена');
      setAlertMode('info');
      setAlertVisible(true);

    } catch (error: any) {
      setAlertTitle('Ошибка');
      setAlertMessage(error.message);
      setAlertMode('info');
      setAlertVisible(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      setIsEditingName(false);
      
      setAlertTitle('Успех');
      setAlertMessage('Имя успешно обновлено');
      setAlertMode('info');
      setAlertVisible(true);
    } catch (error: any) {
      setAlertTitle('Ошибка');
      setAlertMessage(error.message);
      setAlertMode('info');
      setAlertVisible(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveContacts = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone: phone,
          whatsapp: whatsapp,
          telegram: telegram
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      setIsEditingContacts(false);
      
      setAlertTitle('Успех');
      setAlertMessage('Контакты успешно обновлены');
      setAlertMode('info');
      setAlertVisible(true);
    } catch (error: any) {
      setAlertTitle('Ошибка');
      setAlertMessage(error.message);
      setAlertMode('info');
      setAlertVisible(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '+7 ';
    if (cleaned.length > 1) {
      const part1 = cleaned.substring(1, 4);
      const part2 = cleaned.substring(4, 7);
      const part3 = cleaned.substring(7, 9);
      const part4 = cleaned.substring(9, 11);
      
      if (part1) formatted += `(${part1}`;
      if (part1.length === 3 && cleaned.length > 4) formatted += ') ';
      if (part2) formatted += part2;
      if (part2.length === 3 && cleaned.length > 7) formatted += '-';
      if (part3) formatted += part3;
      if (part3.length === 2 && cleaned.length > 9) formatted += '-';
      if (part4) formatted += part4;
    }
    return formatted.slice(0, 18);
  };

  const formatWhatsApp = (text: string) => {
    const prefix = 'wa.me/';
    // If text is shorter than prefix and was prefix before, allow it to stay as prefix or be cleared
    if (text.length < prefix.length) return prefix;
    
    const digits = text.slice(prefix.length).replace(/\D/g, '');
    return prefix + digits;
  };

  const formatTelegram = (text: string) => {
    if (text && !text.startsWith('@')) {
      return '@' + text.replace('@', '');
    }
    return text;
  };

  const fetchMyListings = async () => {
    // Moved to MyListingsScreen.tsx
  };

  useFocusEffect(
    React.useCallback(() => {
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
      loadProfile();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [user, isDarkMode])
  );

  // Alert State
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMode, setAlertMode] = useState<'confirm' | 'info'>('confirm');

  const handleSignOut = async () => {
    setAlertTitle('Выход');
    setAlertMessage('Вы уверены, что хотите выйти из аккаунта?');
    setAlertMode('confirm');
    setAlertVisible(true);
  };

  const confirmSignOut = async () => {
    setAlertVisible(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAlertTitle('Ошибка');
      setAlertMessage('Не удалось выйти из аккаунта');
      setAlertMode('info');
      setTimeout(() => setAlertVisible(true), 100);
    }
  };

  const renderContactItem = (label: string, value: string, icon: any, stateValue: string, setState: (val: string) => void, placeholder: string, keyboard: any = 'default') => (
    <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
      <View style={styles.contactLabelRow}>
        <Ionicons name={icon} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
        <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <View style={[styles.contactValueRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {isEditingContacts && label !== 'E-MAIL' ? (
          <TextInput
            style={[styles.contactTextInput, { color: colors.text }]}
            value={stateValue}
            onChangeText={setState}
            placeholder={placeholder}
            placeholderTextColor="#ccc"
            keyboardType={keyboard}
          />
        ) : (
          <Text style={[styles.contactValue, { color: colors.text }, !value && { color: isDarkMode ? '#555' : '#bbb', fontStyle: 'italic' }]}>
            {value || 'Не указано'}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <AppLoader />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]} edges={['top']}>
        <Ionicons name="person-circle-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 20, color: colors.text, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>
          Доступ закрыт
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 30, textAlign: 'center' }}>
          Войдите в аккаунт, чтобы просматривать профиль, управлять объявлениями и пополнять баланс.
        </Text>
        <TouchableOpacity 
          style={[{ backgroundColor: colors.primary, width: '100%', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>ВОЙТИ В АККАУНТ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }} 
          />
          <Text style={[styles.headerTitle, { color: colors.primary, marginLeft: 8 }]}>APSNY-NEDVIGA</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('Inbox')}>
            <Ionicons name="mail-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickAndUploadImage} disabled={profileLoading}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[
                  styles.avatar,
                  { 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#eeeeee',
                    borderWidth: 1.5
                  }
                ]}
              />
            ) : (
              <View 
                style={[
                  styles.avatar, 
                  styles.avatarPlaceholder, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#eeeeee',
                    borderWidth: 1.5
                  }
                ]}
              >
                <Ionicons name="person" size={50} color={colors.textSecondary} />
              </View>
            )}
            <View style={[styles.editAvatarBtn, { backgroundColor: colors.primary, borderColor: colors.card }]}>
              {profileLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[styles.userNameInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ваше имя"
                placeholderTextColor="#999"
              />
              <View style={styles.editButtonsRow}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelBtn, { backgroundColor: colors.surfaceVariant }]} 
                  onPress={() => {
                    setIsEditingName(false);
                    loadProfile();
                  }}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveBtn]} 
                  onPress={saveProfile}
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Сохранить</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={[styles.userName, { color: colors.text }]}>{fullName || 'Пользователь'}</Text>
              <TouchableOpacity 
                style={[styles.editIconContainer, { backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]} 
                onPress={() => setIsEditingName(true)}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.userStatus}>Управление вашим профилем</Text>
        </View>

        {/* Contact Data Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Контактные данные</Text>
            </View>
            {!isEditingContacts && (
              <TouchableOpacity 
                style={[styles.editIconContainer, { backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]} 
                onPress={() => setIsEditingContacts(true)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {renderContactItem('ТЕЛЕФОН', phone, 'call-outline', phone, (val) => setPhone(formatPhone(val)), '+7 (___) ___-__-__', 'phone-pad')}
          {renderContactItem('WHATSAPP', whatsapp, 'logo-whatsapp', whatsapp, (val) => setWhatsapp(formatWhatsApp(val)), 'wa.me/...', 'phone-pad')}
          {renderContactItem('E-MAIL', email, 'mail-outline', email, setEmail, 'email@example.com', 'email-address')}
          {renderContactItem('TELEGRAM', telegram, 'paper-plane-outline', telegram, (val) => setTelegram(formatTelegram(val)), '@username')}

          {isEditingContacts && (
            <View style={styles.cardEditActions}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelBtn, { minWidth: 120, backgroundColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]} 
                onPress={() => {
                  setIsEditingContacts(false);
                  loadProfile();
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.saveBtn, { minWidth: 120 }]} 
                onPress={saveContacts}
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Wallet Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, marginTop: -10 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="wallet-outline" size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Кошелек</Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: -10, marginBottom: 15, marginLeft: 2 }}>
            Стоимость публикации одного объявления 100 рублей.
          </Text>
          
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Ваш баланс</Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>{balance ?? 0} ₽</Text>
          </View>

          {isPaymentEnabled && (
            <TouchableOpacity 
              style={[styles.replenishBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                if (user?.email) {
                  await Clipboard.setStringAsync(user.email);
                }
                setAlertTitle('Пополнение баланса');
                setAlertMessage(`Ваш e-mail адрес скопирован в буфер:\n${user?.email}\nСейчас Вы будете перенаправлены на страницу для оплаты.\nПожалуйста, вставьте Ваш e-mail адрес в поле "Никнейм".`);
                setAlertMode('confirm');
                setAlertVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.replenishBtnText}>Пополнить баланс</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.profileActionsRow}>
          <TouchableOpacity 
            style={[styles.profileActionBtn, { backgroundColor: isDarkMode ? '#1a2233' : '#f0f7ff', borderColor: colors.border }]}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
            <Text style={[styles.profileActionBtnText, { color: colors.primary }]}>Избранное</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.profileActionBtn, { backgroundColor: isDarkMode ? '#221a1a' : '#fff5f5', borderColor: colors.border }]}
            onPress={() => navigation.navigate('Inbox')}
          >
            <Ionicons name="mail-outline" size={20} color="#FF3B30" />
            <Text style={[styles.profileActionBtnText, { color: '#FF3B30' }]}>Уведомления</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.myListingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('MyListings')}
        >
          <View style={styles.myListingsContent}>
            <Ionicons name="business-outline" size={22} color={colors.primary} />
            <Text style={[styles.myListingsText, { color: colors.primary }]}>МОИ ОБЪЯВЛЕНИЯ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.myListingsBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}
          onPress={() => navigation.navigate('PrivacySettings')}
        >
          <View style={styles.myListingsContent}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            <Text style={[styles.myListingsText, { color: colors.primary }]}>КОНФИДЕНЦИАЛЬНОСТЬ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutBtnText}>ВЫЙТИ ИЗ АККАУНТА</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        primaryBtnText={alertTitle === 'Пополнение баланса' ? "Перейти" : alertMode === 'confirm' ? "Выйти" : "OK"}
        primaryBtnAction={() => {
          if (alertMode === 'confirm') {
            if (alertTitle === 'Пополнение баланса') {
              setAlertVisible(false); // закрываем модалку
              // переходим на экран оплаты и передаем email для автозаполнения
              navigation.navigate('PaymentScreen', { email: email }); 
            } else {
              confirmSignOut();
            }
          } else {
            setAlertVisible(false);
          }
        }}
        secondaryBtnText={alertMode === 'confirm' ? "Отмена" : ""}
        secondaryBtnAction={alertMode === 'confirm' ? () => setAlertVisible(false) : undefined}
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
  navIcon: {
    padding: 4,
    marginLeft: 8,
  },
  editIconContainer: {
    backgroundColor: '#f0f7ff',
    padding: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0047AB',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#999',
  },
  sectionCard: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  contactItem: {
    marginBottom: 16,
  },
  contactLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 6,
  },
  contactValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contactTextInput: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    padding: 0,
  },
  emptyListings: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyListingsText: {
    color: '#999',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingLabelCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#999',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    height: 56,
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
  },
  profileActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 5,
  },
  profileActionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginLeft: 10,
  },
  cardEditActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  cardBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  cardSaveBtn: {
    backgroundColor: '#0047AB',
  },
  cardCancelBtn: {
    backgroundColor: '#eee',
  },
  cardSaveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardCancelBtnText: {
    color: '#666',
  },
  myListingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  myListingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myListingsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0047AB',
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editNameIcon: {
    marginLeft: 8,
    padding: 4,
  },
  editNameContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  userNameInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 18,
    textAlign: 'left',
    color: '#333',
    marginBottom: 12,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  replenishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    marginTop: 15,
  },
  replenishBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  saveBtn: {
    backgroundColor: '#0047AB',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
