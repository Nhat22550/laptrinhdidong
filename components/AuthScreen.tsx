import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { Phone, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react-native'; 
import { AntDesign } from '@expo/vector-icons'; 

interface AuthScreenProps {
  onAuthenticated?: () => void;
  onForgotPassword?: () => void;
}

export default function AuthScreen({ onAuthenticated, onForgotPassword }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // SỬ DỤNG SỐ ĐIỆN THOẠI
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!phoneNumber || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (onAuthenticated) onAuthenticated();
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
              {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới bằng số điện thoại'}
            </Text>
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

            {/* SỐ ĐIỆN THOẠI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#9ca3af" style={styles.inputIcon} /> 
                <TextInput
                  placeholder="0912 345 678"
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
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
            
            {/* Nút Quên mật khẩu */}
            {isLogin && (
              <TouchableOpacity 
                style={styles.forgotPass}
                onPress={onForgotPassword}
              >
                <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            )}

            {/* Nút Submit */}
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            {/* Mạng xã hội */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} /><Text style={styles.dividerText}>Hoặc</Text><View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]} 
              onPress={() => handleSocialLogin('Facebook')}
            >
              <AntDesign name="facebook" size={24} color="white" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#DB4437', marginTop: 12 }]} 
              onPress={() => handleSocialLogin('Google')}
            >
              <AntDesign name="google" size={24} color="white" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}</Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#e5e7eb' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', height: '100%' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: '#16a34a', fontWeight: '600', fontSize: 14 },
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