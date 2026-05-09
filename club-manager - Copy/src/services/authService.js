// Firebase Authentication Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

function mapFirebaseError(code) {
  const errors = {
    'auth/email-already-in-use': 'Email đã được sử dụng',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/operation-not-allowed': 'Phương thức đăng nhập chưa được bật',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
    'auth/network-request-failed': 'Lỗi kết nối mạng',
    'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  };
  return errors[code] || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export const authService = {
  // Đăng ký tài khoản mới
  async register({ name, email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Tạo Firestore user document — role lưu ở đây (không cần custom claims)
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'member',
        departmentId: null,
        avatar: null,
        phone: null,
        studentId: null,
        joinDate: new Date().toISOString().split('T')[0],
        bio: '',
        points: 0,
        tasksCompleted: 0,
        isActive: true,
        isProtected: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user };
    } catch (error) {
      console.error('[Auth] Register error:', error.code);
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Đăng nhập
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('[Auth] Login error:', error.code);
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Đăng xuất
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false, error: 'Lỗi đăng xuất' };
    }
  },

  // Đổi mật khẩu
  async changePassword(newPassword) {
    try {
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Quên mật khẩu
  async forgotPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Lắng nghe auth state changes
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Lấy user profile từ Firestore
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      return null;
    }
  },

  // Cập nhật user profile
  async updateProfile(uid, data) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Đổi vai trò user (admin only)
  async updateUserRole(uid, newRole) {
    try {
      // Kiểm tra user có protected không
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data().isProtected) {
        return { success: false, error: 'Không thể đổi vai trò của tài khoản được bảo vệ' };
      }
      if (newRole === 'super_admin') {
        return { success: false, error: 'Không thể tạo super_admin' };
      }
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kích hoạt/vô hiệu hóa user
  async toggleUserActive(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return { success: false, error: 'User không tồn tại' };
      if (userDoc.data().isProtected) return { success: false, error: 'Không thể vô hiệu hóa tài khoản được bảo vệ' };
      await updateDoc(doc(db, 'users', uid), {
        isActive: !userDoc.data().isActive,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Xóa user (soft delete)
  async deleteUser(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return { success: false, error: 'User không tồn tại' };
      if (userDoc.data().isProtected) return { success: false, error: 'Không thể xóa tài khoản được bảo vệ' };
      await updateDoc(doc(db, 'users', uid), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lấy tất cả users
  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Auth] getAllUsers error:', error);
      return [];
    }
  },

  // Seed admin account — tạo lần đầu khi setup
  async seedAdmin() {
    try {
      // Kiểm tra xem đã có super_admin chưa
      const q = query(collection(db, 'users'), where('role', '==', 'super_admin'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { success: true, message: 'Admin đã tồn tại' };
      }

      // Tạo admin user với Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, 'admin@innohub.com', 'admin123');
      const user = userCredential.user;

      // Tạo Firestore document
      await setDoc(doc(db, 'users', user.uid), {
        name: 'Administrator',
        email: 'admin@innohub.com',
        role: 'super_admin',
        departmentId: null,
        avatar: null,
        phone: null,
        studentId: null,
        joinDate: '2024-01-01',
        bio: 'Quản trị viên hệ thống',
        points: 999,
        tasksCompleted: 0,
        isActive: true,
        isProtected: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, message: 'Đã tạo tài khoản admin' };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: true, message: 'Admin đã tồn tại' };
      }
      console.error('[Auth] Seed admin error:', error);
      return { success: false, error: error.message };
    }
  },
};
