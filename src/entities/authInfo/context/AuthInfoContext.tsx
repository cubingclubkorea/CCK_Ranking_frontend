import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthInfo, type AuthInfoResponse } from "../api/getAuthInfo";
import { authChangeEvent, getAccessToken, getAuthUserProfile } from "@/features/auth/utils/tokenStorage";

type AuthInfoContextValue = {
  authInfo: AuthInfoResponse | null;
  loading: boolean;
  refetch: () => void;
};

const AuthInfoContext = createContext<AuthInfoContextValue>({
  authInfo: null,
  loading: false,
  refetch: () => {},
});

export const AuthInfoProvider = ({ children }: { children: ReactNode }) => {
  const [authInfo, setAuthInfo] = useState<AuthInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(getAccessToken());

  useEffect(() => {
    const syncAuthState = () => setToken(getAccessToken());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const fetchAuthInfo = useCallback(async () => {
    const profile = token ? getAuthUserProfile() : null;
    const cckId = profile?.cckId?.trim();

    if (!token || !cckId) {
      setAuthInfo(null);
      return;
    }

    setLoading(true);
    try {
      const info = await getAuthInfo(cckId);
      setAuthInfo(info);
    } catch {
      setAuthInfo(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAuthInfo();
  }, [fetchAuthInfo]);

  return (
    <AuthInfoContext.Provider value={{ authInfo, loading, refetch: fetchAuthInfo }}>
      {children}
    </AuthInfoContext.Provider>
  );
};

export const useAuthInfo = () => useContext(AuthInfoContext);
