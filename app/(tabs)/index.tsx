import { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Platform, View, Button } from 'react-native';

// Import các component có sẵn của Expo
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Import 2 màn hình bạn vừa tạo (Lưu ý đường dẫn)
import AuthScreen from '@/components/AuthScreen'; 

// Tuy nhiên, thường SuccessScreen sẽ nằm riêng. 
// Nếu bạn chưa tách SuccessScreen ra file riêng, tôi giả sử bạn để nó trong components/SuccessScreen.tsx
// Dưới đây tôi sẽ import theo chuẩn thông thường:
import {SuccessScreen} from '../../components/SuccessScreen';

export default function HomeScreen() {
  // Trạng thái màn hình hiện tại: 'auth' | 'success' | 'home'
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'success' | 'home'>('auth');

  // 1. Nếu đang ở trạng thái 'auth', hiện màn hình Đăng nhập
  if (currentScreen === 'auth') {
    return (
      <AuthScreen 
        onAuthenticated={() => setCurrentScreen('success')} 
      />
    );
  }

  // 2. Nếu đang ở trạng thái 'success', hiện màn hình Thông báo thành công
  if (currentScreen === 'success') {
    return (
      <SuccessScreen 
        onContinue={() => setCurrentScreen('home')} 
      />
    );
  }

  // 3. Nếu ở trạng thái 'home', hiện giao diện Trang chủ (ParallaxScrollView cũ)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome User!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Bạn đã đăng nhập thành công.</ThemedText>
        <ThemedText>
          Đây là màn hình chính của ứng dụng. Bạn có thể bắt đầu xây dựng các tính năng khác từ đây.
        </ThemedText>
      </ThemedView>

      {/* Nút Đăng xuất để test lại luồng */}
      <ThemedView style={styles.stepContainer}>
        <Button 
          title="Đăng xuất (Quay lại Login)" 
          color="#ef4444" 
          onPress={() => setCurrentScreen('auth')} 
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});