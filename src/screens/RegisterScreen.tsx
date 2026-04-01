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
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
import { StatusBar as RNStatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showCustomAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handlePhoneChange = (text: string) => {
    let unmasked = text.replace(/\D/g, '');
    if (unmasked.startsWith('7')) {
      unmasked = unmasked.substring(1);
    }
    
    if (unmasked.length === 0 && text.length > 0) {
      setPhone('');
      return;
    }
    
    let formatted = '+7 ';
    if (unmasked.length > 0) {
      formatted += `(${unmasked.substring(0, 3)}`;
    }
    if (unmasked.length >= 4) {
      formatted += `) ${unmasked.substring(3, 6)}`;
    }
    if (unmasked.length >= 7) {
      formatted += `-${unmasked.substring(6, 8)}`;
    }
    if (unmasked.length >= 9) {
      formatted += `-${unmasked.substring(8, 10)}`;
    }
    
    setPhone(formatted);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordMismatchError(false);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setPasswordMismatchError(false);
  };

  async function handleRegister() {
    if (!email || !phone || !password || !confirmPassword) {
      showCustomAlert('Ошибка', 'Пожалуйста, заполните все поля для регистрации');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatchError(true);
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          phone: phone,
        }
      }
    });

    if (error) {
      showCustomAlert('Ошибка регистрации', error.message);
    } else if (!session) {
      showCustomAlert('Успех', 'Пожалуйста, проверьте вашу почту для подтверждения регистрации');
    }
    setLoading(false);
  }

  React.useEffect(() => {
    RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(isDarkMode ? colors.background : '#f5f5f5');
    }
  }, [isDarkMode, colors.background]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#fff' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        contentContainerStyle={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { backgroundColor: isDarkMode ? colors.background : '#f5f5f5' }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card }]} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>APSNY-NEDVIGA</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Создайте аккаунт, чтобы сохранять объявления и связываться с владельцами.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>E-MAIL АДРЕС</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="example@mail.ru"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                />
                <Ionicons name="mail-outline" size={20} color={isDarkMode ? '#555' : '#999'} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>НОМЕР ТЕЛЕФОНА</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+7 (940) 123-45-67"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                  onFocus={() => {
                    if (!phone) setPhone('+7 ');
                  }}
                />
                <Ionicons name="call-outline" size={20} color={isDarkMode ? '#555' : '#999'} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>ПАРОЛЬ</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                />
                <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#555' : '#999'} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>ПОВТОРИТЕ ПАРОЛЬ</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                />
                <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#555' : '#999'} style={styles.inputIcon} />
              </View>
              {passwordMismatchError && <Text style={{ color: 'red', marginTop: 4, marginLeft: 4, fontSize: 12 }}>Пароли не совпадают</Text>}
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
                  <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchScreenBtn} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.switchScreenText, { color: colors.primary }]}>Уже есть аккаунт? Войти</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Нажимая кнопку, вы соглашаетесь с нашей Политикой конфиденциальности и Условиями использования сервиса.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryBtnText="OK"
        primaryBtnAction={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 10,
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
    backgroundColor: '#f0f0f0',
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
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
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
  switchScreenBtn: {
    marginTop: 20,
    padding: 10,
  },
  switchScreenText: {
    color: '#0047AB',
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
