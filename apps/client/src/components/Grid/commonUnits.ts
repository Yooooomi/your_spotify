export const commonUnits = {
  cover: "48px",
  options: "32px",
  duration: "120px",
  date: "200px",
  mainTitle: "3fr",
  secondaryTitle: "2fr",
  percentage: (isMobile: boolean) => (isMobile ? "50px" : "140px"),
} as const;
