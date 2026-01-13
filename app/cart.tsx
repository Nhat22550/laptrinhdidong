import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../constants/firebaseConfig';
import { ref, onValue, remove, push, set } from 'firebase/database';

// --- 🎨 Màu sắc Minimalist ---
const Colors = {
  primary: '#059669',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  red: '#EF4444'
};

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lắng nghe dữ liệu giỏ hàng Realtime
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = ref(db, `carts/${user.uid}`);
    // onValue giúp cập nhật ngay lập tức khi có thay đổi (thêm/xóa)
    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map(key => ({
          id: key, // ID của đơn hàng trong giỏ
          ...data[key]
        }));
        setCartItems(items);
      } else {
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Tính tổng tiền
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [cartItems]);

  // 3. Xóa 1 món
  const handleDelete = (cartId: string) => {
    Alert.alert("Xóa món", "Bạn muốn bỏ món này?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: 'destructive',
        onPress: async () => {
          const user = auth.currentUser;
          if (user) {
            await remove(ref(db, `carts/${user.uid}/${cartId}`));
          }
        }
      }
    ]);
  };

  // 4. Chốt đơn (Checkout)
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      // a. Tạo đơn hàng mới trong nhánh 'orders'
      const orderRef = push(ref(db, 'orders'));
      await set(orderRef, {
        userId: user.uid,
        userName: user.displayName || "Khách hàng",
        items: cartItems,
        totalAmount: totalAmount,
        status: 'pending', // Trạng thái: Chờ xác nhận
        createdAt: new Date().toISOString()
      });

      // b. Xóa sạch giỏ hàng sau khi đặt xong
      await remove(ref(db, `carts/${user.uid}`));

      Alert.alert("Thành công! 🎉", "Đơn hàng của bạn đã được gửi đi.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.red} />
          </TouchableOpacity>
        </View>

        {/* Hiển thị Option (Size, Topping...) */}
        <Text style={styles.options}>
          Size {item.options?.size} • {item.options?.sugar} đường • {item.options?.ice} đá
        </Text>
        <Text style={styles.options} numberOfLines={1}>
          Topping: {item.options?.toppings}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.quantity}>x{item.quantity}</Text>
          <Text style={styles.price}>
            {Number(item.totalPrice).toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Giỏ hàng ({cartItems.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Giỏ hàng đang trống trơn...</Text>
          <TouchableOpacity style={styles.goHomeBtn} onPress={() => router.back()}>
            <Text style={styles.goHomeText}>Đi chọn món ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}

      {/* Footer Checkout */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Đặt hàng ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', marginTop: 30 },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
  info: { flex: 1, justifyContent: 'space-between' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
  options: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  quantity: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#059669' },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 30 },
  totalLabel: { fontSize: 12, color: '#6B7280' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#059669' },
  checkoutBtn: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
  goHomeBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E5E7EB', borderRadius: 20 },
  goHomeText: { fontWeight: '600', color: '#374151' }
});