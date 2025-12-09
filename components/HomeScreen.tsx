import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar
} from 'react-native';
import { 
  Bell, 
  LogOut, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Settings,
  ChevronRight,
  Clock
} from 'lucide-react-native';

interface HomeScreenProps {
  onLogout: () => void;
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. HEADER --- */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/100?img=33' }} // Avatar giả
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Xin chào,</Text>
              <Text style={styles.userName}>Minh Nhật</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#1f2937" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* --- 2. THẺ CARD SỐ DƯ --- */}
        <View style={styles.card}>
          <View>
            <Text style={styles.cardLabel}>Tổng số dư</Text>
            <Text style={styles.balance}>12.500.000 ₫</Text>
          </View>
          <View style={styles.cardIcon}>
            <Wallet size={32} color="white" opacity={0.8} />
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>**** **** **** 1234</Text>
            <Text style={styles.cardDate}>12/28</Text>
          </View>
        </View>

        {/* --- 3. MENU CHỨC NĂNG --- */}
        <View style={styles.actionGrid}>
          <ActionButton icon={<ArrowDownLeft color="#16a34a" />} label="Nạp tiền" />
          <ActionButton icon={<ArrowUpRight color="#ef4444" />} label="Chuyển tiền" />
          <ActionButton icon={<CreditCard color="#eab308" />} label="Thẻ" />
          <ActionButton icon={<Settings color="#6b7280" />} label="Cài đặt" />
        </View>

        {/* --- 4. GIAO DỊCH GẦN ĐÂY --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* List Item 1 */}
          <TransactionItem 
            title="Thanh toán Spotify" 
            date="Hôm nay, 09:41" 
            amount="- 59.000 ₫" 
            isNegative 
          />
           {/* List Item 2 */}
           <TransactionItem 
            title="Nhận lương tháng 12" 
            date="Hôm qua, 15:30" 
            amount="+ 15.000.000 ₫" 
            isNegative={false} 
          />
           {/* List Item 3 */}
           <TransactionItem 
            title="Siêu thị WinMart" 
            date="08/12/2025" 
            amount="- 320.000 ₫" 
            isNegative 
          />
        </View>

        {/* --- 5. NÚT ĐĂNG XUẤT --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Component phụ cho Nút chức năng
const ActionButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={styles.actionIconCircle}>
      {icon}
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Component phụ cho Dòng giao dịch
const TransactionItem = ({ title, date, amount, isNegative }: any) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <View style={[styles.transIcon, { backgroundColor: isNegative ? '#fee2e2' : '#dcfce7' }]}>
        {isNegative ? <ArrowUpRight size={20} color="#ef4444" /> : <ArrowDownLeft size={20} color="#16a34a" />}
      </View>
      <View>
        <Text style={styles.transTitle}>{title}</Text>
        <Text style={styles.transDate}>{date}</Text>
      </View>
    </View>
    <Text style={[styles.transAmount, { color: isNegative ? '#1f2937' : '#16a34a' }]}>
      {amount}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 50 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#f3f4f6' },
  greeting: { fontSize: 14, color: '#6b7280' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  iconButton: { padding: 8, backgroundColor: '#f9fafb', borderRadius: 12, position: 'relative' },
  badge: { width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, position: 'absolute', top: 8, right: 8, borderWidth: 1, borderColor: '#fff' },

  // Card
  card: { backgroundColor: '#16a34a', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  cardLabel: { color: '#dcfce7', fontSize: 14, marginBottom: 4 },
  balance: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  cardIcon: { position: 'absolute', top: 24, right: 24 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNumber: { color: '#dcfce7', fontSize: 14, letterSpacing: 2 },
  cardDate: { color: 'white', fontWeight: 'bold' },

  // Actions
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  actionItem: { alignItems: 'center', gap: 8 },
  actionIconCircle: { width: 56, height: 56, backgroundColor: '#f9fafb', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, color: '#4b5563', fontWeight: '500' },

  // Transactions
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAll: { color: '#16a34a', fontWeight: '600', fontSize: 14 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  transIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  transDate: { fontSize: 12, color: '#9ca3af' },
  transAmount: { fontSize: 16, fontWeight: 'bold' },

  // Logout
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, backgroundColor: '#fef2f2' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
});