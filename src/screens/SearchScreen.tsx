import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Modal,
  Image,
  StatusBar as RNStatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const { width, height } = Dimensions.get('window');

const LOCATIONS: Record<string, string[]> = {
  'Любой район': ['Любой город'],
  'Гагрский': ['Любой город', 'Гагра', 'Пицунда', 'Другой населенный пункт...'],
  'Гудаутский': ['Любой город', 'Гудаута', 'Новый Афон', 'Другой населенный пункт...'],
  'Сухумский': ['Любой город', 'Сухум', 'Другой населенный пункт...'],
  'Гулрыпшский': ['Любой город', 'Гулрыпш', 'Агудзера', 'Другой населенный пункт...'],
  'Очамчырский': ['Любой город', 'Очамчыра', 'Другой населенный пункт...'],
  'Ткуарчалский': ['Любой город', 'Ткуарчал', 'Другой населенный пункт...'],
  'Галский': ['Любой город', 'Гал', 'Другой населенный пункт...'],
};

const QUICK_FILTERS = ['Все', 'Купить', 'Продать', 'Аренда'];

const SelectionModal = ({ visible, onClose, data, onSelect, title }: any) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
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
                <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#333' : '#eee'} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function SearchScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { userAvatar } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dealType, setDealType] = useState('Все');
  const [district, setDistrict] = useState('Любой район');
  const [city, setCity] = useState('Любой город');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Modal visibility states
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [isCityModalVisible, setCityModalVisible] = useState(false);

  const handleDistrictSelect = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setCity('Любой город');
    setDistrictModalVisible(false);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    if (selectedCity !== 'Другой населенный пункт...') {
      setCustomCity('');
    }
    setCityModalVisible(false);
  };

  const handleSearch = () => {
    navigation.navigate('SearchResults', { 
      filters: { 
        searchQuery: searchQuery?.trim(), 
        dealType, 
        district, 
        city, 
        customCity: customCity?.trim(),
        priceFrom, 
        priceTo 
      } 
    });
  };

  React.useEffect(() => {
    RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }} 
        />
        <Text style={[styles.headerTitle, { color: colors.primary, marginLeft: 8 }]}>APSNY-NEDVIGA</Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => navigation.navigate('ProfileTab')}
      >
        <UserAvatar 
          url={userAvatar} 
          size={42} 
          fallbackName="Пользователь" 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderHeader()}

        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Поиск по объявлениям</Text>
          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            Найдите идеальную недвижимость в Абхазии среди сотен актуальных предложений.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Улица, город или ЖК..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
            />
          </View>
        </View>

        <View style={styles.quickFilterSection}>
          <View style={styles.filterRowStatic}>
            {QUICK_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setDealType(filter)}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface },
                  dealType === filter && [styles.filterButtonActive, { backgroundColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textSecondary },
                    dealType === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.detailedFilterSection}>
          <View style={[styles.filterBlock, { backgroundColor: isDarkMode ? colors.card : '#f8f8f8' }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>РАЙОН</Text>
            <TouchableOpacity 
              style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>{district}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.filterLabel, { color: colors.text }]}>ГОРОД</Text>
            <TouchableOpacity 
              style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setCityModalVisible(true)}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>{city}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {city === 'Другой населенный пункт...' && (
              <View style={[styles.customInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.customInput, { color: colors.text }]}
                  placeholder="Введите название населенного пункта"
                  value={customCity}
                  onChangeText={setCustomCity}
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
              </View>
            )}

            <Text style={[styles.filterLabel, { color: colors.text }]}>ДИАПАЗОН ЦЕН (₽)</Text>
            <View style={styles.priceRangeWrapper}>
              <View style={[styles.priceInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={styles.pricePrefix}>От</Text>
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDarkMode ? '#555' : '#ccc'}
                  value={priceFrom}
                  onChangeText={setPriceFrom}
                />
              </View>
              <View style={[styles.priceSeparator, { backgroundColor: colors.border }]} />
              <View style={[styles.priceInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={styles.pricePrefix}>До</Text>
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  placeholder="Цена до..."
                  keyboardType="numeric"
                  placeholderTextColor={isDarkMode ? '#555' : '#ccc'}
                  value={priceTo}
                  onChangeText={setPriceTo}
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.findButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.findButtonText}>Найти</Text>
        </TouchableOpacity>
      </ScrollView>

      <SelectionModal 
        visible={isDistrictModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        data={Object.keys(LOCATIONS)}
        onSelect={handleDistrictSelect}
        title="Выберите район"
      />

      <SelectionModal 
        visible={isCityModalVisible}
        onClose={() => setCityModalVisible(false)}
        data={LOCATIONS[district] || []}
        onSelect={handleCitySelect}
        title="Выберите город"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  quickFilterSection: {
    marginBottom: 24,
  },
  filterRowStatic: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0047AB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  detailedFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterBlock: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 20,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  priceRangeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pricePrefix: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  priceSeparator: {
    width: 15,
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  findButton: {
    flexDirection: 'row',
    backgroundColor: '#0047AB',
    marginHorizontal: 20,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.7,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    padding: 20,
    paddingHorizontal: 24,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 24,
  },
  customInputWrapper: {
    marginTop: -8,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  customInput: {
    fontSize: 14,
    color: '#333',
  },
});
