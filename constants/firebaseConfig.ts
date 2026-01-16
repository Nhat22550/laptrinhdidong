import { initializeApp, getApps, getApp } from 'firebase/app';
// Nếu bạn muốn dùng Auth, Firestore, Storage thì import thêm ở đây
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";
// Dán cấu hình bạn vừa copy từ bước 1 vào đây
const firebaseConfig = {
  apiKey: "AIzaSyDYLyBEfW9CvppY3Pug034lqamZByxizG4",
  authDomain: "myapp-test-75c99.firebaseapp.com",
  projectId: "myapp-test-75c99",
  storageBucket: "myapp-test-75c99.firebasestorage.app",
  messagingSenderId: "609854959412",
  appId: "1:609854959412:web:d5c44d29ce8883a5333f61",
  measurementId: "G-VXVYBMP64S",
  databaseURL: "https://myapp-test-75c99-default-rtdb.firebaseio.com"
};

// Khởi tạo Firebase
// Nghĩa là: Nếu chưa có App nào thì tạo mới, còn nếu có rồi thì lấy cái cũ ra dùng
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
// Xuất các dịch vụ ra để dùng
export const auth = getAuth(app);
export const db = getDatabase(app);
export {  storage }