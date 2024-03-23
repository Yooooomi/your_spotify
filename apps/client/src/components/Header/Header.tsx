import { IconButton } from "@mui/material";
import { Menu } from "@mui/icons-material";
import React, { useCallback, useContext, ReactNode } from "react";
import { useSelector } from "react-redux";
import { IntervalDetail } from "../../services/intervals";
import { setDataInterval } from "../../services/redux/modules/user/reducer";
import { selectIntervalDetail } from "../../services/redux/modules/user/selector";
import { intervalDetailToRedux } from "../../services/redux/modules/user/utils";
import { useAppDispatch } from "../../services/redux/tools";
import { IntervalSelector } from "../IntervalSelector";
import Text from "../Text";
import { LayoutContext } from "../Layout/LayoutContext";
import { useSider } from "../Layout/useSider";
import s from "./index.module.css";

interface HeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title: React.ReactNode;
  tinyTitle?: string;
  subtitle: ReactNode;
  hideInterval?: boolean;
}

export default function Header({
  left,
  right,
  title,
  tinyTitle,
  subtitle,
  hideInterval,
}: HeaderProps) {
  const dispatch = useAppDispatch();
  const intervalDetail = useSelector(selectIntervalDetail);
  const layoutContext = useContext(LayoutContext);
  const { siderAllowed, siderIsDrawer } = useSider();

  const changeInterval = useCallback(
    (newInterval: IntervalDetail) => {
      dispatch(setDataInterval(intervalDetailToRedux(newInterval)));
    },
    [dispatch],
  );

  return (
    <div className={s.root}>
      <div className={s.left}>
        {siderAllowed && siderIsDrawer && (
          <IconButton
            onClick={layoutContext.openDrawer}
            className={s.drawerbutton}>
            <Menu />
          </IconButton>
        )}
        {left}
        <div className={s.texts}>
          <Text element="h1">
            {siderIsDrawer && tinyTitle ? tinyTitle : title}
          </Text>
          {!siderIsDrawer && <Text>{subtitle}</Text>}
        </div>
      </div>
      {right}
      {!hideInterval && (
        <div>
          <IntervalSelector value={intervalDetail} onChange={changeInterval} />
        </div>
      )}
    </div>
  );
}
