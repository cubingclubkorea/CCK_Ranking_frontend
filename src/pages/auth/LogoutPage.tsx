import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth';
import { LOGIN_URL } from '@/shared';

export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        window.location.href=LOGIN_URL;
      } catch (error) {
        window.location.href=LOGIN_URL;
      }
    };
    handleLogout();
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div>
        <h2>로그아웃 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};
