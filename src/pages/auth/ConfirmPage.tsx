import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getToken } from '@/features/auth/api/confirm';
import { setAccessToken } from '@/features/auth/utils/tokenStorage';
import { LOGIN_URL } from '@/shared';
import { MainPageSkeleton } from '@/widgets';

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

  return <MainPageSkeleton />;
};
