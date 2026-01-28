import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CompetitionTestPage, ConfirmPage, LogoutPage } from '@/pages';

/**
 * 애플리케이션 라우트 설정
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <CompetitionTestPage />,
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
    element: <div>로그인 페이지 (구현 예정)</div>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
