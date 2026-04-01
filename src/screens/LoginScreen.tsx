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
import { Modal, StatusBar as RNStatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  async function handleResetPassword() {
    if (!resetEmail) {
      setAlertConfig({ title: 'Внимание', message: 'Пожалуйста, введите e-mail' });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'abkhazia-realty://reset-password',
    });

    setLoading(false);
    if (error) {
      setAlertConfig({ title: 'Ошибка', message: error.message });
      setAlertVisible(true);
    } else {
      setForgotPasswordVisible(false);
      setAlertConfig({ 
        title: 'Инструкции отправлены', 
        message: 'Инструкции по сбросу пароля отправлены на вашу почту.' 
      });
      setAlertVisible(true);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, введите e-mail и пароль');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Ошибка входа', error.message);
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
              Добро пожаловать! Войдите в аккаунт, чтобы управлять своими объявлениями и избранным.
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
              <Text style={[styles.inputLabel, { color: colors.text }]}>ПАРОЛЬ</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surface : '#f0f0f0', borderWidth: 1, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={isDarkMode ? '#555' : '#999'}
                />
                <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#555' : '#999'} style={styles.inputIcon} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>ВОЙТИ</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchScreenBtn} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.switchScreenText, { color: colors.textSecondary }]}>Нет аккаунта? <Text style={{ color: colors.primary, fontWeight: '700' }}>Создать</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotPasswordBtn} 
              onPress={() => setForgotPasswordVisible(true)}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Забыли пароль?</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Нажимая кнопку «Войти», вы соглашаетесь с нашей Политикой конфиденциальности и Условиями использования сервиса.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={forgotPasswordVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Сброс пароля</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Введите ваш e-mail, чтобы получить ссылку для восстановления доступа.</Text>
            
            <View style={[styles.modalInputContainer, { backgroundColor: isDarkMode ? colors.surface : '#f5f5f5', borderColor: colors.border }]}>
              <TextInput
                style={[styles.modalInput, { color: colors.text }]}
                placeholder="example@mail.ru"
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={isDarkMode ? '#555' : '#999'}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalCancelBtn, { backgroundColor: isDarkMode ? colors.surface : '#f5f5f5' }]} 
                onPress={() => setForgotPasswordVisible(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalConfirmBtn, { backgroundColor: colors.primary }]} 
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmBtnText}>Отправить</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    padding: 8,
  },
  switchScreenText: {
    fontSize: 15,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 16,
  },
  forgotPasswordBtn: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#0047AB',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  modalConfirmBtn: {
    backgroundColor: '#0047AB',
  },
  modalCancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalConfirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
