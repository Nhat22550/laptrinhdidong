import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../constants/firebaseConfig';
import { ref, get } from 'firebase/database';
import { signOut } from 'firebase/auth'; 
import AuthScreen from '../../components/AuthScreen'; 

export default function ProfileScreen() { // Đổi tên thành ProfileScreen cho dễ nhớ
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await signOut(auth);
      setUserData(null);
      Alert.alert("Đăng xuất thành công!");
    } catch (error) {
      Alert.alert("Lỗi đăng xuất");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} />;

  if (!auth.currentUser) {
    return <AuthScreen onAuthenticated={() => fetchData()} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hồ sơ cá nhân</Text>
      
      <View style={styles.card}>
        <Text style={styles.welcome}>Xin chào, {userData?.displayName}!</Text>
        <Text>📞 SĐT: {userData?.phoneNumber}</Text>
        <Text>📧 Email: {userData?.email}</Text>
        <Text style={{fontWeight: 'bold', marginTop: 5}}>
            Chức vụ: {userData?.role === 'admin' ? '👑 SẾP (ADMIN)' : '👤 Khách hàng'}
        </Text>
      </View>

      {userData?.role === 'admin' && (
        <TouchableOpacity style={styles.adminButton}>
          <Text style={styles.adminText}>Vào trang quản lý doanh thu</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#f8f9fa', padding: 20, borderRadius: 10, width: '100%', gap: 10, borderWidth: 1, borderColor: '#eee' },
  welcome: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  adminButton: { marginTop: 20, backgroundColor: '#2f3640', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  adminText: { color: 'white', fontWeight: 'bold' },
  logoutButton: { marginTop: 10, padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'red' },
  logoutText: { color: 'red', fontWeight: 'bold' }
});