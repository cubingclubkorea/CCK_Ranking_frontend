import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth';

/**
 * 로그아웃 페이지
 * 자동으로 로그아웃 처리 후 로그인 페이지로 리다이렉트
 */
export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        console.log('로그아웃 성공');
        
        // 로그인 페이지로 이동
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('로그아웃 실패:', error);
        
        // 에러가 발생해도 로그인 페이지로 이동
        navigate('/login', { replace: true });
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
