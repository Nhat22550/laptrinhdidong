import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Image, Alert, Modal, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../constants/firebaseConfig';
import { ref, push, set, serverTimestamp, get } from 'firebase/database'; // 👇 Thêm 'get' để lấy data
import { useRouter, useLocalSearchParams } from 'expo-router';

// Cấu hình tài khoản nhận tiền
const BANK_INFO = {
  bankId: 'MB', 
  accountNo: '0375159350', 
  accountName: 'GIANG MINH NHAT',
  template: 'compact' 
};

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 👇 State lưu thông tin người dùng lấy từ Firebase
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Lấy dữ liệu giỏ hàng
  const cartTotal = params.total ? Number(params.total) : 0;
  const cartItems = params.items ? JSON.parse(params.items as string) : [];

  const shippingFee = 30000;
  const finalTotal = cartTotal + shippingFee;

  // Tạo mã đơn hàng
  const orderCode = `DH${Math.floor(Math.random() * 10000)}`;
  
  // Link QR
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${finalTotal}&addInfo=${orderCode}&accountName=${BANK_INFO.accountName}`;

  // 👇 1. Lấy thông tin User từ Firebase khi vào trang
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserInfo({
              name: data.displayName || user.displayName || 'Khách hàng',
              phone: data.phoneNumber || 'Chưa có SĐT',
              // Nếu chưa có địa chỉ thì để trống hoặc hiện thông báo
              address: data.address || '' 
            });
          }
        } catch (error) {
          console.log("Lỗi lấy thông tin user:", error);
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handlePlaceOrder = async () => {
    // 👇 Kiểm tra nếu chưa có địa chỉ thì chặn lại
    if (!userInfo.address) {
        Alert.alert(
            "Thiếu địa chỉ", 
            "Vui lòng cập nhật địa chỉ giao hàng trước khi thanh toán.",
            [
                { text: "Để sau", style: "cancel" },
                { text: "Cập nhật ngay", onPress: () => router.push('/profile') }
            ]
        );
        return;
    }

    if (paymentMethod === 'banking') {
      setShowQR(true); 
      return;
    }
    saveOrderToFirebase('Đang xử lý');
  };

  const confirmBankingPayment = () => {
    setShowQR(false);
    saveOrderToFirebase('Đang chờ xác nhận'); 
  };

  const saveOrderToFirebase = async (status: string) => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const newOrderRef = push(ref(db, 'orders'));
      const userId = auth.currentUser.uid;
      await set(newOrderRef, {
        userId: auth.currentUser.uid,
        orderCode: orderCode,
        items: cartItems,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản',
        status: status,
        createdAt: serverTimestamp(),
        // 👇 2. Lưu thông tin thật vào đơn hàng
        shippingAddress: userInfo.address, 
        customerName: userInfo.name,
        customerPhone: userInfo.phone
      });
      // 👇 2. TẠO THÔNG BÁO MỚI (Thêm đoạn này) 👇
      const notificationRef = push(ref(db, `notifications/${userId}`));
      await set(notificationRef, {
        title: 'Xác nhận đơn hàng',
        message: `Đơn hàng #${orderCode} đã được tiếp nhận. Chúng tôi đang chuẩn bị món cho bạn.`,
        type: 'order', // Loại thông báo: order | promo | system
        isRead: false,
        createdAt: serverTimestamp()
      });
      // 👆 KẾT THÚC ĐOẠN THÊM 👆
      Alert.alert("Thành công", "Đặt hàng thành công!", [
        { text: "OK", onPress: () => router.replace('/order-history') } 
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể tạo đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Hiển thị Địa chỉ thật */}
        <View style={styles.section}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 10}}>
            <Text style={styles.sectionTitle}>📍 Địa chỉ nhận hàng</Text>
            {/* Nút sửa nhanh dẫn về trang Profile để cập nhật */}
            <TouchableOpacity onPress={() => router.push('/profile')}>
                <Text style={{color:'#059669', fontWeight:'600'}}>Thay đổi</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.boldText}>{userInfo.name} | {userInfo.phone}</Text>
            
            {/* Logic hiển thị địa chỉ */}
            {userInfo.address ? (
                <Text style={styles.subText}>{userInfo.address}</Text>
            ) : (
                <Text style={[styles.subText, {color: '#EF4444', fontStyle: 'italic'}]}>
                    (Chưa có địa chỉ giao hàng)
                </Text>
            )}
          </View>
        </View>

        {/* 2. Phương thức thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          
          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'cod' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons name="cash-outline" size={24} color="#10B981" />
            <Text style={styles.methodText}>Thanh toán khi nhận hàng (COD)</Text>
            {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'banking' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('banking')}
          >
            <Ionicons name="qr-code-outline" size={24} color="#3B82F6" />
            <Text style={styles.methodText}>Chuyển khoản Ngân hàng / MoMo</Text>
            {paymentMethod === 'banking' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
          </TouchableOpacity>
        </View>

        {/* 3. Tóm tắt thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Chi tiết thanh toán</Text>
          <View style={styles.card}>
            <View style={styles.row}><Text>Tạm tính</Text><Text>{cartTotal.toLocaleString()} đ</Text></View>
            <View style={styles.row}><Text>Phí vận chuyển</Text><Text>{shippingFee.toLocaleString()} đ</Text></View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>{finalTotal.toLocaleString()} đ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>ĐẶT HÀNG NGAY</Text>}
        </TouchableOpacity>
      </View>

      {/* MODAL QUÉT QR */}
      <Modal visible={showQR} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            <Text style={styles.qrSub}>Nội dung: {orderCode}</Text>
            
            <Image 
              source={{ uri: qrUrl }} 
              style={{ width: 250, height: 300, resizeMode: 'contain', marginVertical: 20 }} 
            />
            
            <Text style={{textAlign: 'center', marginBottom: 20, color: 'gray'}}>
              Vui lòng không sửa nội dung chuyển khoản để hệ thống tự động xác nhận.
            </Text>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmBankingPayment}>
              <Text style={styles.confirmText}>TÔI ĐÃ CHUYỂN KHOẢN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowQR(false)}>
              <Text style={{color: 'red'}}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: '#374151' }, // Sửa margin bottom
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  
  // Method Styles
  methodCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', 
    padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' 
  },
  selectedMethod: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  methodText: { flex: 1, marginLeft: 10, fontWeight: '500' },

  // Text Styles
  boldText: { fontWeight: 'bold', fontSize: 15 },
  subText: { color: 'gray', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalPrice: { fontWeight: 'bold', fontSize: 18, color: '#EF4444' },

  // Footer
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderColor: '#E5E7EB' 
  },
  payButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  payButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Modal QR
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  qrContainer: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  qrTitle: { fontSize: 20, fontWeight: 'bold', color: '#10B981' },
  qrSub: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginTop: 5 },
  confirmButton: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginBottom: 15 },
  confirmText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { padding: 10 }
});