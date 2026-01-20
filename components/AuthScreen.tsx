import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Phone, Lock, User, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react-native'; 
import { AntDesign } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { auth } from '../constants/firebaseConfig'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { getDatabase, ref, set,push, serverTimestamp } from 'firebase/database';

interface AuthScreenProps {
  onAuthenticated?: () => void;
  onForgotPassword?: () => void;
}

export default function AuthScreen({ onAuthenticated, onForgotPassword }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State quản lý phương thức đăng nhập ('phone' hoặc 'email')
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  
  // State chứa giá trị nhập vào (SĐT hoặc Email)
  const [inputValue, setInputValue] = useState('');
  
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  // --- HÀM XỬ LÝ LOGIC ---
  const handleSubmit = async () => {
    if (!inputValue || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (!isLogin && !name) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ tên!');
      return;
    }

    setLoading(true);

    let finalEmail = inputValue;
    
    if (authMethod === 'phone') {
        finalEmail = `${inputValue}@app.com`;
    } else {
        finalEmail = inputValue;
    }

    try {
      if (isLogin) {
        // --- ĐĂNG NHẬP ---
        const userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
        console.log('Đăng nhập thành công:', userCredential.user.email);
        Alert.alert('Thành công', 'Đăng nhập thành công!');
        if (onAuthenticated) onAuthenticated();
      } else {
        // --- ĐĂNG KÝ ---
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, password);
        const user = userCredential.user; 

        if (user) {
          await updateProfile(user, { displayName: name });
        }

        const db = getDatabase(); 
        await set(ref(db, 'users/' + user.uid), {
          contactValue: inputValue,
          authMethod: authMethod,
          displayName: name,
          email: user.email,
          role: "user", 
          createdAt: new Date().toISOString()
        });
        // 👇 2. THÊM ĐOẠN NÀY: TẠO THÔNG BÁO CHÀO MỪNG 👇
        const notiRef = push(ref(db, `notifications/${user.uid}`));
        await set(notiRef, {
            title: 'Chào mừng bạn mới! 👋',
            message: `Cảm ơn ${name} đã tham gia Nhật Coffee. Chúc bạn có những trải nghiệm tuyệt vời!`,
            type: 'system', // Loại: system
            isRead: false,
            createdAt: serverTimestamp()
        });
        // Đăng xuất ngay lập tức
        await signOut(auth);

        Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');

        setIsLogin(true);
        setPassword(''); 
      }
    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      
      if (msg.includes('auth/email-already-in-use')) msg = 'Tài khoản này đã tồn tại!';
      else if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) msg = 'Sai thông tin đăng nhập hoặc mật khẩu!';
      else if (msg.includes('auth/weak-password')) msg = 'Mật khẩu phải có ít nhất 6 ký tự!';
      else if (msg.includes('auth/invalid-email')) msg = 'Định dạng email không hợp lệ!';
      
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert('Thông báo', `Tính năng đăng nhập bằng ${platform} đang phát triển!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới'}
            </Text>
          </View>

          {/* Tab chuyển đổi giữa Điện thoại và Email */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tabButton, authMethod === 'phone' && styles.activeTab]}
                onPress={() => { setAuthMethod('phone'); setInputValue(''); }}
            >
                <Phone size={18} color={authMethod === 'phone' ? '#16a34a' : '#6b7280'} />
                <Text style={[styles.tabText, authMethod === 'phone' && styles.activeTabText]}>Điện thoại</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.tabButton, authMethod === 'email' && styles.activeTab]}
                onPress={() => { setAuthMethod('email'); setInputValue(''); }}
            >
                <Mail size={18} color={authMethod === 'email' ? '#16a34a' : '#6b7280'} />
                <Text style={[styles.tabText, authMethod === 'email' && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Tên - Chỉ hiện khi Đăng ký */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và Tên</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nguyễn Văn A"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* Input hiển thị linh động theo Tab */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{authMethod === 'phone' ? 'Số điện thoại' : 'Email'}</Text>
              <View style={styles.inputContainer}>
                {authMethod === 'phone' ? (
                    <Phone size={20} color="#9ca3af" style={styles.inputIcon} />
                ) : (
                    <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
                )}
                
                <TextInput
                  placeholder={authMethod === 'phone' ? "0912345678" : "vidu@gmail.com"}
                  keyboardType={authMethod === 'phone' ? "phone-pad" : "email-address"}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Mật khẩu */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nhập mật khẩu..."
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Nút Quên mật khẩu chỉ hiện khi dùng Email */}
            {isLogin && authMethod === 'email' && (
              <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text style={{ color: '#16a34a', fontWeight: '600' }}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Nút Submit */}
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                 <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Mạng xã hội */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} /><Text style={styles.dividerText}>Hoặc</Text><View style={styles.dividerLine} />
            </View>

            {/* 👇 ĐÃ XÓA FACEBOOK, CHỈ CÒN GOOGLE */}
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#DB4437' }]} 
              onPress={() => handleSocialLogin('Google')}
            >
              <AntDesign name="google" size={24} color="white" />
              <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}</Text>
            <TouchableOpacity onPress={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setName('');
            }}>
              <Text style={styles.linkText}>{isLogin ? 'Đăng Ký Ngay' : 'Đăng Nhập'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  form: { marginBottom: 24 },
  
  // Style cho Tab
  tabContainer: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 24 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 8 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontWeight: '600', color: '#6b7280' },
  activeTabText: { color: '#16a34a' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#e5e7eb' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', height: '100%' },
  button: { backgroundColor: '#16a34a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 10, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3, gap: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 10, color: '#6b7280', fontSize: 14 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10, elevation: 2 },
  socialButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 20 },
  footerText: { color: '#6b7280', fontSize: 14 },
  linkText: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },
});