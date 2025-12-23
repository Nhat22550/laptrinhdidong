import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  Alert, FlatList, Image, Dimensions 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../constants/firebaseConfig'; 
import { ref, get } from 'firebase/database';
import AuthScreen from '../../components/AuthScreen'; 

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; 

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const productRef = ref(db, 'products');
      const productSnap = await get(productRef);
      if (productSnap.exists()) {
        const data = productSnap.val();
        const productArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productArray);
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

  // --- Render Item ---
  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price?.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity 
          style={styles.addToCartBtn}
          onPress={() => Alert.alert("Đã thêm vào giỏ!")}
        >
          <Text style={styles.addToCartText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} />;
  
  // Nếu chưa đăng nhập thì hiện AuthScreen
  if (!auth.currentUser) return <AuthScreen onAuthenticated={fetchData} />;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Menu Hôm Nay ☕️</Text>
      <FlatList
        data={products}
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
  listContent: { padding: 16 },
  productCard: { width: COLUMN_WIDTH, backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 3, paddingBottom: 10 },
  productImage: { width: '100%', height: 140, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  productInfo: { padding: 8 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productPrice: { fontSize: 14, color: '#e67e22', fontWeight: 'bold', marginVertical: 4 },
  addToCartBtn: { backgroundColor: '#00b894', padding: 8, borderRadius: 6, alignItems: 'center' },
  addToCartText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});