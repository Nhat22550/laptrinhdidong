import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  // Lấy dữ liệu được gửi sang từ trang Home
  const params = useLocalSearchParams();
  const { name, price, image, description } = params;

  return (
    <View style={styles.container}>
      {/* Cấu hình nút Back và tiêu đề trong suốt */}
      <Stack.Screen 
        options={{
          headerTitle: "", 
          headerTransparent: true, 
          headerTintColor: 'white', // Nút back màu trắng để nổi trên ảnh
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ảnh sản phẩm to đẹp */}
        <Image 
          source={{ uri: (image as string) || 'https://via.placeholder.com/300' }} 
          style={styles.image} 
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>
            {price ? Number(price).toLocaleString('vi-VN') : 0} đ
          </Text>
          
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {description ? description : "Món ngon tuyệt vời, được pha chế từ những nguyên liệu tươi ngon nhất. Hãy thử và cảm nhận sự khác biệt!"}
          </Text>
        </View>
      </ScrollView>

      {/* Thanh đặt hàng dính ở đáy */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => Alert.alert("Thông báo", "Chức năng Giỏ hàng sẽ được cập nhật sau!")}
        >
          <Ionicons name="cart-outline" size={28} color="#00b894" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => Alert.alert("Tuyệt vời", `Đã thêm ${name} vào giỏ hàng!`)}
        >
          <Text style={styles.buyText}>
            Thêm vào giỏ - {price ? Number(price).toLocaleString('vi-VN') : 0} đ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { paddingBottom: 100 }, // Để nội dung không bị nút che mất
  image: { width: '100%', height: 350 },
  
  contentContainer: { 
    padding: 20, 
    marginTop: -20, 
    backgroundColor: 'white', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25 
  },
  
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 22, color: '#e67e22', fontWeight: 'bold', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', lineHeight: 24 },
  
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', padding: 20, backgroundColor: 'white', 
    borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' 
  },
  cartButton: { 
    width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#eee', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  buyButton: { 
    flex: 1, backgroundColor: '#00b894', height: 50, borderRadius: 25, 
    justifyContent: 'center', alignItems: 'center', 
    shadowColor: "#00b894", shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5
  },
  buyText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});