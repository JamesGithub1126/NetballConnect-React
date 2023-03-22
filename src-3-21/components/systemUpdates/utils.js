export const getLast3MonthsDate = () => {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
};
