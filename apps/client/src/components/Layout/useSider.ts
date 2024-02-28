import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";

const hideSiderOnRoutes = ["/login", "/register"];

export function useSider() {
  const { pathname } = useLocation();
  const siderAllowed = !hideSiderOnRoutes.includes(pathname);
  const siderIsDrawer = useMediaQuery("(max-width: 900px)");

  return { siderAllowed, siderIsDrawer };
}
