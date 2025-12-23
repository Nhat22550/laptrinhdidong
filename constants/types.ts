// Định nghĩa khuôn mẫu cho một món ăn
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string; // Dấu ? nghĩa là có thể không có cũng được
  image: string;
  category: string;
}

// Định nghĩa khuôn mẫu cho User (tiện thể làm luôn)
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
}