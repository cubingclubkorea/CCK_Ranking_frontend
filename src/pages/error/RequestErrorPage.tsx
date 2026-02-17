import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { classifyRequestError } from "@/shared";

type RequestErrorPageProps = {
  message?: string | null;
};

export const RequestErrorPage = ({ message }: RequestErrorPageProps) => {
  const navigate = useNavigate();
  const errorKind = classifyRequestError(message);

  const template = useMemo(() => {
    if (errorKind === "unauthorized") {
      return {
        code: "401",
        title: "로그인이 필요합니다",
        description: "인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.",
      };
    }

    return {
      code: "500",
      title: "서버의 통신이 실패했습니다.",
      description: "인터넷 연결을 확인하고 다시 시도해주세요.",
    };
  }, [errorKind]);

  return (
    <div className="error">
      <div className="error-code">{template.code}</div>
      <div className="error-title">{template.title}</div>
      <div className="error-desc">{template.description}</div>
      <button className="error-btn" onClick={() => navigate("/")}>
        <img className="error-btn-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
        홈으로 돌아가기
      </button>
    </div>
  );
};
