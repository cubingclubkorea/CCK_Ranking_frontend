import { MenuItem } from "./MenuItem";

function Sidebar({ collapsed }: { collapsed: boolean }) {
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

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* 일반 메뉴 */}
      <div className="menu-group">
        <MenuItem text="대회 목록" icon={icons.list} to="/" />
        <MenuItem text="신기록" icon={icons.record} to="/record" />
        <MenuItem text="랭킹" icon={icons.trophy} to="/ranking" />
        <MenuItem text="나의 정보" icon={icons.person} to="/profile/" />
        <MenuItem text="기록 이전 신청" icon={icons.form} to="/transfer-record" />
      </div>

      <div className="sidebar-divider" />

      {/* 관리자 메뉴 */}
      <div className="admin-group">
        <MenuItem text="회원 관리" icon={icons.personData} to="/admin/member" />
        <MenuItem text="대회 관리" icon={icons.pencil} to="/admin/competition" />
        <MenuItem text="큐브 종목 관리" icon={icons.cube} to="/admin/event" />
        <MenuItem text="OAuth 관리" icon={icons.lock} to="/admin/oauth" />
      </div>
    </aside>
  );
}

export default Sidebar;
