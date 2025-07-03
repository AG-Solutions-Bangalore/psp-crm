export const getWasteLevel = (waste, efficiency) => {
  if (waste < 0 || efficiency < 70) return "high";
  if (efficiency >= 90) return "optimal";
  if (efficiency >= 70) return "moderate";
  return "high";
};
