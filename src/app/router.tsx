import { createBrowserRouter, Navigate } from 'react-router-dom';
import { 
  CompetitionTestPage, 
  CompetitionCUDTestPage, 
  CubeEventTestPage,
  RoundTestPage,
  RoundCUDTestPage,
  ScrambleTestPage,
  ConfirmPage, 
  LogoutPage 
} from '@/pages';
import { LOGIN_URL } from '@/shared/config';
import { useEffect } from 'react';

/**
 * 로그인 페이지 리다이렉트 컴포넌트
 */
const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return null;
};

/**
 * 애플리케이션 라우트 설정
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <CompetitionTestPage />,
  },
  {
    path: '/competition/cud',
    element: <CompetitionCUDTestPage />,
  },
  {
    path: '/event',
    element: <CubeEventTestPage />,
  },
  {
    path: '/round',
    element: <RoundTestPage />,
  },
  {
    path: '/round/cud',
    element: <RoundCUDTestPage />,
  },
  {
    path: '/scramble',
    element: <ScrambleTestPage />,
  },
  {
    path: '/confirm',
    element: <ConfirmPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  {
    path: '/login',
    element: <LoginRedirect />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
