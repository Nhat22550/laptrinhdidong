import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, 
  ScrollView, Image, useColorScheme, TextInput, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../../constants/firebaseConfig'; // 👇 Nhớ import storage
import { ref, get, update } from 'firebase/database';
import { signOut, updateProfile, updateEmail } from 'firebase/auth'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // 👇 Import storage func
import * as ImagePicker from 'expo-image-picker'; // 👇 Import thư viện ảnh
import { Ionicons } from '@expo/vector-icons';
import AuthScreen from '../../components/AuthScreen'; 
import { useRouter } from 'expo-router';

// --- 🎨 Bảng màu ---
const Colors = {
  light: { background: '#F9FAFB', card: '#FFFFFF', text: '#1F2937', subText: '#6B7280', primary: '#059669', border: '#E5E7EB', danger: '#EF4444' },
  dark: { background: '#111827', card: '#1F2937', text: '#F9FAFB', subText: '#9CA3AF', primary: '#10B981', border: '#374151', danger: '#EF4444' }
};

export default function ProfileScreen() {
  const router = useRouter();
  const systemTheme = useColorScheme();
  const theme = systemTheme === 'dark' ? Colors.dark : Colors.light;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- 🛠 STATE CHO MODAL SỬA THÔNG TIN ---
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState(''); // 'phone' | 'email' | 'address'
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Lấy chữ cái đầu
  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  // Lấy dữ liệu User
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
      console.log("Lỗi data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 📸 XỬ LÝ ĐỔI AVATAR ---
  const pickImage = async () => {
    // 1. Xin quyền và chọn ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // 2. Chuyển ảnh thành Blob để upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // 3. Upload lên Firebase Storage
      const filename = `avatars/${auth.currentUser.uid}_${Date.now()}.jpg`;
      const imageRef = storageRef(storage, filename);
      await uploadBytes(imageRef, blob);

      // 4. Lấy URL ảnh về
      const downloadURL = await getDownloadURL(imageRef);

      // 5. Cập nhật vào Auth và Database
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await update(ref(db, `users/${auth.currentUser.uid}`), { photoURL: downloadURL });

      // 6. Cập nhật UI
      setUserData({ ...userData, photoURL: downloadURL });
      Alert.alert("Thành công", "Đã đổi ảnh đại diện!");
    } catch (error: any) {
      Alert.alert("Lỗi upload", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 📝 XỬ LÝ MỞ MODAL SỬA ---
  const openEditModal = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue || '');
    setModalVisible(true);
  };

  // --- 💾 LƯU THÔNG TIN ---
  const handleSaveInfo = async () => {
    if (!editValue.trim()) {
      Alert.alert("Lỗi", "Không được để trống thông tin này");
      return;
    }
    
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (editField === 'email') {
        // Cập nhật Email (Cần đăng nhập gần đây mới cho sửa Auth)
        // Lưu ý: Chỉ nên cho update Database hiển thị để tránh lỗi Auth phức tạp
        await update(ref(db, `users/${user.uid}`), { email: editValue });
        
        // Nếu muốn update cả Login Email (Rủi ro lỗi nếu chưa re-auth):
        // await updateEmail(user, editValue); 
      } 
      else if (editField === 'phone') {
        await update(ref(db, `users/${user.uid}`), { phoneNumber: editValue });
      } 
      else if (editField === 'address') {
        await update(ref(db, `users/${user.uid}`), { address: editValue });
      }

      // Cập nhật UI ngay lập tức
      setUserData({ ...userData, [editField === 'phone' ? 'phoneNumber' : editField]: editValue });
      setModalVisible(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin!");
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể lưu: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- ĐĂNG XUẤT ---
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: 'destructive', onPress: async () => { await signOut(auth); setUserData(null); } }
    ]);
  };

  // Component MenuItem
  const MenuItem = ({ icon, title, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]} 
      onPress={onPress} activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : (systemTheme === 'dark' ? '#374151' : '#F3F4F6') }]}>
          <Ionicons name={icon} size={20} color={isDestructive ? theme.danger : theme.primary} />
        </View>
        <Text style={[styles.menuText, { color: isDestructive ? theme.danger : theme.text }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: theme.subText }]} numberOfLines={1}>{value.length > 20 ? value.substring(0,20)+'...' : value}</Text>}
        {!value && <Ionicons name="chevron-forward" size={18} color={theme.subText} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) return <View style={[styles.centerContainer, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  if (!auth.currentUser) return <AuthScreen onAuthenticated={fetchData} />;

  return (
    <View style={{flex: 1}}> 
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER PROFILE */}
        <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarContainer}>
            {/* Logic hiển thị Avatar: Nếu có ảnh thì hiện ảnh, ko thì hiện chữ cái */}
            {userData?.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>{getInitials(userData?.displayName)}</Text>
              </View>
            )}
            
            {/* Nút Camera để đổi Avatar */}
            <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>{userData?.displayName || "Người dùng"}</Text>
          <Text style={[styles.userEmail, { color: theme.subText }]}>{userData?.email}</Text>
        </View>

        {/* THÔNG TIN CÁ NHÂN */}
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>Thông tin cá nhân</Text>
        <View style={styles.menuGroup}>
          <MenuItem 
            icon="call-outline" title="Số điện thoại" 
            value={userData?.phoneNumber || "Chạm để thêm"} 
            onPress={() => openEditModal('phone', userData?.phoneNumber)} 
          />
          <MenuItem 
            icon="mail-outline" title="Email" 
            value={userData?.email} 
            onPress={() => openEditModal('email', userData?.email)} 
          />
          <MenuItem 
            icon="location-outline" title="Địa chỉ giao hàng" 
            value={userData?.address || "Chạm để thêm"} 
            onPress={() => openEditModal('address', userData?.address)} 
          />
        </View>

        {/* CÀI ĐẶT ỨNG DỤNG */}
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>Cài đặt ứng dụng</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="time-outline" title="Lịch sử đơn hàng" onPress={() => router.push('/order-history')} />
          {userData?.role === 'admin' && <MenuItem icon="stats-chart-outline" title="Quản lý doanh thu" onPress={() => Alert.alert("Admin", "Vào trang quản lý")} />}
          <MenuItem icon="lock-closed-outline" title="Đổi mật khẩu" />
          <MenuItem icon="log-out-outline" title="Đăng xuất" isDestructive onPress={handleLogout} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL SỬA THÔNG TIN (Dùng chung cho Phone, Email, Address) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editField === 'phone' ? 'Cập nhật Số điện thoại' : editField === 'email' ? 'Cập nhật Email' : 'Cập nhật Địa chỉ'}
            </Text>
            
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Nhập thông tin mới..."
              placeholderTextColor={theme.subText}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={editField === 'phone' ? 'phone-pad' : 'default'}
              multiline={editField === 'address'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={{color: theme.subText}}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.primary}]} onPress={handleSaveInfo} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="white"/> : <Text style={{color: 'white', fontWeight: 'bold'}}>Lưu lại</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { alignItems: 'center', padding: 24, marginBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 }, // Style cho ảnh thật
  avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginLeft: 20, marginBottom: 8, textTransform: 'uppercase' },
  menuGroup: { marginBottom: 24, paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 10, borderRadius: 16, borderWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { fontSize: 16, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
  menuValue: { fontSize: 14, marginRight: 8 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  btnCancel: { padding: 10, marginRight: 15 },
  btnSave: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }
});