export type HistoryFilter = "this_month" | "last_month" | "all" | "custom";

export type HistoryDateRange = {
  startDate?: string;
  endDate?: string;
};

export const HISTORY_PAGE_SIZE = 40;

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getHistoryDateRange = (
  filter: HistoryFilter,
  customStartDate: Date,
  customEndDate: Date,
  now = new Date(),
): HistoryDateRange => {
  if (filter === "all") {
    return {};
  }

  if (filter === "custom") {
    const start =
      customStartDate <= customEndDate ? customStartDate : customEndDate;
    const end = customStartDate <= customEndDate ? customEndDate : customStartDate;

    return {
      startDate: formatLocalDate(start),
      endDate: formatLocalDate(end),
    };
  }

  const year = now.getFullYear();
  const month = filter === "last_month" ? now.getMonth() - 1 : now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
  };
};

export const getHistoryRangeKey = ({
  startDate,
  endDate,
}: HistoryDateRange) => `${startDate ?? "all"}:${endDate ?? "all"}`;
