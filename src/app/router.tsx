import { createBrowserRouter, Outlet } from "react-router-dom";
import {
  MainPage,
  ApiDashboardPage,
  ApiDashboardCompetitionTestPage,
  ApiDashboardCompetitionCUDTestPage,
  CompetitionPage,
  RoundPage,
  ApiDashboardCubeEventTestPage,
  ApiDashboardRoundTestPage,
  ApiDashboardRoundCUDTestPage,
  ApiDashboardRecordTestPage,
  ApiDashboardRecordCUDTestPage,
  ApiDashboardScrambleTestPage,
  CompetitionAdminPage,
  CompetitionCreatePage,
  CompetitionManagePage,
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
        path: "competition/:compIdx",
        element: <CompetitionPage />,
      },
      {
        path: "competition/:compIdx/round/:roundIdx",
        element: <RoundPage />,
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
        element: <CompetitionAdminPage />,
      },
      {
        path: "admin/competition/create",
        element: <CompetitionCreatePage />,
      },
      {
        path: "admin/competition/:compIdx",
        element: <CompetitionManagePage />,
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
        path: "admin/api-dashboard",
        element: <ApiDashboardPage />,
      },
      {
        path: "admin/api-dashboard/competition",
        element: <ApiDashboardCompetitionTestPage />,
      },
      {
        path: "admin/api-dashboard/competition/cud",
        element: <ApiDashboardCompetitionCUDTestPage />,
      },
      {
        path: "admin/api-dashboard/event",
        element: <ApiDashboardCubeEventTestPage />,
      },
      {
        path: "admin/api-dashboard/round",
        element: <ApiDashboardRoundTestPage />,
      },
      {
        path: "admin/api-dashboard/round/cud",
        element: <ApiDashboardRoundCUDTestPage />,
      },
      {
        path: "admin/api-dashboard/record",
        element: <ApiDashboardRecordTestPage />,
      },
      {
        path: "admin/api-dashboard/record/cud",
        element: <ApiDashboardRecordCUDTestPage />,
      },
      {
        path: "admin/api-dashboard/scramble",
        element: <ApiDashboardScrambleTestPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
