import React, { useState, useEffect } from 'react';
import AppLoader from '../components/AppLoader';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

export default function PrivacySettingsScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('show_phone, show_email, show_whatsapp, show_telegram, show_online_status')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setShowPhone(data.show_phone ?? true);
        setShowEmail(data.show_email ?? true);
        setShowWhatsapp(data.show_whatsapp ?? true);
        setShowTelegram(data.show_telegram ?? true);
        setShowOnlineStatus(data.show_online_status ?? true);
      }
    } catch (error: any) {
      console.error('Error fetching privacy settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          show_phone: showPhone,
          show_email: showEmail,
          show_whatsapp: showWhatsapp,
          show_telegram: showTelegram,
          show_online_status: showOnlineStatus,
        })
        .eq('id', user.id);

      if (error) throw error;

      setAlertConfig({
        title: 'Успех',
        message: 'Настройки приватности успешно сохранены',
      });
      setAlertVisible(true);
    } catch (error: any) {
      setAlertConfig({
        title: 'Ошибка',
        message: error.message,
      });
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const renderSettingItem = (label: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDarkMode ? '#333' : '#eee', true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#999'}
      />
    </View>
  );

  if (loading) {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Конфиденциальность</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.descriptionSection}>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            Укажите, что будет доступно для просмотра другим пользователям
          </Text>
        </View>

        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {renderSettingItem('Отображать телефон', showPhone, setShowPhone)}
          {renderSettingItem('Отображать E-mail', showEmail, setShowEmail)}
          {renderSettingItem('Отображать WhatsApp', showWhatsapp, setShowWhatsapp)}
          {renderSettingItem('Отображать Telegram', showTelegram, setShowTelegram)}
          {renderSettingItem('Статус "в сети"', showOnlineStatus, setShowOnlineStatus)}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.backLink, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#E5E5EA' }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backLinkText, { color: colors.text }]}>Назад</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText="ОК"
        primaryBtnAction={() => {
          setAlertVisible(false);
        }}
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
  scrollContent: {
    padding: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
