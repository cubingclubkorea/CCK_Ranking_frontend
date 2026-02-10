import { useEffect, useState } from "react";
import { MenuItem } from "./MenuItem";
import { authChangeEvent, hasAccessToken } from "@/features/auth/utils/tokenStorage";

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [isLoggedIn, setIsLoggedIn] = useState(hasAccessToken());
  const icons = {
    list: "/icon/sidebar/list.svg",
    record: "/icon/sidebar/record.svg",
    trophy: "/icon/sidebar/trophy.svg",
    person: "/icon/sidebar/person.svg",
    personData: "/icon/sidebar/person-data.svg",
    pencil: "/icon/sidebar/pencil.svg",
    cube: "/icon/sidebar/cube.svg",
    card: "/icon/sidebar/card.svg",
    lock: "/icon/sidebar/lock.svg",
    form: "/icon/sidebar/form.svg",
  };

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(hasAccessToken());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* 일반 메뉴 */}
      <div className="menu-group">
        <MenuItem text="대회 목록" icon={icons.list} to="/" />
        <MenuItem text="신기록" icon={icons.record} to="/record" />
        <MenuItem text="랭킹" icon={icons.trophy} to="/ranking" />
        {isLoggedIn && <MenuItem text="나의 정보" icon={icons.person} to="/profile/" />}
        {isLoggedIn && <MenuItem text="기록 이전 신청" icon={icons.form} to="/transfer-record" />}
      </div>

      <div className="sidebar-divider" />

      {/* 관리자 메뉴 */}
      <div className="admin-group">
        <MenuItem text="회원 관리" icon={icons.personData} to="/admin/member" />
        <MenuItem text="대회 관리" icon={icons.pencil} to="/admin/competition" />
        <MenuItem text="큐브 종목 관리" icon={icons.cube} to="/admin/event" />
        <MenuItem text="OAuth 관리" icon={icons.lock} to="/admin/oauth" />
        <MenuItem text="API 대시보드" icon={icons.lock} to="/admin/api-dashboard" />
      </div>
    </aside>
  );
}

export default Sidebar;
