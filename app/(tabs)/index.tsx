import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  FlatList, Image, Dimensions, TextInput, useColorScheme, StatusBar, Animated, Alert 
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/firebaseConfig'; 
import { ref, get, onValue, push, set } from 'firebase/database'; 
import { Ionicons } from '@expo/vector-icons'; 
import AuthScreen from '../../components/AuthScreen'; 

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; 
const BANNER_WIDTH = width - 32; 
const BANNER_HEIGHT = 150; 

const BANNERS = [
  { id: '1', image: 'https://img.pikbest.com/wp/202347/coffee-donut-bliss-a-cup-of-java-donuts-and-beans-in-3d_9763148.jpg!f305cw' },
  { id: '2', image: 'https://img.pikbest.com/backgrounds/20250808/sweet-indulgence-coffee-and-cake-in-perfect-harmony_11821993.jpg!f305cw' },
  { id: '3', image: 'https://img.pikbest.com/ai/illus_our/20230413/2f3244b708d5717167194778bc4bc7ae.jpg!f305cw' },
];

const Colors = {
  light: {
    background: '#F9FAFB', card: '#FFFFFF', text: '#1F2937', subText: '#6B7280',
    primary: '#059669', border: '#E5E7EB', input: '#F3F4F6', icon: '#4B5563',
    dot: '#D1D5DB', dotActive: '#059669'
  },
  dark: {
    background: '#111827', card: '#1F2937', text: '#F9FAFB', subText: '#9CA3AF',
    primary: '#10B981', border: '#374151', input: '#374151', icon: '#D1D5DB',
    dot: '#4B5563', dotActive: '#10B981'
  }
};

export default function HomeScreen() {
  const router = useRouter();
  
  // --- Theme Logic ---
  const systemTheme = useColorScheme(); 
  const [themeMode, setThemeMode] = useState(systemTheme || 'light'); 
  const isDark = themeMode === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(''); 
  const [loading, setLoading] = useState(true);
  
  const [cartCount, setCartCount] = useState(0); 

  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Logic Banner ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerRef.current) {
        let nextIndex = activeBanner + 1;
        if (nextIndex >= BANNERS.length) nextIndex = 0;
        try {
          bannerRef.current.scrollToIndex({ index: nextIndex, animated: true });
          setActiveBanner(nextIndex);
        } catch (e) { console.log("Banner scroll ignored"); }
      }
    }, 3000); 
    return () => clearInterval(interval);
  }, [activeBanner]);

  // --- Cart Realtime ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const cartRef = ref(db, `carts/${user.uid}`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) setCartCount(Object.keys(snapshot.val()).length);
      else setCartCount(0);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const catRef = ref(db, 'categories');
      const catSnap = await get(catRef);
      if (catSnap.exists()) {
        const catData = catSnap.val();
        setCategories(Object.keys(catData).map(key => ({ id: key, ...catData[key] })));
      }

      const productRef = ref(db, 'products');
      const productSnap = await get(productRef);
      if (productSnap.exists()) {
        const prodData = productSnap.val();
        setProducts(Object.keys(prodData).map(key => ({ id: key, ...prodData[key] })));
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    } catch (error) { console.log("Lỗi:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Quick Add ---
  const handleQuickAdd = async (item: any) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để mua hàng!");
      return;
    }
    try {
      const cartRef = ref(db, `carts/${user.uid}`);
      const newOrderRef = push(cartRef);
      await set(newOrderRef, {
        productId: item.id, name: item.name, image: item.image,
        price: Number(item.price), quantity: 1, totalPrice: Number(item.price),
        options: { size: 'S (Tiêu chuẩn)', sugar: '100%', ice: '100%', toppings: '' },
        timestamp: new Date().toISOString()
      });
      Alert.alert("Đã thêm! 🛒", `Đã thêm 1 ly ${item.name} vào giỏ.`);
    } catch (error) { Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng."); }
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchSearch = p.name ? p.name.toLowerCase().includes(searchText.toLowerCase()) : false;
    return matchCategory && matchSearch;
  });

  const AnimatedProductCard = ({ item }: { item: any }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity 
          style={[styles.productCard, { backgroundColor: theme.card }]}
          activeOpacity={0.9} onPressIn={onPressIn} onPressOut={onPressOut}
          onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id, ...item } })}
        >
          <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.productImage} resizeMode="cover" />
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.productPrice, { color: theme.primary }]}>
                {item.price ? Number(item.price).toLocaleString('vi-VN') : 0} đ
              </Text>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleQuickAdd(item)}
              >
                 <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const headerComponent = (
    <View>
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.greetingText, { color: theme.subText }]}>Chào buổi sáng,</Text>
          <Text style={[styles.brandName, { color: theme.text }]}>Nhật Coffee </Text>
        </View>
        
        {/* 👇 KHU VỰC CÁC NÚT (THEME + THÔNG BÁO) */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Nút 1: Đổi Theme */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            onPress={toggleTheme} 
          >
             <Ionicons 
               name={isDark ? "sunny" : "moon"} 
               size={24} 
               color={isDark ? "#FDB813" : theme.text} 
             />
          </TouchableOpacity>

          {/* Nút 2: Thông Báo (Mới thêm) */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/notifications')} 
          >
             <Ionicons name="notifications-outline" size={24} color={theme.text} />
             {/* Chấm đỏ báo hiệu có tin mới */}
             <View style={styles.redDot} />
          </TouchableOpacity>
        </View>
        {/* 👆 KẾT THÚC */}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.input }]}>
        <Ionicons name="search" size={20} color={theme.subText} style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Tìm kiếm món ngon..."
          placeholderTextColor={theme.subText}
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.bannerContainer}>
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          getItemLayout={(data, index) => ({
            length: BANNER_WIDTH,
            offset: BANNER_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              bannerRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
            setActiveBanner(index);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.bannerWrapper}>
              <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
        <View style={styles.pagination}>
          {BANNERS.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: activeBanner === index ? theme.dotActive : theme.dot }
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity 
                style={[
                  styles.catItem, 
                  { 
                    backgroundColor: isActive ? theme.primary : theme.card,
                    borderColor: isActive ? theme.primary : theme.border
                  }
                ]}
                onPress={() => setSelectedCategory(isActive ? null : item.id)}
              >
                <Text style={[
                  styles.catText, 
                  { color: isActive ? '#fff' : theme.text, fontWeight: isActive ? '700' : '500' }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
      
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Gợi ý cho bạn</Text>
    </View>
  );

  if (loading) return (
    <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
  if (!auth.currentUser) return <AuthScreen onAuthenticated={fetchData} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      <Animated.FlatList
        data={filteredProducts}
        renderItem={({ item }) => <AnimatedProductCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        style={{ opacity: fadeAnim }}
      />

      <TouchableOpacity 
        style={styles.floatingCartBtn}
        onPress={() => router.push('/cart')} 
      >
        <Ionicons name="cart" size={28} color="white" />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 24, paddingBottom: 100 }, 
  
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  greetingText: { fontSize: 14, marginBottom: 4 },
  brandName: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  iconButton: { padding: 10, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  redDot: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: 'white' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 24 },
  searchInput: { flex: 1, fontSize: 16, height: '100%', fontWeight: '500' },

  bannerContainer: { marginBottom: 24, alignItems: 'center' },
  bannerWrapper: { width: BANNER_WIDTH, height: BANNER_HEIGHT, marginRight: 0 }, 
  bannerImage: { width: '100%', height: '100%', borderRadius: 16 },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },

  catItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12, borderWidth: 1 },
  catText: { fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },

  productCard: { 
    width: COLUMN_WIDTH, borderRadius: 20, marginBottom: 20, padding: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 
  },
  productImage: { width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 12 },
  productInfo: { paddingHorizontal: 4 },
  productName: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 15, fontWeight: 'bold' },
  addBtn: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  floatingCartBtn: {
    position: 'absolute', bottom: 20, right: 20, width: 60, height: 60,
    borderRadius: 30, backgroundColor: '#059669', 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, zIndex: 999
  },
  badge: {
    position: 'absolute', top: -5, right: -5, backgroundColor: 'red',
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white'
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});