import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
// Icon UI thông thường
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
// Icon Logo mạng xã hội (Có sẵn trong Expo)
import { AntDesign } from '@expo/vector-icons'; 

interface AuthScreenProps {
  onAuthenticated?: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true); // true = Đăng nhập, false = Đăng ký
  const [showPassword, setShowPassword] = useState(false);
  
  // State lưu dữ liệu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // Demo logic đơn giản
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    // Giả lập thành công -> Gọi hàm onAuthenticated
    if (onAuthenticated) {
      onAuthenticated();
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
          
          {/* --- HEADER --- */}
          <View style={styles.header}>
            {/* Nếu muốn thêm Logo trường học thì thêm thẻ Image ở đây */}
            <Text style={styles.title}>
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới để bắt đầu'}
            </Text>
          </View>

          {/* --- FORM --- */}
          <View style={styles.form}>
            
            {/* Trường Tên (Chỉ hiện khi Đăng ký) */}
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

            {/* Trường Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Trường Mật khẩu */}
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
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Submit Chính */}
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            {/* --- PHẦN MXH MỚI THÊM VÀO --- */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Nút Facebook */}
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]} 
              onPress={() => handleSocialLogin('Facebook')}
              activeOpacity={0.8}
            >
              <AntDesign name="facebook" size={24} color="white" />
              <Text style={styles.socialButtonText}>
                {isLogin ? 'Đăng nhập với Facebook' : 'Đăng ký với Facebook'}
              </Text>
            </TouchableOpacity>

            {/* Nút Google */}
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#DB4437', marginTop: 12 }]} 
              onPress={() => handleSocialLogin('Google')}
              activeOpacity={0.8}
            >
              <AntDesign name="google" size={24} color="white" />
              <Text style={styles.socialButtonText}>
                {isLogin ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* --- FOOTER (Chuyển đổi) --- */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.linkText}>
                {isLogin ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  button: {
    backgroundColor: '#16a34a', // Màu xanh chủ đạo
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style cho phần Mạng xã hội
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6b7280',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    // Shadow nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 14,
  },
});