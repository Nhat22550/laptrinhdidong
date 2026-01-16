import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter,Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../constants/firebaseConfig';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Lấy danh sách đơn hàng của User hiện tại từ Firebase
    const ordersRef = ref(db, 'orders');
    const q = query(ordersRef, orderByChild('userId'), equalTo(user.uid));

    const unsubscribe = onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Chuyển đổi object thành mảng và sắp xếp (Mới nhất lên đầu)
        const loadedOrders = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(loadedOrders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm hiển thị màu sắc trạng thái
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Đang xử lý': return '#F59E0B'; // Vàng cam
      case 'Đang chờ xác nhận': return '#3B82F6'; // Xanh dương
      case 'Hoàn thành': return '#10B981'; // Xanh lá
      case 'Đã hủy': return '#EF4444'; // Đỏ
      default: return '#6B7280'; // Xám
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderCode}>{item.orderCode || 'Mã đơn lỗi'}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
      
      <Text style={styles.date}>Ngày đặt: {new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
      <View style={styles.divider} />
      
      {/* Hiển thị tóm tắt món ăn (Lấy món đầu tiên + số lượng còn lại) */}
      <Text style={styles.itemsText} numberOfLines={1}>
        {item.items && item.items.length > 0 
          ? `${item.items[0].name} ${item.items.length > 1 ? `và ${item.items.length - 1} món khác` : ''}`
          : 'Không có thông tin món'}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
        <Text style={styles.totalPrice}>{Number(item.totalAmount).toLocaleString('vi-VN')} đ</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử đơn hàng</Text>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#059669" style={{marginTop: 50}}/>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <Text style={{color: 'gray', marginTop: 10}}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList 
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', marginTop: 30 },
  title: { fontSize: 18, fontWeight: 'bold' },
  
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderCode: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  status: { fontWeight: '600', fontSize: 14 },
  date: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  itemsText: { fontSize: 14, color: '#374151', marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentMethod: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }
});