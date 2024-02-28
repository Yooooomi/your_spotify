import { createContext } from "react";

export const LayoutContext = createContext({
  openDrawer: () => {},
  closeDrawer: () => {},
});
