import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, 
  ScrollView, Image, useColorScheme, Switch, Dimensions 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../constants/firebaseConfig';
import { ref, get } from 'firebase/database';
import { signOut } from 'firebase/auth'; 
import { Ionicons } from '@expo/vector-icons';
import AuthScreen from '../../components/AuthScreen'; 
import { useRouter } from 'expo-router';

// --- 🎨 Bảng màu (Đồng bộ với Home) ---
const Colors = {
  light: {
    background: '#F9FAFB', card: '#FFFFFF', text: '#1F2937', subText: '#6B7280',
    primary: '#059669', border: '#E5E7EB', icon: '#4B5563', danger: '#EF4444'
  },
  dark: {
    background: '#111827', card: '#1F2937', text: '#F9FAFB', subText: '#9CA3AF',
    primary: '#10B981', border: '#374151', icon: '#D1D5DB', danger: '#EF4444'
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const systemTheme = useColorScheme();
  const isDark = systemTheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy chữ cái đầu của tên để làm Avatar
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      }
    } catch (error) {
      console.log("Lỗi lấy data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đăng xuất", 
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            setUserData(null);
          } catch (error) {
            Alert.alert("Lỗi đăng xuất");
          }
        }
      }
    ]);
  };

  // Component dòng Menu (Setting Item)
  const MenuItem = ({ icon, title, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : (isDark ? '#374151' : '#F3F4F6') }]}>
          <Ionicons name={icon} size={20} color={isDestructive ? theme.danger : theme.primary} />
        </View>
        <Text style={[styles.menuText, { color: isDestructive ? theme.danger : theme.text }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: theme.subText }]}>{value}</Text>}
        {!value && <Ionicons name="chevron-forward" size={18} color={theme.subText} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  if (!auth.currentUser) {
    return <AuthScreen onAuthenticated={() => fetchData()} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      
      {/* 1. HEADER PROFILE */}
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <View style={styles.avatarContainer}>
          {/* Avatar giả lập từ chữ cái đầu */}
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{getInitials(userData?.displayName)}</Text>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={14} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.userName, { color: theme.text }]}>{userData?.displayName || "Người dùng"}</Text>
        <Text style={[styles.userEmail, { color: theme.subText }]}>{userData?.email}</Text>
        
        {/* Label Chức vụ */}
        <View style={[styles.roleBadge, { backgroundColor: userData?.role === 'admin' ? '#FEF3C7' : '#D1FAE5' }]}>
          <Text style={[styles.roleText, { color: userData?.role === 'admin' ? '#D97706' : '#059669' }]}>
            {userData?.role === 'admin' ? '👑 Admin' : '☕ Khách hàng thân thiết'}
          </Text>
        </View>
      </View>

      {/* 2. THỐNG KÊ NHANH */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.subText }]}>Đơn hàng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.subText }]}>Điểm tích lũy</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.subText }]}>Voucher</Text>
        </View>
      </View>

      {/* 3. THÔNG TIN CÁ NHÂN */}
      <Text style={[styles.sectionTitle, { color: theme.subText }]}>Thông tin cá nhân</Text>
      <View style={styles.menuGroup}>
        <MenuItem icon="call-outline" title="Số điện thoại" value={userData?.phoneNumber || "Chưa cập nhật"} />
        <MenuItem icon="mail-outline" title="Email" value={userData?.email} />
        <MenuItem icon="location-outline" title="Địa chỉ giao hàng" onPress={() => Alert.alert("Tính năng", "Đang phát triển")} />
      </View>

      {/* 4. CÀI ĐẶT & ADMIN */}
      <Text style={[styles.sectionTitle, { color: theme.subText }]}>Cài đặt ứng dụng</Text>
      <View style={styles.menuGroup}>
        <MenuItem icon="time-outline" title="Lịch sử đơn hàng" onPress={() => Alert.alert("Thông báo", "Chức năng xem lịch sử")} />
        
        {/* Chỉ hiện nếu là Admin */}
        {userData?.role === 'admin' && (
          <MenuItem icon="stats-chart-outline" title="Quản lý doanh thu" onPress={() => Alert.alert("Admin", "Vào trang quản lý")} />
        )}
        
        <MenuItem icon="lock-closed-outline" title="Đổi mật khẩu" />
        <MenuItem icon="log-out-outline" title="Đăng xuất" isDestructive onPress={handleLogout} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header Style
  headerCard: { 
    alignItems: 'center', padding: 24, marginBottom: 20, 
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: { 
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333',
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white'
  },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 12, fontWeight: '700' },

  // Stats Row
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  statCard: { 
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, marginHorizontal: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  statNumber: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 12 },

  // Menu List
  sectionTitle: { fontSize: 14, fontWeight: '600', marginLeft: 20, marginBottom: 8, textTransform: 'uppercase' },
  menuGroup: { marginBottom: 24, paddingHorizontal: 20 },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, marginBottom: 10, borderRadius: 16, borderWidth: 1
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { fontSize: 16, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  menuValue: { fontSize: 14, marginRight: 8 }
});