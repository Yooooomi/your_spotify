import { Select, MenuItem } from "@mui/material";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import { changeTimezone } from "../../../services/redux/modules/settings/thunk";
import { selectTimezone } from "../../../services/redux/modules/user/selector";
import { useAppDispatch } from "../../../services/redux/tools";
import SettingLine from "../SettingLine";
import { timezones } from "./timezones";
import s from "./index.module.css";

export default function Timezone() {
  const dispatch = useAppDispatch();
  const currentTimezone = useSelector(selectTimezone);

  const handleChangeTimezone = useCallback(
    (newTimezone: string | null | undefined) => {
      if (newTimezone === "follow") {
        newTimezone = null;
      }
      dispatch(changeTimezone(newTimezone)).catch(console.error);
    },
    [dispatch],
  );

  return (
    <TitleCard title="Timezone">
      <Text element="span" className={s.marginbottom}>
        Statistics computed by the server need to know your timezone. Change
        this if your history does not match computed stats.
      </Text>
      <SettingLine
        left="Timezone"
        right={
          <Select
            variant="standard"
            value={currentTimezone}
            onChange={ev => handleChangeTimezone(ev.target.value)}>
            <MenuItem value="follow">Default timezone</MenuItem>
            {timezones.map(timezone => (
              <MenuItem key={timezone} value={timezone}>
                {timezone}
              </MenuItem>
            ))}
          </Select>
        }
      />
    </TitleCard>
  );
}
