import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  FlatList, Image, Dimensions, ScrollView 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/firebaseConfig'; 
import { ref, get } from 'firebase/database';
import AuthScreen from '../../components/AuthScreen'; 

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; 

export default function HomeScreen() {
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // <--- Mới thêm
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Để lọc món
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Lấy Categories
      const catRef = ref(db, 'categories');
      const catSnap = await get(catRef);
      if (catSnap.exists()) {
        const catData = catSnap.val();
        setCategories(Object.keys(catData).map(key => ({ id: key, ...catData[key] })));
      }

      // 2. Lấy Products
      const productRef = ref(db, 'products');
      const productSnap = await get(productRef);
      if (productSnap.exists()) {
        const prodData = productSnap.val();
        setProducts(Object.keys(prodData).map(key => ({ id: key, ...prodData[key] })));
      }
    } catch (error) {
      console.log("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Logic Lọc món ăn ---
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory) // Chỉ hiện món thuộc danh mục chọn
    : products; // Nếu chưa chọn gì thì hiện tất cả

  // --- Giao diện 1 mục Category ---
  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.catItem, 
        selectedCategory === item.id && styles.catItemActive // Đổi màu nếu đang chọn
      ]}
      onPress={() => setSelectedCategory(item.id === selectedCategory ? null : item.id)} // Bấm lần 2 để bỏ chọn
    >
      <Text style={[
        styles.catText,
        selectedCategory === item.id && styles.catTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // --- Giao diện 1 món ăn ---
  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id, ...item }
        });
      }}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {item.price ? Number(item.price).toLocaleString('vi-VN') : 0} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} />;
  if (!auth.currentUser) return <AuthScreen onAuthenticated={fetchData} />;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Menu Hôm Nay ☕️</Text>

      {/* Danh sách Category nằm ngang */}
      <View style={{ marginBottom: 10 }}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal={true} // Lướt ngang
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Danh sách món ăn (đã lọc) */}
      <FlatList
        data={filteredProducts} // Dùng danh sách đã lọc
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 16, marginBottom: 10, color: '#2d3436' },
  
  // Style cho Category
  catItem: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', 
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#eee'
  },
  catItemActive: { backgroundColor: '#00b894', borderColor: '#00b894' },
  catText: { fontWeight: '600', color: '#666' },
  catTextActive: { color: 'white' },

  // Style cho Product (như cũ)
  listContent: { padding: 16 },
  productCard: { width: COLUMN_WIDTH, backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 3, paddingBottom: 10 },
  productImage: { width: '100%', aspectRatio: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  productInfo: { padding: 8 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productPrice: { fontSize: 14, color: '#e67e22', fontWeight: 'bold', marginVertical: 4 },
});