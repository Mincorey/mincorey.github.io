import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import AppIcon from '../../assets/images/icon.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function SettingsScreen({ navigation }: any) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { user, userAvatar } = useAuth();

  const renderSettingRow = (icon: any, label: string, subLabel: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.settingRow}>
      <View style={[styles.settingIconContainer, { backgroundColor: colors.card }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingLabelCol}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{subLabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDarkMode ? '#333' : '#eee', true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Настройки</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Основные</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            {renderSettingRow(
              'contrast-outline',
              'Тёмная тема',
              'Экономия заряда батареи',
              isDarkMode,
              toggleTheme
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Приложение</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Пользовательское соглашение</Text>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? colors.border : '#ccc'} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="star-outline" size={22} color={colors.textSecondary} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Оценить приложение</Text>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? colors.border : '#ccc'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: isDarkMode ? '#555' : '#ccc' }]}>Версия 1.0.4 (Build 605)</Text>
          <Image source={AppIcon} style={{ width: 64, height: 64, borderRadius: 16, marginTop: 16 }} />
        </View>
      </ScrollView>
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
  backBtn: {
    padding: 8,
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
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabelCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#ccc',
  },
});
