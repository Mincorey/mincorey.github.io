import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PaymentScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const email = route.params?.email || '';

  const injectLogic = `
    (function() {
      const email = "${email}";
      
      // Функция для заполнения
      function forceFill() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(el => {
          // Ищем ТОЛЬКО поле Никнейм по указанию пользователя
          if ((el.placeholder && (
                el.placeholder.toLowerCase().includes('имя') || 
                el.placeholder.toLowerCase().includes('ник')
              )) || 
              (el.name === 'nickname')) {
            
            // Вставляем текст
            el.value = email;
            
            // Имитируем реальные действия пользователя, чтобы сайт "проснулся"
            el.dispatchEvent(new Event('focus', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
          }
        });
      }

      // Запускаем проверку каждые 500мс в течение 10 секунд
      let attempts = 0;
      const interval = setInterval(() => {
        forceFill();
        attempts++;
        if (attempts > 20) clearInterval(interval);
      }, 500);
    })();
    true;
  `;

  // Оставим передачу email через URL, так как она не мешает и работает как страховка
  const paymentUrl = `https://donate.stream/apsny-nedviga?nickname=${encodeURIComponent(email)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Пополнение баланса</Text>
        <View style={{ width: 42 }} />
      </View>
      <WebView
        source={{ uri: paymentUrl }}
        injectedJavaScript={injectLogic}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});
