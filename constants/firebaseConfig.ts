import { initializeApp } from 'firebase/app';
// Nếu bạn muốn dùng Auth, Firestore, Storage thì import thêm ở đây
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Dán cấu hình bạn vừa copy từ bước 1 vào đây
const firebaseConfig = {
  apiKey: "AIzaSyDYLyBEfW9CvppY3Pug034lqamZByxizG4",
  authDomain: "myapp-test-75c99.firebaseapp.com",
  projectId: "myapp-test-75c99",
  storageBucket: "myapp-test-75c99.firebasestorage.app",
  messagingSenderId: "609854959412",
  appId: "1:609854959412:web:d5c44d29ce8883a5333f61",
  measurementId: "G-VXVYBMP64S"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất các dịch vụ ra để dùng ở chỗ khác
export const auth = getAuth(app);
export const db = getFirestore(app);