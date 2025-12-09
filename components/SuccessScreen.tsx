import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// Chắc chắn bạn đã cài: npm install lucide-react-native react-native-svg
import { CheckCircle } from 'lucide-react-native'; 

interface SuccessScreenProps {
  onContinue: () => void;
}

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color="#16a34a" /> 
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>Registration Successful!</Text>
        <Text style={styles.description}>
          Your account has been created successfully. We ve sent a verification email.
        </Text>

        {/* Button */}
        <TouchableOpacity 
          onPress={onContinue}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: { marginBottom: 24 },
  iconCircle: {
    width: 80, height: 80,
    backgroundColor: '#dcfce7',
    borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: 24, fontWeight: 'bold',
    color: '#111827', marginBottom: 12, textAlign: 'center',
  },
  description: {
    fontSize: 16, color: '#6b7280',
    marginBottom: 32, textAlign: 'center', lineHeight: 24,
  },
  button: {
    width: '100%', backgroundColor: '#16a34a',
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
  },
  buttonText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  }
});