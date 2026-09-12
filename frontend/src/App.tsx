import { useEffect } from 'react';
import ChatPage from './pages/ChatPage';
import AdminPanel from './pages/AdminPanel';
import LoginContainer from './components/LoginContainer';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import './styles/globals.css';

export default function App() {
  const user = useAuthStore((state) => state.user);
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  const isAdminOpen = useChatStore((state) => state.isAdminOpen);
  const openAdmin = useChatStore((state) => state.openAdmin);
  const closeAdmin = useChatStore((state) => state.closeAdmin);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuthListener]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        openAdmin();
      } else {
        closeAdmin();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [openAdmin, closeAdmin]);

  // If Admin Panel is open, display Admin Dashboard
  if (isAdminOpen) {
    return <AdminPanel onBackToChat={closeAdmin} />;
  }

  if (!user) {
    return <LoginContainer />;
  }

  return <ChatPage />;
}

