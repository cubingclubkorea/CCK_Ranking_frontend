import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";

type PageHeaderAction = {
  label: ReactNode;
  iconSrc?: string;
  iconClassName?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  adminOnly?: boolean;
  adminLoginOnly?: boolean;
};

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconSrc?: string;
  containerClassName?: string;
  titleAreaClassName?: string;
  titleTextClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  actions?: PageHeaderAction[];
};

const isVisibleAction = (action: PageHeaderAction, isAdmin: boolean) => {
  if (action.adminOnly && !isAdmin) return false;
  if (action.adminLoginOnly && isAdmin) return false;
  return true;
};

export const PageHeader = ({
  title,
  subtitle,
  icon,
  iconSrc,
  containerClassName = "comp-header",
  titleAreaClassName = "page-title-area round-title-area",
  titleTextClassName = "round-title-text",
  titleClassName = "page-title",
  subtitleClassName = "page-title-meta",
  actions = [],
}: PageHeaderProps) => {
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

  const visibleActions = useMemo(
    () => actions.filter((action) => isVisibleAction(action, isAdmin)),
    [actions, isAdmin]
  );

  return (
    <div className={containerClassName}>
      <div className={titleAreaClassName}>
        {icon ? (
          <div className="page-title-icon" aria-hidden="true">
            {icon}
          </div>
        ) : iconSrc ? (
          <div className="page-title-icon" aria-hidden="true">
            <img src={iconSrc} alt="" loading="lazy" />
          </div>
        ) : null}

        <div className={titleTextClassName}>
          <h1 className={titleClassName}>{title}</h1>
          {subtitle ? <div className={subtitleClassName}>{subtitle}</div> : null}
        </div>
      </div>

      {visibleActions.length > 0 ? (
        <div className="page-actions">
          {visibleActions.map((action, index) => {
            const className = action.className ?? "page-action-btn";
            const iconNode = action.iconSrc ? (
              <img
                className={action.iconClassName ?? "page-action-icon"}
                src={action.iconSrc}
                alt=""
                aria-hidden="true"
              />
            ) : null;
            const key = `${typeof action.label === "string" ? action.label : "action"}-${index}`;

            if (action.to && !action.disabled) {
              return (
                <Link key={key} className={className} to={action.to}>
                  {iconNode}
                  {action.label}
                </Link>
              );
            }

            if (action.href && !action.disabled) {
              return (
                <a key={key} className={className} href={action.href}>
                  {iconNode}
                  {action.label}
                </a>
              );
            }

            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {iconNode}
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
