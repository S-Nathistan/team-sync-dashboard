import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser } from '../api/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = async (email, password) => {
    try {
      const { data } = await loginUser({ email, password });
      setAuth(data.user, data.access_token);
      toast.success('Logged in successfully');
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await registerUser(formData);
      setAuth(data.user, data.access_token);
      toast.success('Account created successfully');
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return { user, isAuthenticated, login, register, handleLogout, isManager, isAdmin };
}