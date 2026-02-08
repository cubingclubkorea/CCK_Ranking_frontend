type CompVariant = "default" | "ongoing" | "ended";

export type CompListItem = {
  title: string;
  meta: string;
  badge: string;
  variant?: CompVariant;
};

type CompListProps = {
  items: CompListItem[];
  emptyText?: string;
};

const getVariantClass = (variant?: CompVariant) => {
  if (!variant || variant === "default") return "";
  return variant;
};

const CompList = ({ items, emptyText }: CompListProps) => {
  return (
    <div className="card-list-group">
      {items.length === 0 ? (
        <div className="card-list-empty">
          {emptyText ?? "등록된 항목이 없습니다."}
        </div>
      ) : (
        items.map((item, index) => {
          const variantClass = getVariantClass(item.variant);
          return (
            <div
              className={`card-list ${variantClass}`.trim()}
              key={`${item.title}-${index}`}
            >
              <div className="card-list-body">
                <div className="card-list-title">{item.title}</div>
                <div className="card-list-meta">{item.meta}</div>
              </div>
              <span className={`card-list-pill ${variantClass}`.trim()}>
                {item.badge}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CompList;
