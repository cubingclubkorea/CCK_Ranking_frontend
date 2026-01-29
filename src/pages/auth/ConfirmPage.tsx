import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getToken } from '@/features/auth/api/confirm';
import { setAccessToken } from '@/features/auth/utils/tokenStorage';
import { LOGIN_URL } from '@/shared';

export const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      window.location.href=LOGIN_URL;
      return;
    }

    const exchangeToken = async () => {
      try {
        const tokenResponse = await getToken(code);
        setAccessToken(tokenResponse.access_token);
        navigate('/');
      } catch (error) {
        window.location.href=LOGIN_URL;
      }
    };
    exchangeToken();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};
