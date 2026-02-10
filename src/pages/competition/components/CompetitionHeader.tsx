type CompetitionHeaderProps = {
  title: string;
  dateStart: Date;
  location?: string;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CompetitionHeader = ({ title, dateStart, location }: CompetitionHeaderProps) => {
  return (
    <div className="comp-title-area">
      <h1 className="comp-title">{title}</h1>
      <div className="comp-title-meta">
        <span className="comp-title-meta-item">{formatDate(dateStart)}</span>
        {location ? (
          <>
            <span className="comp-title-meta-divider">·</span>
            <span className="comp-title-meta-item">{location}</span>
          </>
        ) : null}
      </div>
    </div>
  );
};
