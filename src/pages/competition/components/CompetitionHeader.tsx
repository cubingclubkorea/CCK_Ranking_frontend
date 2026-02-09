type CompetitionHeaderProps = {
  title: string;
  dateStart: Date;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CompetitionHeader = ({ title, dateStart }: CompetitionHeaderProps) => {
  return (
    <div className="comp-title-area">
      <div className="comp-title-label">대회</div>
      <h1 className="comp-title">{title}</h1>
      <div className="comp-title-meta">{formatDate(dateStart)}</div>
    </div>
  );
};
