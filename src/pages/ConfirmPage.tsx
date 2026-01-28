import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getToken } from '@/features/auth/api/confirm';
import { setAccessToken } from '@/features/auth/utils/tokenStorage';

/**
 * OAuth 인증 콜백 페이지
 * SSO에서 리다이렉트된 후 code를 받아 토큰으로 교환
 */
export const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      console.error('인증 코드가 없습니다');
      navigate('/login');
      return;
    }

    const exchangeToken = async () => {
      try {
        const tokenResponse = await getToken(code);
        
        // Access Token 저장
        setAccessToken(tokenResponse.access_token);
        
        console.log('로그인 성공:', tokenResponse);
        
        // 메인 페이지로 이동
        navigate('/');
      } catch (error) {
        console.error('토큰 교환 실패:', error);
        navigate('/login');
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
