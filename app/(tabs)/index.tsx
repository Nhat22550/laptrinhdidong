import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  FlatList, Image, Dimensions, TextInput 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/firebaseConfig'; 
import { ref, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; // Import Icon kính lúp
import AuthScreen from '../../components/AuthScreen'; 

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; 

export default function HomeScreen() {
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // 👇 State cho ô tìm kiếm
  const [searchText, setSearchText] = useState(''); 
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Data (Giữ nguyên) ---
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
    } catch (error) {
      console.log("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Logic Lọc Kép (Category + Search) ---
  const filteredProducts = products.filter(p => {
    // Điều kiện 1: Phải khớp Category (nếu đang chọn)
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    
    // Điều kiện 2: Phải khớp từ khóa tìm kiếm (không phân biệt hoa thường)
    const matchSearch = p.name 
      ? p.name.toLowerCase().includes(searchText.toLowerCase()) 
      : false;

    return matchCategory && matchSearch;
  });

  // --- Giao diện Item ---
  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.catItem, 
        selectedCategory === item.id && styles.catItemActive
      ]}
      onPress={() => setSelectedCategory(item.id === selectedCategory ? null : item.id)}
    >
      <Image 
        source={{ uri: item.image || 'https://cdn-icons-png.flaticon.com/512/751/751621.png' }} 
        style={styles.catIcon} 
      />
      <Text style={[styles.catText, selectedCategory === item.id && styles.catTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.addBtn}>
           <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // --- 3. Phần Header (Logo + Search + Categories) ---
  // Mình tách ra thành component con để nhét vào FlatList cho trôi mượt
  const ListHeader =  (
    <View>
      {/* HEADER: Logo + Tên Quán */}
      <View style={styles.headerContainer}>
        <View style={styles.logoRow}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2935/2935413.png' }} // Link Logo mẫu
            style={styles.logo} 
          />
          <View>
            <Text style={styles.brandName}>Nhật Coffee</Text>
            <Text style={styles.brandSlogan}>Đậm đà hương vị Việt</Text>
          </View>
        </View>
        <TouchableOpacity>
           <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Bạn muốn uống gì hôm nay?..."
          value={searchText}
          onChangeText={setSearchText} // Cập nhật text khi gõ
          clearButtonMode="while-editing"
        />
      </View>

      {/* CATEGORIES */}
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      />
      
      <Text style={styles.sectionTitle}>Menu Món Ngon ☕️</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} />;
  if (!auth.currentUser) return <AuthScreen onAuthenticated={fetchData} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader} // Gắn phần Header vào đây
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 16, paddingBottom: 80 }, // Padding đáy để không bị che bởi tab bar
  
  // Header Styles
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, marginTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 10 },
  brandName: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
  brandSlogan: { fontSize: 12, color: '#636e72' },

  // Search Bar Styles
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, height: 50, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },

  // Category Styles
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436', marginBottom: 10, paddingHorizontal: 5 },
  catItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'white', borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  catItemActive: { backgroundColor: '#00b894', borderColor: '#00b894' },
  catIcon: { width: 20, height: 20, marginRight: 5 },
  catText: { fontWeight: '600', color: '#666' },
  catTextActive: { color: 'white' },

  // Product Styles
  productCard: { width: COLUMN_WIDTH, backgroundColor: 'white', borderRadius: 16, marginBottom: 16, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { width: '100%', aspectRatio: 1, borderRadius: 12, marginBottom: 8 },
  productInfo: { paddingHorizontal: 4 },
  productName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  productPrice: { fontSize: 14, color: '#e67e22', fontWeight: 'bold' },
  addBtn: { position: 'absolute', right: 0, bottom: -4, backgroundColor: '#00b894', borderRadius: 20, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }
});