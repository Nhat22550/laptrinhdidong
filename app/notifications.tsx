import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Coffee, Gift, Info } from 'lucide-react-native'; // Cần cài: npx expo install lucide-react-native
import { auth, db } from '../constants/firebaseConfig';
import { ref, onValue, query, orderByChild } from 'firebase/database';

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Lắng nghe nhánh notifications của user hiện tại
    const notiRef = ref(db, `notifications/${user.uid}`);
    
    // Sắp xếp (Tuy nhiên Firebase sort hơi hạn chế, ta sẽ sort lại bằng JS bên dưới)
    const unsubscribe = onValue(notiRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedNotis = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        // Sắp xếp mới nhất lên đầu
        loadedNotis.sort((a, b) => b.createdAt - a.createdAt);
        
        setNotifications(loadedNotis);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm render Icon dựa theo loại thông báo
  const renderIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}><Coffee size={24} color="#059669" /></View>;
      case 'promo':
        return <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}><Gift size={24} color="#EA580C" /></View>;
      case 'system':
      default:
        return <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}><Info size={24} color="#3B82F6" /></View>;
    }
  };

  // Hàm tính thời gian tương đối (Vừa xong, 2 giờ trước...)
  const getRelativeTime = (timestamp: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, !item.isRead && styles.unreadCard]}>
      {/* Icon bên trái */}
      <View style={styles.leftCol}>
        {renderIcon(item.type)}
        {!item.isRead && <View style={styles.redDot} />}
      </View>

      {/* Nội dung bên phải */}
      <View style={styles.rightCol}>
        <View style={styles.headerRow}>
          <Text style={styles.notiTitle}>{item.title}</Text>
          <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Thông báo', headerShadowVisible: false }} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#059669" style={{marginTop: 50}} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text style={{color: 'gray', marginTop: 10}}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: {
    flexDirection: 'row', backgroundColor: 'white', padding: 16, marginBottom: 12,
    borderRadius: 16,
    // Shadow nhẹ
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  unreadCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }, // Highlight tin chưa đọc
  
  leftCol: { marginRight: 16, position: 'relative' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  redDot: { 
    position: 'absolute', top: 0, right: 0, width: 10, height: 10, 
    borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: 'white' 
  },

  rightCol: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notiTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  timeText: { fontSize: 12, color: '#9CA3AF' },
  notiMessage: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
});