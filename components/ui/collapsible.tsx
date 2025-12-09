import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

export function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.7}>
        {isOpen ? (
          <ChevronDown size={18} color={isDark ? '#fff' : '#000'} />
        ) : (
          <ChevronRight size={18} color={isDark ? '#687076' : '#687076'} />
        )}
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  content: { marginTop: 4, marginLeft: 26 },
});