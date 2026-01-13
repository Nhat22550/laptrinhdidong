import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, useColorScheme 
} from 'react-native';
import React from 'react';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- 🎨 Dữ liệu giả lập (Sau này lấy từ Firebase) ---
const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Đơn hàng hoàn tất 🥤',
    message: 'Đơn hàng #DH001 của bạn đã được pha chế xong. Mời bạn đến quầy nhận món nhé!',
    time: 'Vừa xong',
    type: 'order', // Loại: đơn hàng
    isRead: false,
  },
  {
    id: '2',
    title: 'Khuyến mãi khủng 50% 🎉',
    message: 'Nhập mã NHATCOFFEE giảm ngay 50% cho đơn hàng từ 100k. Hạn chót hôm nay!',
    time: '2 giờ trước',
    type: 'promo', // Loại: khuyến mãi
    isRead: false,
  },
  {
    id: '3',
    title: 'Xác nhận đơn hàng',
    message: 'Đơn hàng #DH001 đã được tiếp nhận. Chúng tôi đang chuẩn bị...',
    time: '3 giờ trước',
    type: 'order',
    isRead: true,
  },
  {
    id: '4',
    title: 'Chào mừng bạn mới 👋',
    message: 'Cảm ơn bạn đã cài đặt ứng dụng Nhật Coffee. Chúc bạn một ngày tốt lành!',
    time: '1 ngày trước',
    type: 'system',
    isRead: true,
  },
];

const Colors = {
  light: { bg: '#F9FAFB', card: '#FFF', text: '#1F2937', sub: '#6B7280', iconBg: '#F3F4F6' },
  dark: { bg: '#111827', card: '#1F2937', text: '#F9FAFB', sub: '#9CA3AF', iconBg: '#374151' }
};

export default function NotificationScreen() {
  const router = useRouter();
  const themeMode = useColorScheme();
  const theme = themeMode === 'dark' ? Colors.dark : Colors.light;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return { name: 'cafe', color: '#059669' }; // Xanh lá
      case 'promo': return { name: 'gift', color: '#D97706' }; // Vàng cam
      default: return { name: 'information-circle', color: '#3B82F6' }; // Xanh dương
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconData = getIcon(item.type);

    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          { backgroundColor: theme.card, opacity: item.isRead ? 0.7 : 1 } // Đã đọc thì mờ đi chút
        ]}
      >
        {/* Cột trái: Icon */}
        <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
          <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        {/* Cột phải: Nội dung */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={[styles.message, { color: theme.sub }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color={theme.sub} />
            <Text style={[styles.emptyText, { color: theme.sub }]}>Chưa có thông báo nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },

  card: { flexDirection: 'row', padding: 16, marginBottom: 12, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 16, position: 'relative' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', borderWidth: 2, borderColor: 'white' },
  
  content: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: '#9CA3AF' },
  message: { fontSize: 14, lineHeight: 20 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 14 }
});