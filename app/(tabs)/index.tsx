import { useState } from 'react';

// Import các màn hình
import AuthScreen from '@/components/AuthScreen'; 
import { SuccessScreen } from '@/components/SuccessScreen'; 
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen'; 
import HomeScreen from '@/components/HomeScreen'; // <--- QUAN TRỌNG: Import màn hình mới

export default function AppOrchestrator() {
  // Quản lý trạng thái: 'auth' | 'success' | 'home' | 'forgot'
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'success' | 'home' | 'forgot'>('auth');

  // --- 1. Màn hình Đăng nhập ---
  if (currentScreen === 'auth') {
    return (
      <AuthScreen 
        onAuthenticated={() => setCurrentScreen('success')} 
        onForgotPassword={() => setCurrentScreen('forgot')} 
      />
    );
  }

  // --- 2. Màn hình Quên mật khẩu ---
  if (currentScreen === 'forgot') {
    return (
      <ForgotPasswordScreen
        onBack={() => setCurrentScreen('auth')}
        onResetSuccess={() => setCurrentScreen('auth')}
      />
    );
  }

  // --- 3. Màn hình Thành công (Sau khi đăng nhập) ---
  if (currentScreen === 'success') {
    return (
      <SuccessScreen 
        onContinue={() => setCurrentScreen('home')} 
      />
    );
  }

  // --- 4. Màn hình Trang chủ (DASHBOARD MỚI) ---
  // Thay vì trả về ParallaxScrollView cũ, ta trả về HomeScreen
  return (
    <HomeScreen 
      onLogout={() => setCurrentScreen('auth')} // Khi bấm logout thì quay về auth
    />
  );
}