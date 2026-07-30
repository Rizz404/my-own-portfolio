export const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
};
