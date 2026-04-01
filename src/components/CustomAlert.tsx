import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  primaryBtnText: string;
  primaryBtnAction: () => void;
  secondaryBtnText?: string;
  secondaryBtnAction?: () => void;
  icon?: React.ReactNode;
}

const CustomAlert = ({
  visible,
  title,
  message,
  primaryBtnText,
  primaryBtnAction,
  secondaryBtnText,
  secondaryBtnAction,
  icon,
}: CustomAlertProps) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
          {title === 'Пополнение баланса' && (
            <Ionicons name="warning" size={44} color="#FFA500" style={{ alignSelf: 'center', marginBottom: 12 }} />
          )}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          
          <View style={styles.btnRow}>
            {secondaryBtnText && (
              <TouchableOpacity 
                style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                onPress={secondaryBtnAction}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>{secondaryBtnText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.primaryBtn, 
                { backgroundColor: colors.primary },
                title === 'Выход' && { backgroundColor: '#FF3B30' }
              ]} 
              onPress={primaryBtnAction}
            >
              <Text style={styles.primaryBtnText}>{primaryBtnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0047AB',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  secondaryBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
