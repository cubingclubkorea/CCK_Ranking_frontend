import { useNavigate } from "react-router-dom";

export const ComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="error">
            <div className="coming-soon-title">Coming Soon</div>
            <div className="error-title">현재 개발 중인 기능입니다</div>
            <div className="error-desc">곧 편리한 서비스를 제공해드릴게요</div>
            <button className="error-btn" onClick={() => navigate("/")}>
                <img className="error-btn-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
                홈으로 돌아가기
            </button>
        </div>
    );
};
