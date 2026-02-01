import { useNavigate } from 'react-router-dom'

function Header() {
  return (
    <header className="header">

      <div className="header-left">
        <img src="/ranking-black.png" className="logo" />
      </div>

      <nav className="header-center">
        <a
          className="menu"
          href="https://cubingclub.com"
          target="_self"
        >
          Home
        </a>

        <a
          className="menu active"
          href="https://ranking.cubingclub.com"
          target="_self"
        >
          Ranking
        </a>

        <a
          className="menu"
          href="https://payment.cubingclub.com"
          target="_self"
        >
          Payment
        </a>

        <a
          className="menu"
          href="https://recorder.cubingclub.com"
          target="_self"
>
          Recorder
        </a>
      </nav>

      {/* 오른쪽 */}
      <div className="header-right">
        <button className="login-btn">로그인</button>
      </div>
    </header>
  )
}

export default Header