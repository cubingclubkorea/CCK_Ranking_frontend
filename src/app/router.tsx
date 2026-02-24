import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import {
  MainPage,
  ApiDashboardPage,
  ApiDashboardCompetitionTestPage,
  ApiDashboardCompetitionCUDTestPage,
  CompetitionPage,
  RoundPage,
  RankingPage,
  NewRecordPage,
  ProfilePage,
  ProfileRecordHistoryPage,
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
  RoundProjectorPage,
  EventAdminPage,
  ScrambleAdminPage,
  ConfirmPage,
  LogoutPage,
  NotFoundPage,
  ForbiddenPage,
  ComingSoonPage
} from "@/pages";
import { LOGIN_URL } from "@/shared/config";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { Header, Sidebar } from "@/widgets";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";
import { AuthInfoProvider } from "@/entities/authInfo";

type ThemeMode = "light" | "dark";
const THEME_STORAGE_KEY = "cck-ranking-theme";
const MOBILE_LAYOUT_QUERY = "(max-width: 820px)";
const VIEWPORT_HEIGHT_CSS_VAR = "--app-vh";

const getInitialTheme = (): ThemeMode => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialMobileLayout = (): boolean => window.matchMedia(MOBILE_LAYOUT_QUERY).matches;

const syncViewportHeightVar = () => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty(VIEWPORT_HEIGHT_CSS_VAR, `${Math.round(viewportHeight)}px`);
};

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
  const location = useLocation();
  const isProjectorRoute = /\/admin\/competition\/[^/]+\/round\/[^/]+\/projector$/.test(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(getInitialMobileLayout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);
    const syncMobileLayout = (event: MediaQueryListEvent) => {
      setIsMobileLayout(event.matches);
    };
    setIsMobileLayout(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncMobileLayout);
    return () => mediaQuery.removeEventListener("change", syncMobileLayout);
  }, []);

  useEffect(() => {
    syncViewportHeightVar();

    const handleViewportChange = () => {
      syncViewportHeightVar();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileMenuOpen(false);
    }
  }, [isMobileLayout]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileLayout || !mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileLayout, mobileMenuOpen]);

  const handleSidebarToggle = () => {
    if (isMobileLayout) {
      setMobileMenuOpen((prev) => !prev);
      return;
    }
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <AuthInfoProvider>
      <div className="app-layout">
        {isProjectorRoute ? null : (
          <>
            <Header
              collapsed={sidebarCollapsed}
              onToggle={handleSidebarToggle}
              theme={theme}
              isMobile={isMobileLayout}
              mobileMenuOpen={mobileMenuOpen}
            />
            <Sidebar
              collapsed={!isMobileLayout && sidebarCollapsed}
              isMobile={isMobileLayout}
              mobileOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              theme={theme}
              onToggleTheme={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            />
          </>
        )}
        <main
          className={`content-area ${isProjectorRoute ? "content-area--projector" : ""} ${!isProjectorRoute && !isMobileLayout && sidebarCollapsed ? "collapsed" : ""} ${!isProjectorRoute && isMobileLayout && mobileMenuOpen ? "mobile-menu-open" : ""}`}
        >
          <div className={`content-inner ${isProjectorRoute ? "content-inner--projector" : ""}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </AuthInfoProvider>
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
        path: "new-record",
        element: <NewRecordPage />,
      },
      {
        path: "ranking",
        element: <RankingPage />,
      },
      {
        path: "profile/:cckId",
        element: <ProfilePage />,
      },
      {
        path: "profile/:cckId/new-record/:event",
        element: <ProfileRecordHistoryPage />,
      },
      {
        path: "settings",
        element: <ComingSoonPage />,
      },
      {
        path: "transfer-record",
        element: <ComingSoonPage />,
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
        path: "admin/competition/:compIdx/round/:roundIdx/projector",
        element: <RoundProjectorPage />,
      },
      {
        path: "admin/competition/:compIdx/scramble",
        element: (
          <AdminRoute>
            <ScrambleAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/event",
        element: (
          <AdminRoute>
            <EventAdminPage />
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
        path: "admin/api-dashboard/new-record",
        element: (
          <AdminRoute>
            <ApiDashboardRecordTestPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/api-dashboard/new-record/cud",
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
