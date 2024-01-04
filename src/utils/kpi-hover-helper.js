export const formatKpiHoverDatime = (dateClause) =>
  !dateClause
    ? null
    : dateClause.startsWith("'")
    ? new Intl.DateTimeFormat('default', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
        .format(new Date(dateClause.substring(1, dateClause.length - 1)))
        .replace(/[APM]{2}/, (match) => match.toLowerCase())
    : dateClause.toLowerCase();
