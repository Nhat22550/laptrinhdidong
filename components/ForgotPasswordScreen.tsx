import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Phone, KeyRound, Lock, ArrowLeft } from 'lucide-react-native';

interface ForgotPasswordProps {
  onBack: () => void;
  onResetSuccess: () => void;
}

export default function ForgotPasswordScreen({ onBack, onResetSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handlePress = () => {
    if (step === 1) {
      if (!phoneNumber) return Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại!');
      Alert.alert('OTP đã gửi', `Mã OTP là: 123456`);
      setStep(2);
    } else if (step === 2) {
      if (otp === '123456') setStep(3);
      else Alert.alert('Lỗi', 'OTP sai! Thử lại 123456');
    } else if (step === 3) {
      if (!newPassword) return Alert.alert('Lỗi', 'Nhập mật khẩu mới!');
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      onResetSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}><ArrowLeft size={24} color="#374151" /></TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>{step === 1 ? 'Quên Mật Khẩu?' : step === 2 ? 'Nhập OTP' : 'Mật Khẩu Mới'}</Text>
            <Text style={styles.subtitle}>{step === 1 ? 'Nhập SĐT để nhận mã' : step === 2 ? 'Nhập mã 123456' : 'Đặt lại mật khẩu'}</Text>
          </View>
          <View style={styles.form}>
            {step === 1 && (
              <View style={styles.inputContainer}><Phone size={20} color="#9ca3af" style={styles.icon} /><TextInput placeholder="Số điện thoại" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} keyboardType="phone-pad" /></View>
            )}
            {step === 2 && (
              <View style={styles.inputContainer}><KeyRound size={20} color="#9ca3af" style={styles.icon} /><TextInput placeholder="Mã OTP (123456)" value={otp} onChangeText={setOtp} style={styles.input} keyboardType="numeric" /></View>
            )}
            {step === 3 && (
              <View style={styles.inputContainer}><Lock size={20} color="#9ca3af" style={styles.icon} /><TextInput placeholder="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry /></View>
            )}
            <TouchableOpacity style={styles.button} onPress={handlePress}><Text style={styles.buttonText}>{step === 1 ? 'Gửi Mã' : step === 2 ? 'Xác Nhận' : 'Đổi Mật Khẩu'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' }, container: { flex: 1 }, content: { padding: 24, justifyContent: 'center', flexGrow: 1 }, backButton: { marginBottom: 20 }, header: { marginBottom: 30 }, title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 }, subtitle: { fontSize: 16, color: '#6b7280' }, form: { gap: 16 }, inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#e5e7eb' }, icon: { marginRight: 12 }, input: { flex: 1, fontSize: 16, height: '100%' }, button: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 }, buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});