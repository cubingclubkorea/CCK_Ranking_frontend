import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getToken } from '@/features/auth/api/confirm';
import { setAccessToken } from '@/features/auth/utils/tokenStorage';
import { LOGIN_URL } from '@/shared';
import { MainPageSkeleton } from '@/widgets';

export const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    const code = searchParams.get('code');
    if (!code) {
      window.location.href = LOGIN_URL;
      return;
    }
    exchangedRef.current = true;

    const exchangeToken = async () => {
      try {
        const tokenResponse = await getToken(code);
        setAccessToken(tokenResponse.access_token);
        navigate('/', { replace: true });
      } catch {
        window.location.href = LOGIN_URL;
      }
    };
    void exchangeToken();
  }, [searchParams, navigate]);

  return <MainPageSkeleton />;
};
