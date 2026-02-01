import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { 
  DashboardPage,
  CompetitionTestPage, 
  CompetitionCUDTestPage, 
  CubeEventTestPage,
  RoundTestPage,
  RoundCUDTestPage,
  RecordTestPage,
  RecordCUDTestPage,
  ScrambleTestPage,
  ConfirmPage, 
  LogoutPage 
} from '@/pages';
import { LOGIN_URL } from '@/shared/config';
import { useEffect } from 'react';
import { Header } from '@/widgets';

/**
 * 로그인 페이지 리다이렉트 컴포넌트
 */
const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return null;
};

const AppLayout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

/**
 * 애플리케이션 라우트 설정
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'competition',
        element: <CompetitionTestPage />,
      },
      {
        path: 'competition/cud',
        element: <CompetitionCUDTestPage />,
      },
      {
        path: 'event',
        element: <CubeEventTestPage />,
      },
      {
        path: 'round',
        element: <RoundTestPage />,
      },
      {
        path: 'round/cud',
        element: <RoundCUDTestPage />,
      },
      {
        path: 'record',
        element: <RecordTestPage />,
      },
      {
        path: 'record/cud',
        element: <RecordCUDTestPage />,
      },
      {
        path: 'scramble',
        element: <ScrambleTestPage />,
      },
      {
        path: 'confirm',
        element: <ConfirmPage />,
      },
      {
        path: 'logout',
        element: <LogoutPage />,
      },
      {
        path: 'login',
        element: <LoginRedirect />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
