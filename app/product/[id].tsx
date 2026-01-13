import { 
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, Animated 
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../constants/firebaseConfig';
import { ref, push, set } from 'firebase/database';

// --- 🎨 Cấu hình Màu sắc (Minimalism) ---
const Colors = {
  primary: '#059669', // Xanh Emerald
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  border: '#E5E7EB',
  activeChip: '#ECFDF5', // Màu nền nhạt khi chọn
};

// --- 🛠 Dữ liệu Tùy chọn (Hardcode mẫu) ---
const SIZES = [
  { id: 'S', name: 'Nhỏ', price: 0 },
  { id: 'M', name: 'Vừa', price: 5000 },
  { id: 'L', name: 'Lớn', price: 10000 },
];

const SUGAR_LEVELS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_LEVELS = ['0%', '50%', '100%', 'Nóng'];

const TOPPINGS = [
  { id: '1', name: 'Trân châu đen', price: 5000 },
  { id: '2', name: 'Thạch vải', price: 5000 },
  { id: '3', name: 'Kem cheese', price: 10000 },
  { id: '4', name: 'Pudding trứng', price: 8000 },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Lấy dữ liệu từ params (đảm bảo price là số)
  const basePrice = Number(params.price) || 0;
  const { id, name, image, description } = params;

  // --- STATE QUẢN LÝ LỰA CHỌN ---
  const [size, setSize] = useState(SIZES[0]); // Mặc định size S
  const [sugar, setSugar] = useState('100%');
  const [ice, setIce] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]); // Lưu ID topping
  const [quantity, setQuantity] = useState(1);

  // --- 🧮 TÍNH TỔNG TIỀN TỰ ĐỘNG ---
  // Dùng useMemo để tự tính lại mỗi khi user thay đổi lựa chọn
  const totalPrice = useMemo(() => {
    let total = basePrice + size.price; // Giá gốc + Giá size
    
    // Cộng tiền Topping
    selectedToppings.forEach(toppingId => {
      const topping = TOPPINGS.find(t => t.id === toppingId);
      if (topping) total += topping.price;
    });

    return total * quantity;
  }, [basePrice, size, selectedToppings, quantity]);

  // Logic chọn Topping (Chọn nhiều)
  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.includes(toppingId)) {
      setSelectedToppings(prev => prev.filter(id => id !== toppingId)); // Bỏ chọn
    } else {
      setSelectedToppings(prev => [...prev, toppingId]); // Chọn thêm
    }
  };

  // Logic Thêm vào giỏ hàng (API POST)
  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để đặt hàng!");
      return;
    }

    try {
      const cartRef = ref(db, `carts/${user.uid}`);
      const newOrderRef = push(cartRef);
      
      // Lấy tên các topping đã chọn để lưu vào DB cho dễ đọc
      const toppingNames = selectedToppings.map(id => TOPPINGS.find(t => t.id === id)?.name).join(', ');

      await set(newOrderRef, {
        productId: id,
        name: name,
        image: image,
        price: totalPrice / quantity, // Lưu giá đơn vị (đã cộng topping/size)
        quantity: quantity,
        totalPrice: totalPrice,
        options: {
          size: size.name,
          sugar: sugar,
          ice: ice,
          toppings: toppingNames || 'Không'
        },
        timestamp: new Date().toISOString()
      });

      Alert.alert("Thành công", "Đã thêm vào giỏ hàng!", [
        { text: "Ở lại", style: "cancel" },
        { text: "Về trang chủ", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
    }
  };

  // --- Component con: Nút tăng giảm số lượng ---
  const QuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <TouchableOpacity 
        onPress={() => quantity > 1 && setQuantity(q => q - 1)}
        style={styles.quantityBtn}
      >
        <Ionicons name="remove" size={20} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.quantityText}>{quantity}</Text>
      <TouchableOpacity 
        onPress={() => setQuantity(q => q + 1)}
        style={styles.quantityBtn}
      >
        <Ionicons name="add" size={20} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Chi tiết món ăn", // Đổi tên tiếng Việt ở đây
          headerTitleAlign: 'center', // Căn giữa tiêu đề
          
          headerTintColor: '#000', // Màu nút back
          // Nếu bạn muốn ẩn luôn thanh trắng đi để ảnh tràn lên (đẹp hơn):
          // headerShown: false 
        }} 
      />
      <StatusBar barStyle="light-content" />
      
      {/* 1. Nút Back (Tuyệt đối trên cùng) */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* 2. Ảnh món ăn (Full Width) */}
        <Image 
          source={{ uri: (image as string) || 'https://via.placeholder.com/300' }} 
          style={styles.heroImage} 
        />

        {/* 3. Nội dung chính (Bo tròn đè lên ảnh) */}
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <Text style={styles.productName}>{name}</Text>
            <Text style={styles.basePrice}>{basePrice.toLocaleString('vi-VN')} đ</Text>
          </View>
          <Text style={styles.description}>
            {description ? description : "Hương vị đậm đà, được pha chế từ những nguyên liệu tươi ngon nhất."}
          </Text>

          <View style={styles.divider} />

          {/* --- CHỌN SIZE --- */}
          <Text style={styles.sectionTitle}>Chọn Size</Text>
          <View style={styles.optionsWrap}>
            {SIZES.map((s) => (
              <TouchableOpacity 
                key={s.id} 
                style={[styles.chip, size.id === s.id && styles.chipActive]}
                onPress={() => setSize(s)}
              >
                <Text style={[styles.chipText, size.id === s.id && styles.chipTextActive]}>
                  Size {s.name} {s.price > 0 ? `(+${s.price/1000}k)` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- CHỌN ĐƯỜNG (Sugar) --- */}
          <Text style={styles.sectionTitle}>Độ ngọt</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUGAR_LEVELS.map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[styles.chip, sugar === level && styles.chipActive]}
                onPress={() => setSugar(level)}
              >
                <Text style={[styles.chipText, sugar === level && styles.chipTextActive]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* --- CHỌN ĐÁ (Ice) --- */}
          <Text style={styles.sectionTitle}>Lượng đá</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ICE_LEVELS.map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[styles.chip, ice === level && styles.chipActive]}
                onPress={() => setIce(level)}
              >
                <Text style={[styles.chipText, ice === level && styles.chipTextActive]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* --- CHỌN TOPPING --- */}
          <Text style={styles.sectionTitle}>Thêm Topping</Text>
          <View style={styles.toppingList}>
            {TOPPINGS.map((t) => {
              const isSelected = selectedToppings.includes(t.id);
              return (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.toppingItem, isSelected && styles.toppingItemActive]}
                  onPress={() => toggleTopping(t.id)}
                >
                  <Text style={[styles.toppingText, isSelected && styles.toppingTextActive]}>{t.name}</Text>
                  <Text style={[styles.toppingPrice, isSelected && styles.toppingTextActive]}>+{t.price.toLocaleString()}đ</Text>
                </TouchableOpacity>
              )
            })}
          </View>

        </View>
      </ScrollView>

      {/* 4. THANH ĐẶT HÀNG (Sticky Bottom) */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
        </View>

        <View style={styles.bottomRight}>
          <QuantitySelector />
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Back Button
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },
  
  // Hero Image
  heroImage: { width: '100%', height: 350, resizeMode: 'cover' },
  
  // Content Card (Bo tròn đè lên ảnh)
  contentCard: { 
    flex: 1, backgroundColor: 'white', marginTop: -40, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 
  },
  
  // Header Info
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 24, fontWeight: 'bold', color: Colors.text, flex: 1 },
  basePrice: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  description: { fontSize: 14, color: Colors.subText, lineHeight: 22 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },

  // Sections
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12, marginTop: 8 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  
  // Chip Styles (Size/Sugar/Ice)
  chip: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    borderWidth: 1, borderColor: Colors.border, backgroundColor: 'white', marginRight: 10, marginBottom: 10 
  },
  chipActive: { backgroundColor: Colors.activeChip, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.subText, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },

  // Topping List Style
  toppingList: { flexDirection: 'column', gap: 10 },
  toppingItem: { 
    flexDirection: 'row', justifyContent: 'space-between', padding: 12, 
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'white' 
  },
  toppingItemActive: { backgroundColor: Colors.activeChip, borderColor: Colors.primary },
  toppingText: { fontSize: 14, color: Colors.text },
  toppingPrice: { fontSize: 14, fontWeight: '600', color: Colors.text },
  toppingTextActive: { color: Colors.primary, fontWeight: '600' },

  // Bottom Bar
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', padding: 16, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: Colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10
  },
  bottomLeft: { flexDirection: 'column' },
  totalLabel: { fontSize: 12, color: Colors.subText },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  
  bottomRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 4 },
  quantityBtn: { padding: 8 },
  quantityText: { fontSize: 16, fontWeight: '600', marginHorizontal: 8 },
  
  addToCartBtn: { 
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  addToCartText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});