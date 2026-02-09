import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  MainPage,
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
  LogoutPage,
  NotFoundPage,
} from "@/pages";
import { LOGIN_URL } from "@/shared/config";
import { useEffect, useState } from "react";
import { Header, Sidebar } from "@/widgets";

/**
 * 로그인 페이지 리다이렉트 컴포넌트
 */
// eslint-disable-next-line react-refresh/only-export-components
const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return null;
};

const
    // eslint-disable-next-line react-refresh/only-export-components
    AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Header
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />
      <Sidebar collapsed={sidebarCollapsed} />
      <main className={`content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/**
 * 애플리케이션 라우트 설정
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "competition",
        element: <CompetitionTestPage />,
      },
      {
        path: "competition/cud",
        element: <CompetitionCUDTestPage />,
      },
      {
        path: "event",
        element: <CubeEventTestPage />,
      },
      {
        path: "round",
        element: <RoundTestPage />,
      },
      {
        path: "round/cud",
        element: <RoundCUDTestPage />,
      },
      {
        path: "record",
        element: <RecordTestPage />,
      },
      {
        path: "record/cud",
        element: <RecordCUDTestPage />,
      },
      {
        path: "scramble",
        element: <ScrambleTestPage />,
      },
      {
        path: "confirm",
        element: <ConfirmPage />,
      },
      {
        path: "logout",
        element: <LogoutPage />,
      },
      {
        path: "login",
        element: <LoginRedirect />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
