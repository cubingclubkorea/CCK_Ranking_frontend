import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  MainPage,
  DashboardPage,
  CompetitionTestPage,
  CompetitionCUDTestPage,
  CompetitionPage,
  CubeEventTestPage,
  RoundTestPage,
  RoundCUDTestPage,
  RecordTestPage,
  RecordCUDTestPage,
  ScrambleTestPage,
  ConfirmPage,
  LogoutPage,
  NotFoundPage,
  ForbiddenPage,
  ComingSoonPage
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
        path: "comp/:compIdx",
        element: <CompetitionPage />,
      },
      {
        path: "record",
        element: <ComingSoonPage />,
      },
      {
        path: "ranking",
        element: <ComingSoonPage />,
      },
      {
        path: "profile",
        element: <ComingSoonPage />,
      },
      {
        path: "transfer-record",
        element: <ComingSoonPage />,
      },
      {
        path: "admin/member",
        element: <ForbiddenPage />,
      },
      {
        path: "admin/competition",
        element: <ForbiddenPage />,
      },
      {
        path: "admin/event",
        element: <ForbiddenPage />,
      },
      {
        path: "admin/oauth",
        element: <ForbiddenPage />,
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
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "dashboard/competition",
        element: <CompetitionTestPage />,
      },
      {
        path: "dashboard/competition/cud",
        element: <CompetitionCUDTestPage />,
      },
      {
        path: "dashboard/event",
        element: <CubeEventTestPage />,
      },
      {
        path: "dashboard/round",
        element: <RoundTestPage />,
      },
      {
        path: "dashboard/round/cud",
        element: <RoundCUDTestPage />,
      },
      {
        path: "dashboard/record",
        element: <RecordTestPage />,
      },
      {
        path: "dashboard/record/cud",
        element: <RecordCUDTestPage />,
      },
      {
        path: "dashboard/scramble",
        element: <ScrambleTestPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
