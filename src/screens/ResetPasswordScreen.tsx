import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';

export default function ResetPasswordScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', success: false });

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setAlertConfig({ title: 'Внимание', message: 'Пожалуйста, заполните все поля', success: false });
      setAlertVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({ title: 'Ошибка', message: 'Пароли не совпадают', success: false });
      setAlertVisible(true);
      return;
    }

    if (newPassword.length < 6) {
      setAlertConfig({ title: 'Ошибка', message: 'Минимальная длина пароля - 6 символов', success: false });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setAlertConfig({ title: 'Ошибка', message: error.message, success: false });
      setAlertVisible(true);
    } else {
      setAlertConfig({ 
        title: 'Пароль обновлен!', 
        message: 'Вы успешно сменили пароль. Теперь вы можете войти в аккаунт.', 
        success: true 
      });
      setAlertVisible(true);
    }
  };

  React.useEffect(() => {
    RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.surface : '#f0f7ff' }]}>
              <Ionicons name="lock-open-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Новый пароль</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Введите и подтвердите ваш новый пароль для доступа к аккаунту.</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>НОВЫЙ ПАРОЛЬ</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>ПОДТВЕРДИТЕ ПАРОЛЬ</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <Ionicons name="shield-checkmark-outline" size={20} color="#999" style={styles.inputIcon} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>ОБНОВИТЬ ПАРОЛЬ</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText="OK"
        primaryBtnAction={() => {
          setAlertVisible(false);
          if (alertConfig.success) {
            navigation.navigate('Login');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginLeft: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#0047AB',
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
