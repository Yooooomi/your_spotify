import React, { useMemo, useState } from "react";
import { Drawer } from "@mui/material";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { selectPublicToken } from "../../services/redux/modules/user/selector";
import Text from "../Text";
import s from "./index.module.css";
import Sider from "./Sider";
import { LayoutContext } from "./LayoutContext";
import { useSider } from "./useSider";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const { siderAllowed, siderIsDrawer } = useSider();

  const publicToken = useSelector(selectPublicToken);

  const layoutContextValue = useMemo(
    () => ({
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
    }),
    [],
  );

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className={s.root}>
        {siderAllowed && siderIsDrawer && (
          <Drawer open={open} anchor="left" onClose={() => setOpen(false)}>
            <Sider isDrawer />
          </Drawer>
        )}
        <section className={s.sider}>
          {siderAllowed && !siderIsDrawer && <Sider />}
        </section>
        <section
          className={clsx({
            [s.content]: true,
            [s.contentdrawer]: siderAllowed && !siderIsDrawer,
          })}>
          {publicToken && (
            <div className={s.publictoken}>
              <Text>You are viewing as guest</Text>
            </div>
          )}
          {children}
        </section>
      </div>
    </LayoutContext.Provider>
  );
}
