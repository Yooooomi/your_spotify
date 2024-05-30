import { Select, MenuItem } from "@mui/material";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import { changeStatUnit } from "../../../services/redux/modules/settings/thunk";
import { selectStatMeasurement } from "../../../services/redux/modules/user/selector";
import { useAppDispatch } from "../../../services/redux/tools";
import SettingLine from "../SettingLine";
import s from "./index.module.css";

const units = [
  { name: "Count", value: "number" },
  { name: "Duration", value: "duration" },
];

export function StatMeasurement() {
  const dispatch = useAppDispatch();
  const statMeasurement = useSelector(selectStatMeasurement);

  const handleChangeStatMeasurement = useCallback(
    (newStatUnit: string | null | undefined) => {
      if (newStatUnit !== "number" && newStatUnit !== "duration") {
        return;
      }
      dispatch(changeStatUnit(newStatUnit ?? "number")).catch(console.error);
    },
    [dispatch],
  );

  return (
    <TitleCard title="Stat measurement used">
      <Text element="span" className={s.marginbottom}>
        Measurement used to compute most listened elements.
      </Text>
      <SettingLine
        left="Stat measurement"
        right={
          <Select
            variant="standard"
            value={statMeasurement}
            onChange={ev => handleChangeStatMeasurement(ev.target.value)}>
            {units.map(unit => (
              <MenuItem key={unit.value} value={unit.value}>
                {unit.name}
              </MenuItem>
            ))}
          </Select>
        }
      />
    </TitleCard>
  );
}
