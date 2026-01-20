import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth'; // 👇 Hàm của Firebase
import { auth } from '../constants/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email của bạn");
      return;
    }

    setLoading(true);
    try {
      // 👇 Gửi link reset về email
      await sendPasswordResetEmail(auth, email);
      
      Alert.alert(
        "Đã gửi email", 
        "Vui lòng kiểm tra hộp thư (cả mục Spam) để đặt lại mật khẩu.",
        [{ text: "OK", onPress: () => router.back() }] // Quay lại đăng nhập
      );
    } catch (error: any) {
      console.log(error);
      let msg = "Không thể gửi email.";
      if (error.code === 'auth/user-not-found') msg = "Email này chưa đăng ký tài khoản.";
      if (error.code === 'auth/invalid-email') msg = "Email không hợp lệ.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
           <Ionicons name="lock-closed-outline" size={60} color="#059669" />
        </View>

        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subText}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetPassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.resetBtnText}>GỬI YÊU CẦU</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  backBtn: { marginTop: 40, width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  
  iconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  subText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15,
    height: 50, width: '100%', marginBottom: 20
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },

  resetBtn: {
    backgroundColor: '#059669', width: '100%', height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3
  },
  resetBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});