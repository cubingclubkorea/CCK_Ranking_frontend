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
  RoundRecordEditPage,
  ConfirmPage,
  LogoutPage,
  NotFoundPage,
  ForbiddenPage,
  ComingSoonPage
} from "@/pages";
import { LOGIN_URL } from "@/shared/config";
import { useEffect, useState, type ReactNode } from "react";
import { Header, Sidebar } from "@/widgets";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";

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

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(hasAdminRole());

  useEffect(() => {
    const syncAuthState = () => setIsAdmin(hasAdminRole());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
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
        element: (
          <AdminRoute>
            <ComingSoonPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/competition",
        element: (
          <AdminRoute>
            <CompetitionAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/competition/create",
        element: (
          <AdminRoute>
            <CompetitionCreatePage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/competition/:compIdx",
        element: (
          <AdminRoute>
            <CompetitionManagePage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/competition/:compIdx/round/:roundIdx",
        element: (
          <AdminRoute>
            <RoundRecordEditPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/event",
        element: (
          <AdminRoute>
            <ComingSoonPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/oauth",
        element: (
          <AdminRoute>
            <ComingSoonPage />
          </AdminRoute>
        ),
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
        element: (
          <AdminRoute>
            <ApiDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/competition",
        element: (
          <AdminRoute>
            <ApiDashboardCompetitionTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/competition/cud",
        element: (
          <AdminRoute>
            <ApiDashboardCompetitionCUDTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/event",
        element: (
          <AdminRoute>
            <ApiDashboardCubeEventTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/round",
        element: (
          <AdminRoute>
            <ApiDashboardRoundTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/round/cud",
        element: (
          <AdminRoute>
            <ApiDashboardRoundCUDTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/record",
        element: (
          <AdminRoute>
            <ApiDashboardRecordTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/record/cud",
        element: (
          <AdminRoute>
            <ApiDashboardRecordCUDTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/scramble",
        element: (
          <AdminRoute>
            <ApiDashboardScrambleTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
